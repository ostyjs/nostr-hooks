import NDK, {
  NDKEvent,
  NDKFilter,
  NDKRelaySet,
  NDKSubscription,
  NDKSubscriptionOptions,
} from '@nostr-dev-kit/ndk';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { create } from 'zustand';

type State = {
  subscription: NDKSubscription | undefined;
  eose: boolean;
  events: NDKEvent[];
  hasMore: boolean;
};

type UseSubscribeParams = {
  filters: NDKFilter[];
  opts?: NDKSubscriptionOptions | undefined;
  enabled?: boolean | undefined;
  relays?: string[] | undefined;
  fetchProfiles?: boolean | undefined;
};

/**
 * Hook for subscribing to events. Remember to use memoized params to avoid infinite re-render loops.
 *
 * @param ndk - NDK instance to use for the subscription.
 * @param filters - An array of NDKFilter objects.
 * @param opts - Optional NDKSubscriptionOptions for configuring the subscription.
 * @param enabled - Optional boolean indicating whether the subscription is enabled. Default is true.
 * @param relays - Optional array of relay URLs to use for this subscription.
 * @param fetchProfiles - Optional boolean indicating whether to fetch profiles for the events. Default is false.
 * @returns An object containing the sorted events, subscription status, end of stream flag, an unSubscribe function, a loadMore function, and a hasMore flag.
 */
export const useSubscribe = (
  ndk: NDK | undefined,
  {
    filters,
    opts = undefined,
    enabled = true,
    relays = undefined,
    fetchProfiles = false,
  }: UseSubscribeParams
) => {
  // Initial state
  const initialState = useRef({
    subscription: undefined,
    eose: false,
    events: [],
    hasMore: false,
  });

  // Create a store ref for each instance of the hook
  const useStoreRef = useRef(
    create<State>()(() => ({
      ...initialState.current,
    }))
  );

  // Get reactive states from the store
  const subscription = useStoreRef.current((state) => state.subscription);
  const eose = useStoreRef.current((state) => state.eose);
  const events = useStoreRef.current((state) => state.events);
  const hasMore = useStoreRef.current((state) => state.hasMore);

  // Sort the events by created_at timestamp
  const sortedEvents: NDKEvent[] = useMemo(
    () => (events ? events.sort((a, b) => b.created_at! - a.created_at!) : []),
    [events]
  );

  const earliestEvent = useMemo(() => sortedEvents[sortedEvents.length - 1], [sortedEvents]);

  // Unsubscribe function for external use
  const unSubscribe = useCallback(() => {
    useStoreRef.current.getState().subscription?.stop();
    useStoreRef.current.setState({ subscription: undefined });
  }, []);

  // Load more function for pagination
  const loadMore = useCallback(
    async (limit?: number) => {
      if (!ndk || !earliestEvent || !eose || !hasMore) return;

      const untilTimestamp = earliestEvent.created_at! - 1;

      const relaySet =
        relays && relays.length > 0 ? NDKRelaySet.fromRelayUrls(relays, ndk) : undefined;

      const additionalFilters = filters.map(
        (filter) =>
          ({
            ...filter,
            limit: limit || filter.limit,
            until: untilTimestamp,
          }) as NDKFilter
      );

      const fetchedEvents = await ndk.fetchEvents(additionalFilters, opts, relaySet);

      if (fetchedEvents.size == 0) {
        useStoreRef.current.setState({ hasMore: false });

        return;
      }

      if (fetchProfiles) {
        // Fetch profiles for the events
        await Promise.all(
          [...fetchedEvents].map(async (event) => {
            if (event.author.profile === undefined) {
              await event.author.fetchProfile();
            }
            return event;
          })
        );
      }

      // Update state, avoid duplicates
      useStoreRef.current.setState((state) => {
        const newEvents = [...fetchedEvents].filter(
          (event) => !state.events.some((e) => e.id === event.id)
        );

        return { events: [...state.events, ...newEvents] };
      });
    },
    [earliestEvent, eose, fetchProfiles, filters, opts, relays, ndk, hasMore]
  );

  useEffect(() => {
    // Stop the subscription if it is already running
    useStoreRef.current.getState().subscription?.stop();

    // Reset the state
    useStoreRef.current.setState({ ...initialState.current, subscription: undefined });

    // Start a new subscription if enabled and filters are provided
    if (enabled && filters.length > 0 && !!ndk) {
      if (useStoreRef.current.getState().subscription) return;

      const relaySet =
        relays && relays.length > 0 ? NDKRelaySet.fromRelayUrls(relays, ndk) : undefined;

      const newSubscription = ndk.subscribe(filters, opts, relaySet);

      // Listen for events and update the state
      newSubscription.on('event', (event: NDKEvent) => {
        if (fetchProfiles && event.author.profile === undefined) {
          event.author.fetchProfile().then(() => {
            useStoreRef.current.setState((state) => ({ events: [...state.events, event] }));
          });
        } else {
          useStoreRef.current.setState((state) => ({ events: [...state.events, event] }));
        }
      });

      // Listen for EOSE and update the state
      newSubscription.on('eose', () => {
        useStoreRef.current.setState({ eose: true });

        if (useStoreRef.current.getState().events.length > 0) {
          useStoreRef.current.setState({ hasMore: true });
        }

        if (opts?.closeOnEose) {
          newSubscription.stop();
          useStoreRef.current.setState({ subscription: undefined });
        }
      });

      // Update the state with the new subscription
      useStoreRef.current.setState({ subscription: newSubscription });
    }

    return () => {
      // Stop the subscription when the component unmounts
      useStoreRef.current.getState().subscription?.stop();

      // Reset the state
      useStoreRef.current.setState({ ...initialState.current, subscription: undefined });
    };
  }, [enabled, fetchProfiles, filters, opts, relays, ndk]);

  return {
    events: sortedEvents,
    eose,
    isSubscribed: !!subscription,
    unSubscribe,
    loadMore,
    hasMore,
  };
};
