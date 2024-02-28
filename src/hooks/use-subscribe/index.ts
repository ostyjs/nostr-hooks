import {
  NDKEvent,
  NDKFilter,
  NDKRelaySet,
  NDKSubscription,
  NDKSubscriptionOptions,
} from '@nostr-dev-kit/ndk';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useNdk } from '../use-ndk';

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
  relays = undefined,
}: {
  filters: NDKFilter[];
  opts?: NDKSubscriptionOptions;
  enabled?: boolean;
  relays?: string[] | undefined;
}) => {
  const subscription = useRef<NDKSubscription | undefined>(undefined);

  const [eose, setEose] = useState(false);
  const [events, setEvents] = useState<NDKEvent[]>([]);

  const { ndk } = useNdk();

  const sortedEvents: NDKEvent[] = useMemo(
    () => (events ? events.sort((a, b) => b.created_at! - a.created_at!) : []),
    [events]
  );

  const canSubscribe =
    !!ndk && filters.length > 0 && enabled == true && subscription.current === undefined;

  const unSubscribe = () => {
    subscription.current?.stop();
    subscription.current = undefined;
  };

  const subscribe = () => {
    if (!ndk) return;

    setEose(false);

    const relaySet =
      relays && relays.length > 0 ? NDKRelaySet.fromRelayUrls(relays, ndk) : undefined;

    subscription.current = ndk.subscribe(filters, opts, relaySet);
    subscription.current.start();
    subscription.current.on('event', (event: NDKEvent) => {
      setEvents((prevEvents) => [...(prevEvents || []), event]);
    });
    subscription.current.on('eose', () => {
      setEose(true);

      opts?.closeOnEose && unSubscribe();
    });
  };

  useEffect(() => {
    canSubscribe && subscribe();
  }, [canSubscribe, subscribe]);

  useEffect(() => {
    return () => {
      subscription.current?.stop();
      subscription.current = undefined;
    };
  }, []);

  return { events: sortedEvents, isSubscribed: !!subscription.current, eose, unSubscribe };
};
