import { useConfiguration } from '@/lib/hooks/useConfiguration';
import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  Observable,
  split,
} from '@apollo/client';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';
import { onError } from '@apollo/client/link/error';
import { Subscription } from 'zen-observable-ts';
import { APP_NAME } from '../utils/constants';
import { firebaseAuth } from '../services';
import { getCachedAuthToken, setCachedAuthToken } from '../utils/auth-token';
import { useMemo } from 'react';

export const useSetupApollo = (): ApolloClient<NormalizedCacheObject> => {
  const { SERVER_URL, WS_SERVER_URL } = useConfiguration();

  // 1. Memoize URLs and shared Logic
  const urls = useMemo(() => {
    const graphqlUrl = `${SERVER_URL.replace(/\/$/, '')}/graphql`;
    let wsGraphqlUrl = WS_SERVER_URL.replace(/\/$/, '');
    if (!wsGraphqlUrl.endsWith('/graphql')) {
      wsGraphqlUrl = `${wsGraphqlUrl}/graphql`;
    }
    return { graphqlUrl, wsGraphqlUrl };
  }, [SERVER_URL, WS_SERVER_URL]);

  // 2. Initialize token cache early
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem(`user-${APP_NAME}`);
      if (data) {
        const token = JSON.parse(data).token;
        if (token) {
          setCachedAuthToken(token);
        }
      }
    } catch (error) {
      // Ignore
    }
  }

  // 3. Define the token utility (inside hook to access APP_NAME if needed, though it's a constant)
  const getAuthorizationToken = async (): Promise<string | null> => {
    if (typeof window === 'undefined') return null;

    // A. Custom Token (Backend Login)
    try {
      const data = localStorage.getItem(`user-${APP_NAME}`);
      if (data) {
        const token = JSON.parse(data).token;
        if (token) {
          setCachedAuthToken(token);
          return token;
        }
      }
    } catch (error) {
      console.error('[Apollo] Stored token error:', error);
    }

    // B. Firebase Stored token
    try {
      const storedFirebaseToken = localStorage.getItem(`firebase-${APP_NAME}`);
      if (storedFirebaseToken) {
        setCachedAuthToken(storedFirebaseToken);
        return storedFirebaseToken;
      }
    } catch (error) {
      console.error('[Apollo] Firebase stored token error:', error);
    }

    // C. Live Firebase Token
    try {
      const currentUser = firebaseAuth.currentUser;
      if (currentUser) {
        const idToken = await currentUser.getIdToken();
        setCachedAuthToken(idToken);
        return idToken;
      }
    } catch (error) {
      console.error('[Apollo] Firebase live token error:', error);
    }

    return null;
  };

  // 4. Memoize the Apollo Client
  const client = useMemo(() => {
    const cache = new InMemoryCache();

    const httpLink = createHttpLink({
      uri: urls.graphqlUrl,
      fetchOptions: {
        mode: 'cors',
        credentials: 'omit',
      },
    });

    const subscriptionClient = new SubscriptionClient(urls.wsGraphqlUrl, {
      reconnect: true,
      timeout: 30000,
      lazy: true,
      connectionParams: async () => {
        const token = await getAuthorizationToken();
        return {
          authorization: token ? `Bearer ${token}` : '',
          Authorization: token ? `Bearer ${token}` : '', // Support both cases
        };
      },
    });

    const wsLink = new WebSocketLink(subscriptionClient);

    const errorLink = onError(({ networkError, graphQLErrors, operation }) => {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) =>
          console.error(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          )
        );
      }
      if (networkError) {
        console.error(`[Network error]: ${networkError}`, networkError);
      }
    });

    const authLink = new ApolloLink(
      (operation, forward) =>
        new Observable((observer) => {
          let handle: Subscription | undefined;
          getAuthorizationToken()
            .then((token) => {
              operation.setContext(({ headers = {} }) => ({
                headers: {
                  ...headers,
                  authorization: token ? `Bearer ${token}` : '',
                },
              }));
              handle = forward(operation).subscribe({
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
              });
            })
            .catch(observer.error.bind(observer));

          return () => {
            if (handle) handle.unsubscribe();
          };
        })
    );

    const splitLink = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      ApolloLink.from([authLink, httpLink])
    );

    return new ApolloClient({
      link: ApolloLink.from([errorLink, splitLink]),
      cache,
      connectToDevTools: true,
    });
  }, [urls.graphqlUrl, urls.wsGraphqlUrl]);

  return client;
};
