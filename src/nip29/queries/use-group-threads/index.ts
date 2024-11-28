import { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';
import { useEffect } from 'react';

import { useSubscription } from '../../../hooks';
import { useNip29Store } from '../../../nip29/store';
import { Nip29GroupThread } from '../../types';

const addGroupThread = useNip29Store.getState().addGroupThread;

const onEvent = (subId: string | undefined, groupId: string | undefined, event: NDKEvent) => {
  const thread: Nip29GroupThread = {
    id: event.id,
    pubkey: event.pubkey,
    content: event.content,
    subject: event.getMatchingTags('subject')?.[0]?.[1] || '',
    timestamp: event.created_at || 0,
  };

  addGroupThread(subId, groupId, thread);
};

export const useGroupThreads = (
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
    since?: number | undefined;
    until?: number | undefined;
    limit?: number | undefined;
  }
) => {
  const subId =
    relay && groupId ? `${relay}-${groupId}-threads-${JSON.stringify(filter)}` : undefined;

  const threads = useNip29Store((state) =>
    subId && groupId ? state.groups[subId]?.[groupId]?.threads : undefined
  );

  const { events, hasMore, createSubscription, removeSubscription, isLoading, loadMore } =
    useSubscription(subId);

  useEffect(() => {
    if (!relay || !groupId) return;
    if (filter?.byAuthor?.waitForPubkey && !filter.byAuthor.pubkey) return;
    if (filter?.byId?.waitForId && !filter.byId.id) return;

    let f: NDKFilter = { kinds: [11], limit: filter?.limit || 10 };
    if (groupId) f['#h'] = [groupId];
    if (filter?.byAuthor?.pubkey) f.authors = [filter?.byAuthor?.pubkey];
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
    threads,
    isLoadingThreads: isLoading,
    hasMoreThreads: hasMore,
    loadMoreThreads: loadMore,
    threadsEvents: events,
  };
};
