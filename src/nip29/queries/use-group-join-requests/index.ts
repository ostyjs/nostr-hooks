import { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';
import { useEffect } from 'react';

import { useSubscription } from '../../../hooks';
import { useNip29Store } from '../../../nip29/store';
import { Nip29GroupJoinRequest } from '../../types';

const addGroupJoinRequest = useNip29Store.getState().addGroupJoinRequest;

const onEvent = (subId: string | undefined, groupId: string | undefined, event: NDKEvent) => {
  const joinRequest: Nip29GroupJoinRequest = {
    id: event.id,
    pubkey: event.pubkey,
    reason: event.content || '',
    code: event.getMatchingTags('code')?.[0]?.[1] || '',
    timestamp: event.created_at || 0,
  };

  addGroupJoinRequest(subId, groupId, joinRequest);
};

export const useGroupJoinRequests = (
  relay: string | undefined,
  groupId: string | undefined,
  filter?: {
    byPubkey?: {
      pubkey: string | undefined;
      waitForPubkey: true;
    };
    byId?: {
      id: string | undefined;
      waitForId: true;
    };
    since?: number | undefined;
    until?: number | undefined;
    limit?: number | undefined;
  }
) => {
  const subId =
    relay && groupId ? `${relay}-${groupId}-joinRequests-${JSON.stringify(filter)}` : undefined;

  const joinRequests = useNip29Store((state) =>
    subId && groupId ? state.groups[subId]?.[groupId]?.joinRequests : undefined
  );

  const { events, hasMore, isLoading, createSubscription, loadMore, removeSubscription } =
    useSubscription(subId);

  useEffect(() => {
    if (!relay || !groupId || !subId) return;
    if (filter?.byPubkey?.waitForPubkey && !filter.byPubkey.pubkey) return;
    if (filter?.byId?.waitForId && !filter.byId.id) return;

    let f: NDKFilter = { kinds: [9021], limit: filter?.limit || 10 };
    if (groupId) f['#h'] = [groupId];
    if (filter?.byPubkey?.pubkey) f.authors = [filter?.byPubkey?.pubkey];
    if (filter?.byId?.id) f.ids = [filter?.byId?.id];
    if (filter?.since) f.since = filter.since;
    if (filter?.until) f.until = filter.until;

    const sub = createSubscription([f], {}, [relay]);
    sub?.on('event', (event) => onEvent(subId, groupId, event));

    return () => {
      removeSubscription();
    };
  }, [
    subId,
    relay,
    groupId,
    filter?.byPubkey?.pubkey,
    filter?.byPubkey?.waitForPubkey,
    filter?.byId?.id,
    filter?.byId?.waitForId,
    filter?.since,
    filter?.until,
    createSubscription,
    removeSubscription,
  ]);

  return {
    joinRequests,
    isLoadingJoinRequests: isLoading,
    hasMoreJoinRequests: hasMore,
    loadMoreJoinRequests: loadMore,
    joinRequestsEvents: events,
  };
};
