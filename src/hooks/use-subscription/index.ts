import { useCallback, useMemo } from 'react';

import { CreateSubscriptionParams } from 'src/types';
import { useStore } from '../../store';
import { useNdk } from '../use-ndk';

/**
 * Custom hook to manage NDK subscriptions.
 *
 * @param subId - The subscription ID. This is used to identify the subscription internally.
 * @returns An object containing the subscription details and methods to manage the subscription.
 * @property createSubscription - Function to create a new subscription.
 * @property removeSubscription - Function to remove the subscription.
 * @property loadMore - Function to load more events for an existing subscription.
 * @property isLoading - Boolean indicating if the subscription is currently loading.
 */
export const useSubscription = (subId: string | undefined) => {
  const { ndk } = useNdk();

  const subscription = useStore((state) => (subId ? state.subscriptions[subId] : undefined));
  const _createSubscription = useStore((state) => state.createSubscription);
  const _removeSubscription = useStore((state) => state.removeSubscription);
  const _loadMore = useStore((state) => state.loadMore);

  const createSubscription = useCallback(
    (params: Omit<CreateSubscriptionParams, 'subId'>) =>
      ndk && subId ? _createSubscription({ ...params, subId }) : null,
    [ndk, _createSubscription, subId]
  );

  const removeSubscription = useCallback(
    () => _removeSubscription(subId),
    [_removeSubscription, subId]
  );

  const loadMore = useCallback(
    (limit?: number) => subId && ndk && _loadMore(subId, limit),
    [ndk, _loadMore, subId]
  );

  const isLoading = useMemo(
    () =>
      subscription
        ? (!subscription.events || subscription.events.length == 0) && !subscription.eose
        : false,
    [subscription?.events, subscription?.eose]
  );

  useCallback(() => {
    return () => {
      removeSubscription();
    };
  }, [removeSubscription]);

  return { ...subscription, createSubscription, removeSubscription, loadMore, isLoading };
};
