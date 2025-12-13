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

  // Ensure GraphQL URL is correctly formatted (no double slashes)
  const graphqlUrl = `${SERVER_URL.replace(/\/$/, '')}/graphql`;
  // Ensure WebSocket URL is correctly formatted
  // If WS_SERVER_URL already ends with /graphql, don't append it again
  let wsGraphqlUrl = WS_SERVER_URL.replace(/\/$/, '');
  if (!wsGraphqlUrl.endsWith('/graphql')) {
    wsGraphqlUrl = `${wsGraphqlUrl}/graphql`;
  }
  
  // Debug: Log the URLs being used (remove in production if needed)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('🔗 GraphQL URL:', graphqlUrl);
    console.log('🔗 WebSocket URL:', wsGraphqlUrl);
  }
  
  const httpLink = createHttpLink({
    uri: graphqlUrl,
    fetchOptions: {
      mode: 'cors',
      credentials: 'omit',
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // WebSocketLink with error handling and retry logic
  const subscriptionClient = new SubscriptionClient(wsGraphqlUrl, {
    reconnect: true,
    timeout: 30000,
    lazy: true,
    reconnectionAttempts: 5,
    connectionCallback: (error) => {
      if (error) {
        console.error('WebSocket connection failed:', error);
        // The client will automatically retry with exponential backoff
      }
    },
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
    if (typeof window !== 'undefined') {
      console.log('✅ WebSocket connected to:', wsGraphqlUrl);
    }
  });

  subscriptionClient.on('disconnected', () => {
    if (typeof window !== 'undefined') {
      console.warn('⚠️ WebSocket disconnected. Will attempt to reconnect...');
    }
  });

  subscriptionClient.on('reconnected', () => {
    if (typeof window !== 'undefined') {
      console.log('✅ WebSocket reconnected successfully');
    }
  });

  subscriptionClient.on('error', (error) => {
    if (typeof window !== 'undefined') {
      // Only log non-critical errors (connection errors are handled by reconnect logic)
      if (error.message && !error.message.includes('connection')) {
        console.error('WebSocket error:', error);
      }
    }
  });

  const wsLink = new WebSocketLink(subscriptionClient);

  // Error Handling Link using ApolloLink's onError (for network errors)
  const errorLink = onError(({ networkError, graphQLErrors, operation }) => {
    if (networkError) {
      // Handle CORS errors more gracefully
      if ('statusCode' in networkError || (networkError.message && networkError.message.includes('CORS'))) {
        console.error(
          'CORS or network error detected.',
          '\nRequest URL:', operation.getContext().uri || graphqlUrl,
          '\nThis may be a backend CORS configuration issue.',
          '\nPlease ensure the backend allows requests from this origin.'
        );
      } else if (networkError.message && networkError.message.includes('Failed to fetch')) {
        console.error(
          'Network request failed. Possible causes:',
          '\n- Backend server is down or unreachable',
          '\n- CORS configuration issue',
          '\n- Network connectivity problem',
          '\nRequest URL:', operation.getContext().uri || graphqlUrl
        );
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
  // Subscriptions use WebSocket, queries and mutations use HTTP
  // The lazy connection and reconnection logic in SubscriptionClient handles failures gracefully
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
