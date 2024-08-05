import NDK, {
  NDKEvent,
  NDKFilter,
  NDKRelaySet,
  NDKSubscription,
  NDKSubscriptionOptions,
} from '@nostr-dev-kit/ndk';
import { useEffect, useMemo } from 'react';
import { create } from 'zustand';

import { useNdk } from '../use-ndk';

type State = {
  subscription: NDKSubscription | undefined;
  eose: boolean;
  events: NDKEvent[];
};

type Actions = {
  subscribe: (params: UseSubscribeParams & { ndk: NDK }) => void;
  resetState: () => void;
  unSubscribe: () => void;
};

const initialState = {
  subscription: undefined,
  eose: false,
  events: [],
};

const useLocalStore = create<State & Actions>()((set, get) => ({
  ...initialState,

  resetState: () => set(initialState),

  unSubscribe: () => {
    const { subscription } = get();

    subscription?.stop();

    set({ subscription: undefined });
  },

  subscribe: ({ filters, opts, relays, fetchProfiles, ndk }) => {
    const { subscription } = get();

    if (subscription) return;

    const relaySet =
      relays && relays.length > 0 ? NDKRelaySet.fromRelayUrls(relays, ndk) : undefined;

    const newSubscription = ndk.subscribe(filters, opts, relaySet);

    newSubscription.on('event', (event: NDKEvent) => {
      if (fetchProfiles && event.author.profile === undefined) {
        event.author.fetchProfile().then(() => {
          set((state) => ({ events: [...state.events, event] }));
        });
      } else {
        set((state) => ({ events: [...state.events, event] }));
      }
    });

    newSubscription.on('eose', () => {
      set({ eose: true });

      if (opts?.closeOnEose) {
        newSubscription.stop();
        set({ subscription: undefined });
      }
    });

    set({ subscription: newSubscription });
  },
}));

const { subscribe, resetState, unSubscribe } = useLocalStore.getState();

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
 * @param filters - An array of NDKFilter objects.
 * @param opts - Optional NDKSubscriptionOptions for configuring the subscription.
 * @param enabled - Optional boolean indicating whether the subscription is enabled. Default is true.
 * @param relays - Optional array of relay URLs to use for this subscription.
 * @param fetchProfiles - Optional boolean indicating whether to fetch profiles for the events. Default is false.
 * @returns An object containing the sorted events, subscription status, end of stream flag, and an unSubscribe function.
 */
export const useSubscribe = ({
  filters,
  opts = undefined,
  enabled = true,
  relays = undefined,
  fetchProfiles = false,
}: UseSubscribeParams) => {
  const { ndk } = useNdk();

  const subscription = useLocalStore((state) => state.subscription);
  const eose = useLocalStore((state) => state.eose);
  const events = useLocalStore((state) => state.events);

  useEffect(() => {
    unSubscribe();
    resetState();

    // start a new subscription with new params
    if (enabled && filters.length > 0 && !!ndk) {
      subscribe({ filters, opts, relays, fetchProfiles, ndk });
    }

    return () => {
      unSubscribe();
      resetState();
    };
  }, [enabled, fetchProfiles, filters, opts, relays, ndk]);

  const sortedEvents: NDKEvent[] = useMemo(
    () => (events ? events.sort((a, b) => b.created_at! - a.created_at!) : []),
    [events]
  );

  return { events: sortedEvents, eose, isSubscribed: !!subscription, unSubscribe };
};
