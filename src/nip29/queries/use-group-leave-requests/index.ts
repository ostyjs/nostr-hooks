import { NDKEvent, NDKFilter, NDKKind } from '@nostr-dev-kit/ndk';
import { useEffect } from 'react';

import { useSubscription } from '../../../hooks';
import { useNip29Store } from '../../../nip29/store';
import { Nip29GroupJoinRequest } from '../../types';

const addGroupLeaveRequest = useNip29Store.getState().addGroupLeaveRequest;

export const useGroupLeaveRequests = (
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
    relay && groupId ? `${relay}-${groupId}-leaveRequests-${JSON.stringify(filter)}` : undefined;

  const leaveRequests = useNip29Store((state) =>
    subId && groupId ? state.groups[subId]?.[groupId]?.leaveRequests : undefined
  );

  const { events, hasMore, isLoading, createSubscription, loadMore } = useSubscription(subId);

  useEffect(() => {
    if (!relay || !groupId || !subId) return;
    if (filter?.byPubkey?.waitForPubkey && !filter.byPubkey.pubkey) return;
    if (filter?.byId?.waitForId && !filter.byId.id) return;

    let f: NDKFilter = { kinds: [9022 as NDKKind], limit: filter?.limit || 10 };
    if (groupId) f['#h'] = [groupId];
    if (filter?.byPubkey?.pubkey) f.authors = [filter?.byPubkey?.pubkey];
    if (filter?.byId?.id) f.ids = [filter?.byId?.id];
    if (filter?.since) f.since = filter.since;
    if (filter?.until) f.until = filter.until;

    const filters = [f];
    const relayUrls = [relay];

    const onEvent = (event: NDKEvent) => {
      const joinRequest: Nip29GroupJoinRequest = {
        id: event.id,
        pubkey: event.pubkey,
        reason: event.getMatchingTags('reason')?.[0]?.[1] || '',
        timestamp: event.created_at || 0,
      };

      addGroupLeaveRequest(subId, groupId, joinRequest);
    };

    createSubscription({ filters, relayUrls, onEvent });
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
  ]);

  return {
    leaveRequests,
    isLoadingLeaveRequests: isLoading,
    hasMoreLeaveRequests: hasMore,
    loadMoreLeaveRequests: loadMore,
    leaveRequestsEvents: events,
  };
};
