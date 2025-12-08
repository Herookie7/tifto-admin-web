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

export const useSetupApollo = (): ApolloClient<NormalizedCacheObject> => {
  const { SERVER_URL, WS_SERVER_URL } = useConfiguration();

  const cache = new InMemoryCache();

  const httpLink = createHttpLink({
    uri: `${SERVER_URL}graphql`,
    fetchOptions: {
      mode: 'cors',
      credentials: 'omit',
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // WebSocketLink with error handling
  const subscriptionClient = new SubscriptionClient(`${WS_SERVER_URL}graphql`, {
    reconnect: true,
    timeout: 30000,
    lazy: true,
    connectionParams: () => {
      const token = getCachedAuthToken();
      if (token) {
        return {
          Authorization: `Bearer ${token}`,
        };
      }
      return {};
    },
  });

  // Handle WebSocket connection events
  subscriptionClient.on('connected', () => {
    console.log('WebSocket connected');
  });

  subscriptionClient.on('disconnected', () => {
    console.warn('WebSocket disconnected');
  });

  subscriptionClient.on('reconnected', () => {
    console.log('WebSocket reconnected');
  });

  subscriptionClient.on('error', (error) => {
    console.error('WebSocket connection error:', error);
  });

  const wsLink = new WebSocketLink(subscriptionClient);

  // Error Handling Link using ApolloLink's onError (for network errors)
  const errorLink = onError(({ networkError, graphQLErrors }) => {
    if (networkError) {
      // Handle CORS errors more gracefully
      if ('statusCode' in networkError || (networkError.message && networkError.message.includes('CORS'))) {
        console.warn('CORS or network error detected. This may be a backend configuration issue.');
      } else {
        console.error('Network Error:', networkError);
      }
    }

    if (graphQLErrors) {
      graphQLErrors.forEach((error) => {
        console.error('GraphQL Error:', error.message);
      });
    }
  });

  const getAuthorizationToken = async (): Promise<string | null> => {
    try {
      const currentUser = firebaseAuth.currentUser;
      if (currentUser) {
        const idToken = await currentUser.getIdToken();
        setCachedAuthToken(idToken);
        return idToken;
      }
    } catch (error) {
      console.error('Unable to retrieve Firebase ID token', error);
    }

    try {
      const storedFirebaseToken = localStorage.getItem(`firebase-${APP_NAME}`);
      if (storedFirebaseToken) {
        setCachedAuthToken(storedFirebaseToken);
        return storedFirebaseToken;
      }
    } catch (error) {
      console.error('Unable to read stored Firebase token', error);
    }

    try {
      const data = localStorage.getItem(`user-${APP_NAME}`);
      if (data) {
        const legacyToken = JSON.parse(data).token;
        if (legacyToken) {
          setCachedAuthToken(legacyToken);
          return legacyToken;
        }
      }
    } catch (error) {
      console.error('Unable to read stored legacy token', error);
    }

    setCachedAuthToken(null);
    return null;
  };

  // Request Link
  const authLink = new ApolloLink(
    (operation, forward) =>
      new Observable((observer) => {
        let handle: Subscription | undefined;
        Promise.resolve(getAuthorizationToken())
          .then((token) => {
            operation.setContext({
              headers: {
                authorization: token ? `Bearer ${token}` : '',
              },
            });
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

  // Terminating Link for split between HTTP and WebSocket
  const terminatingLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    ApolloLink.from([errorLink, authLink, httpLink])
  );

  const client = new ApolloClient({
    link: terminatingLink,
    cache,
    connectToDevTools: true,
  });

  return client;
};
