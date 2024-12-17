import { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';
import { useEffect, useMemo } from 'react';

import { useSubscription } from '../../../hooks';
import { useNip29Store } from '../../../nip29/store';
import { Nip29GroupReaction } from '../../types';

const addGroupReaction = useNip29Store.getState().addGroupReaction;

export const useGroupReactions = (
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
    byTargetId?: {
      targetId: string | undefined;
      waitForTargetId: true;
    };
    since?: number | undefined;
    until?: number | undefined;
    limit?: number | undefined;
  }
) => {
  const subId =
    relay && groupId ? `${relay}-${groupId}-reactions-${JSON.stringify(filter)}` : undefined;

  const reactions = useNip29Store((state) =>
    subId && groupId ? state.groups[subId]?.[groupId]?.reactions : undefined
  );

  const { events, hasMore, isLoading, createSubscription, loadMore } = useSubscription(subId);

  const filteredReactions = useMemo(() => {
    if (!reactions || !events) return undefined;

    return reactions.filter((r) => events.some((e) => e.id === r.id));
  }, [reactions, events]);

  useEffect(() => {
    if (!relay || !groupId || !subId) return;
    if (filter?.byPubkey?.waitForPubkey && !filter.byPubkey.pubkey) return;
    if (filter?.byId?.waitForId && !filter.byId.id) return;
    if (filter?.byTargetId?.waitForTargetId && !filter.byTargetId.targetId) return;

    let f: NDKFilter = { kinds: [7], limit: filter?.limit || 10 };
    if (groupId) f['#h'] = [groupId];
    if (filter?.byPubkey?.pubkey) f.authors = [filter?.byPubkey?.pubkey];
    if (filter?.byId?.id) f.ids = [filter?.byId?.id];
    if (filter?.byTargetId?.targetId) f['#e'] = [filter?.byTargetId?.targetId];
    if (filter?.since) f.since = filter.since;
    if (filter?.until) f.until = filter.until;

    const filters = [f];
    const relayUrls = [relay];

    const onEvent = (event: NDKEvent) => {
      const reaction: Nip29GroupReaction = {
        id: event.id,
        pubkey: event.pubkey,
        content: event.content,
        timestamp: event.created_at || 0,
        targetId: event.getMatchingTags('e')?.[0]?.[1] || '',
      };

      addGroupReaction(subId, groupId, reaction);
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
    filter?.byTargetId?.targetId,
    filter?.byTargetId?.waitForTargetId,
    filter?.since,
    filter?.until,
    createSubscription,
  ]);

  return {
    reactions: filteredReactions,
    isLoadingReactions: isLoading,
    hasMoreReactions: hasMore,
    loadMoreReactions: loadMore,
    reactionsEvents: events,
  };
};
