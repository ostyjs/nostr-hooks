import { NDKEvent, NDKFilter, NDKSubscriptionOptions } from '@nostr-dev-kit/ndk';
import { useContext, useEffect, useMemo, useState } from 'react';

import { NostrHooksContext } from '../../contexts';

/**
 * Hook for subscribing to events.
 *
 * @param filters - An array of NDKFilter objects.
 * @param opts - Optional NDKSubscriptionOptions for configuring the subscription.
 * @param enabled - Optional boolean indicating whether the subscription is enabled. Default is true.
 * @returns An object containing the sorted events, subscription status, end of stream flag, and an unSubscribe function.
 */
export const useSubscribe = ({
  filters,
  opts,
  enabled = true,
}: {
  filters: NDKFilter[];
  opts?: NDKSubscriptionOptions;
  enabled?: boolean;
}) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [eose, setEose] = useState(false);
  const [events, setEvents] = useState<NDKEvent[]>([]);

  const { ndk } = useContext(NostrHooksContext);

  const sortedEvents: NDKEvent[] = useMemo(
    () => (events ? events.sort((a, b) => b.created_at! - a.created_at!) : []),
    [events]
  );

  const subscription = useMemo(
    () => (ndk ? ndk.subscribe(filters, opts, undefined, false) : undefined),
    [ndk, filters, opts]
  );

  const canSubscribe =
    !!ndk && filters.length > 0 && enabled == true && subscription && !isSubscribed;

  const unSubscribe = () => {
    subscription?.stop();
    setIsSubscribed(false);
  };

  useEffect(() => {
    if (!canSubscribe) return;

    setIsSubscribed(true);
    setEose(false);

    subscription.start();
    subscription.on('event', (event: NDKEvent) => {
      setEvents((prevEvents) => [...(prevEvents || []), event]);
    });
    subscription.on('eose', () => {
      setEose(true);

      opts?.closeOnEose && unSubscribe();
    });

    return () => {
      unSubscribe();
    };
  }, [
    canSubscribe,
    subscription,
    opts?.closeOnEose,
    unSubscribe,
    setIsSubscribed,
    setEvents,
    setEose,
  ]);

  return { events: sortedEvents, isSubscribed, eose, unSubscribe };
};
