import { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';
import { useEffect } from 'react';

import { useSubscription } from '../../../hooks';
import { useNip29Store } from '../../../nip29/store';
import { Nip29GroupChat } from '../../types';

const addGroupChat = useNip29Store.getState().addGroupChat;

export const useGroupChats = (
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
    byParentId?: {
      parentId: string | undefined;
      waitForParentId: true;
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

  const { events, hasMore, isLoading, createSubscription, loadMore } = useSubscription(subId);

  useEffect(() => {
    if (!relay || !groupId || !subId) return;
    if (filter?.byPubkey?.waitForPubkey && !filter.byPubkey.pubkey) return;
    if (filter?.byId?.waitForId && !filter.byId.id) return;
    if (filter?.byParentId?.waitForParentId && !filter.byParentId.parentId) return;

    let f: NDKFilter = { kinds: [9], limit: filter?.limit || 10 };
    if (groupId) f['#h'] = [groupId];
    if (filter?.byPubkey?.pubkey) f.authors = [filter.byPubkey.pubkey];
    if (filter?.byId?.id) f.ids = [filter.byId.id];
    if (filter?.byParentId?.parentId) f['#q'] = [filter.byParentId.parentId];
    if (filter?.since) f.since = filter.since;
    if (filter?.until) f.until = filter.until;

    const filters = [f];
    const relayUrls = [relay];

    const onEvent = (event: NDKEvent) => {
      const chat: Nip29GroupChat = {
        id: event.id,
        pubkey: event.pubkey,
        content: event.content,
        timestamp: event.created_at || 0,
        parentId: event.getMatchingTags('q')?.[0]?.[1] || undefined,
      };

      addGroupChat(subId, groupId, chat);
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
    filter?.byParentId?.parentId,
    filter?.byParentId?.waitForParentId,
    filter?.since,
    filter?.until,
    createSubscription,
  ]);

  return {
    chats,
    isLoadingChats: isLoading,
    hasMoreChats: hasMore,
    loadMoreChats: loadMore,
    chatsEvents: events,
  };
};
