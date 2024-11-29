import { NDKEvent, NDKFilter, NDKKind } from '@nostr-dev-kit/ndk';
import { useEffect } from 'react';

import { useSubscription } from '../../../hooks';
import { useNip29Store } from '../../../nip29/store';
import { Nip29GroupThreadComment } from '../../types';

const addGroupThreadComment = useNip29Store.getState().addGroupThreadComment;

const onEvent = (subId: string | undefined, groupId: string | undefined, event: NDKEvent) => {
  const threadComment: Nip29GroupThreadComment = {
    id: event.id,
    pubkey: event.pubkey,
    content: event.content,
    timestamp: event.created_at || 0,
    rootId: event.getMatchingTags('E')?.[0]?.[1] || '',
  };

  addGroupThreadComment(subId, groupId, threadComment);
};

export const useGroupThreadComments = (
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
    byParentId?: {
      id: string | undefined;
      waitForId: true;
    };
    since?: number | undefined;
    until?: number | undefined;
    limit?: number | undefined;
  }
) => {
  const subId =
    relay && groupId ? `${relay}-${groupId}-threadComments-${JSON.stringify(filter)}` : undefined;

  const threadComments = useNip29Store((state) =>
    subId && groupId ? state.groups[subId]?.[groupId]?.threadComments : undefined
  );

  const { events, hasMore, createSubscription, removeSubscription, isLoading, loadMore } =
    useSubscription(subId);

  useEffect(() => {
    if (!relay || !groupId) return;
    if (filter?.byAuthor?.waitForPubkey && !filter.byAuthor.pubkey) return;
    if (filter?.byId?.waitForId && !filter.byId.id) return;

    let f: NDKFilter = { kinds: [1111 as NDKKind], '#K': ['11'], limit: filter?.limit || 10 };
    if (groupId) f['#h'] = [groupId];
    if (filter?.byAuthor?.pubkey) f.authors = [filter?.byAuthor?.pubkey];
    if (filter?.byId?.id) f.ids = [filter?.byId?.id];
    if (filter?.byParentId?.id) f['#E'] = [filter?.byParentId?.id];
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
    createSubscription,
    removeSubscription,
  ]);

  return {
    threadComments,
    isLoadingThreadComments: isLoading,
    hasMoreThreadComments: hasMore,
    loadMoreThreadComments: loadMore,
    threadCommentsEvents: events,
  };
};
