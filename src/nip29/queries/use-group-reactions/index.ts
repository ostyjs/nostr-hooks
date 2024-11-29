import { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';
import { useEffect, useMemo } from 'react';

import { useSubscription } from '../../../hooks';
import { useNip29Store } from '../../../nip29/store';
import { Nip29GroupReaction } from '../../types';

const addGroupReaction = useNip29Store.getState().addGroupReaction;

const onEvent = (subId: string | undefined, groupId: string | undefined, event: NDKEvent) => {
  const reaction: Nip29GroupReaction = {
    id: event.id,
    pubkey: event.pubkey,
    content: event.content,
    timestamp: event.created_at || 0,
    targetId: event.getMatchingTags('e')?.[0]?.[1] || '',
  };

  addGroupReaction(subId, groupId, reaction);
};

export const useGroupReactions = (
  relay: string | undefined,
  groupId: string | undefined,
  filter?: {
    byAuthor?: {
      pubkey: string | undefined;
      waitForPubkey: true;
    };
    byId?: {
      id: string | undefined;
      waitForId: true;
    };
    byTargetId?: {
      id: string | undefined;
      waitForId: true;
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

  const { events, hasMore, createSubscription, removeSubscription, isLoading, loadMore } =
    useSubscription(subId);

  const filteredReactions = useMemo(() => {
    if (!reactions || !events) return undefined;

    return reactions.filter((r) => events.some((e) => e.id === r.id));
  }, [reactions, events]);

  useEffect(() => {
    if (!relay || !groupId) return;
    if (filter?.byAuthor?.waitForPubkey && !filter.byAuthor.pubkey) return;
    if (filter?.byId?.waitForId && !filter.byId.id) return;
    if (filter?.byTargetId?.waitForId && !filter.byTargetId.id) return;

    let f: NDKFilter = { kinds: [7], limit: filter?.limit || 10 };
    if (groupId) f['#h'] = [groupId];
    if (filter?.byAuthor?.pubkey) f.authors = [filter?.byAuthor?.pubkey];
    if (filter?.byId?.id) f.ids = [filter?.byId?.id];
    if (filter?.byTargetId?.id) f['#e'] = [filter?.byTargetId?.id];
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
    filter?.byAuthor?.pubkey,
    filter?.byId?.id,
    filter?.since,
    filter?.until,
    filter?.byAuthor?.waitForPubkey,
    filter?.byId?.waitForId,
    filter?.byTargetId?.waitForId,
    filter?.byTargetId?.id,
    createSubscription,
    removeSubscription,
  ]);

  return {
    reactions: filteredReactions,
    isLoadingReactions: isLoading,
    hasMoreReactions: hasMore,
    loadMoreReactions: loadMore,
    reactionsEvents: events,
  };
};
