import { NDKFilter, NDKSubscriptionOptions } from '@nostr-dev-kit/ndk';
import { useCallback, useMemo } from 'react';

import { useStore } from '../../store';
import { useNdk } from '../use-ndk';

export const useSubscription = (subId: string | undefined) => {
  const { ndk } = useNdk();

  const subscription = useStore((state) => (subId ? state.subscriptions[subId] : undefined));
  const _createSubscription = useStore((state) => state.createSubscription);
  const _removeSubscription = useStore((state) => state.removeSubscription);
  const _loadMore = useStore((state) => state.loadMore);

  const createSubscription = useCallback(
    (
      filters: NDKFilter[],
      opts?: NDKSubscriptionOptions,
      relayUrls?: string[],
      autoStart?: boolean
    ) => (ndk ? _createSubscription(subId, filters, opts, relayUrls, autoStart) : null),
    [ndk, _createSubscription, subId]
  );

  const removeSubscription = useCallback(
    () => ndk && _removeSubscription(subId),
    [ndk, _removeSubscription, subId]
  );

  const loadMore = useCallback(
    (limit?: number) => ndk && _loadMore(subId, limit),
    [ndk, _loadMore, subId]
  );

  const isLoading = useMemo(
    () =>
      subscription
        ? (!subscription.events || subscription.events.length == 0) && !subscription.eose
        : false,
    [subscription?.events, subscription?.eose]
  );

  return { ...subscription, createSubscription, removeSubscription, loadMore, isLoading };
};
