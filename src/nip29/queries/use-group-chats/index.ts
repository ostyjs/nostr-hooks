import { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';
import { useEffect } from 'react';

import { useSubscription } from '../../../hooks';
import { useNip29Store } from '../../../nip29/store';
import { Nip29GroupChat } from '../../types';

const addGroupChat = useNip29Store.getState().addGroupChat;

const onEvent = (subId: string | undefined, groupId: string | undefined, event: NDKEvent) => {
  const chat: Nip29GroupChat = {
    id: event.id,
    pubkey: event.pubkey,
    content: event.content,
    timestamp: event.created_at || 0,
    parentId: event.getMatchingTags('q')?.[0]?.[1] || undefined,
  };

  addGroupChat(subId, groupId, chat);
};

export const useGroupChats = (
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
    relay && groupId ? `${relay}-${groupId}--chats-${JSON.stringify(filter)}` : undefined;

  const chats = useNip29Store((state) =>
    subId && groupId ? state.groups[subId]?.[groupId]?.chats : undefined
  );

  const { events, hasMore, createSubscription, removeSubscription, loadMore, isLoading } =
    useSubscription(subId);

  useEffect(() => {
    if (!relay || !groupId) return;
    if (filter?.byAuthor?.waitForPubkey && !filter.byAuthor.pubkey) return;
    if (filter?.byId?.waitForId && !filter.byId.id) return;
    if (filter?.byParentId?.waitForId && !filter.byParentId.id) return;

    let f: NDKFilter = { kinds: [9], limit: filter?.limit || 10 };
    if (groupId) f['#h'] = [groupId];
    if (filter?.byAuthor?.pubkey) f.authors = [filter.byAuthor.pubkey];
    if (filter?.byId?.id) f.ids = [filter.byId.id];
    if (filter?.byParentId?.id) f['#q'] = [filter.byParentId.id];
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
    filter?.byParentId?.id,
    filter?.since,
    filter?.until,
    filter?.byAuthor?.waitForPubkey,
    filter?.byId?.waitForId,
    filter?.byParentId?.waitForId,
    createSubscription,
    removeSubscription,
  ]);

  return {
    chats,
    isLoadingChats: isLoading,
    hasMoreChats: hasMore,
    loadMoreChats: loadMore,
    chatsEvents: events,
  };
};
