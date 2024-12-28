import { NDKKind, profileFromEvent } from '@nostr-dev-kit/ndk';
import { useEffect, useMemo } from 'react';

import { useSubscription } from '../';

export const useRealtimeProfile = (pubkey: string | undefined) => {
  const subId = pubkey ? `realtime-profile-${pubkey}` : undefined;

  const { createSubscription, events, isLoading } = useSubscription(subId);

  const profile = useMemo(() => {
    if (isLoading) {
      return undefined;
    }

    if (!events || events.length == 0) {
      return null;
    }

    const recentEvent = events[events.length - 1];
    if (!recentEvent) {
      return null;
    }

    try {
      return profileFromEvent(recentEvent);
    } catch (_) {
      return null;
    }
  }, [events, isLoading]);

  useEffect(() => {
    pubkey &&
      createSubscription({ filters: [{ authors: [pubkey], kinds: [NDKKind.Metadata], limit: 1 }] });
  }, [pubkey, createSubscription]);

  return { profile };
};
