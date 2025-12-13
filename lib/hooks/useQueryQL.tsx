import {
  ApolloError,
  DocumentNode,
  OperationVariables,
  QueryHookOptions,
  useQuery,
} from '@apollo/client';
import { WatchQueryFetchPolicy } from '@apollo/client/core/watchQueryOptions';
import { debounce } from 'lodash';
import { useCallback, useState } from 'react';
import { retryQuery } from '../utils/methods';

export const useQueryGQL = <
  T extends DocumentNode,
  V extends OperationVariables | QueryHookOptions,
>(
  query: DocumentNode,
  variables: V,
  options: {
    enabled?: boolean;
    debounceMs?: number;
    pollInterval?: number;
    fetchPolicy?: WatchQueryFetchPolicy;
    errorPolicy?: 'none' | 'ignore' | 'all';
    retry?: number;
    retryDelayMs?: number;
    onCompleted?: (data: NoInfer<T>) => void;
    onError?: (error: ApolloError) => void;
  } = {}
) => {
  const {
    enabled = true,
    debounceMs = 500,
    pollInterval,
    fetchPolicy,
    errorPolicy,
    retry = 3,
    retryDelayMs = 1000,
    onCompleted,
    onError,
  } = options;

  const { data, error, loading, refetch } = useQuery<T, V>(query, {
    variables,
    skip: !enabled,
    fetchPolicy,
    errorPolicy,
    pollInterval,
    onCompleted,
    onError,
  });

  const [isRefetching, setIsRefetching] = useState(false);

  const debouncedRefetch = useCallback(
    debounce(async (variables?: Partial<V>) => {
      setIsRefetching(true);
      try {
        const result = await retryQuery(
          () => refetch(variables),
          retry,
          retryDelayMs
        );
        return result;
      } finally {
        setIsRefetching(false);
      }
    }, debounceMs),
    [refetch, debounceMs, retry, retryDelayMs]
  );

  const handleRefetch = async () => {
    if (enabled) {
      await debouncedRefetch();
    }
  };

  return {
    data,
    error,
    loading: loading || isRefetching,
    refetch: handleRefetch,
    isError: !!error,
    isSuccess: !!data,
  };
};
