import NDK, {
  NDKEvent,
  NDKFilter,
  NDKRelaySet,
  NDKSubscription,
  NDKSubscriptionOptions,
} from '@nostr-dev-kit/ndk';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { create } from 'zustand';

import { useNdk } from '../use-ndk';

type State = {
  subscription: NDKSubscription | undefined;
  eose: boolean;
  events: NDKEvent[];
};

type UseSubscribeParams = {
  filters: NDKFilter[];
  opts?: NDKSubscriptionOptions | undefined;
  enabled?: boolean | undefined;
  relays?: string[] | undefined;
  fetchProfiles?: boolean | undefined;
  customNdk?: NDK | undefined;
};

/**
 * Hook for subscribing to events. Remember to use memoized params to avoid infinite re-render loops.
 *
 * @param filters - An array of NDKFilter objects.
 * @param opts - Optional NDKSubscriptionOptions for configuring the subscription.
 * @param enabled - Optional boolean indicating whether the subscription is enabled. Default is true.
 * @param relays - Optional array of relay URLs to use for this subscription.
 * @param fetchProfiles - Optional boolean indicating whether to fetch profiles for the events. Default is false.
 * @param customNdk - Optional NDK instance to use for the subscription instead of the global NDK instance.
 * @returns An object containing the sorted events, subscription status, end of stream flag, and an unSubscribe function.
 */
export const useSubscribe = ({
  filters,
  opts = undefined,
  enabled = true,
  relays = undefined,
  fetchProfiles = false,
  customNdk = undefined,
}: UseSubscribeParams) => {
  // Initial state
  const initialState = useRef({
    subscription: undefined,
    eose: false,
    events: [],
  });

  // Create a store ref for each instance of the hook
  const useStoreRef = useRef(
    create<State>()(() => ({
      ...initialState.current,
    }))
  );

  // Get reactive NDK instance from the global store
  const { ndk: globalNdk } = useNdk();

  // Use the custom NDK instance if provided
  const ndk = customNdk || globalNdk;

  // Get reactive states from the store
  const subscription = useStoreRef.current((state) => state.subscription);
  const eose = useStoreRef.current((state) => state.eose);
  const events = useStoreRef.current((state) => state.events);

  // Sort the events by created_at timestamp
  const sortedEvents: NDKEvent[] = useMemo(
    () => (events ? events.sort((a, b) => b.created_at! - a.created_at!) : []),
    [events]
  );

  // Unsubscribe function for external use
  const unSubscribe = useCallback(() => {
    useStoreRef.current.getState().subscription?.stop();
    useStoreRef.current.setState({ subscription: undefined });
  }, []);

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

  return { events: sortedEvents, eose, isSubscribed: !!subscription, unSubscribe };
};
