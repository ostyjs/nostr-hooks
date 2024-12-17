import { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';
import { useEffect } from 'react';

import { useSubscription } from '../../../hooks';
import { useNip29Store } from '../../../nip29/store';
import { Nip29GroupMetadata } from '../../types';

const updateGroupMetadata = useNip29Store.getState().updateGroupMetadata;

export const useGroupMetadata = (relay: string | undefined, groupId: string | undefined) => {
  const subId = relay && groupId ? `${relay}-${groupId}-metadata` : undefined;

  const metadata = useNip29Store((state) =>
    subId && groupId ? state.groups[subId]?.[groupId]?.metadata : undefined
  );

  const { events, isLoading, createSubscription } = useSubscription(subId);

  useEffect(() => {
    if (!relay || !groupId || !subId) return;

    const filters: NDKFilter[] = [{ kinds: [39000], '#d': [groupId], limit: 1 }];
    const relayUrls = [relay];

    const onEvent = (event: NDKEvent) => {
      const { dTag } = event;
      if (!dTag) return;

      const name = event.getMatchingTags('name')?.[0]?.[1] || '<unnamed>';
      const picture = event.getMatchingTags('picture')?.[0]?.[1] || '';
      const about = event.getMatchingTags('about')?.[0]?.[1] || '';
      const isOpen = event.getMatchingTags('open') ? true : false;
      const isPublic = event.getMatchingTags('public') ? true : false;

      const metadata: Nip29GroupMetadata = {
        about,
        isOpen,
        isPublic,
        name,
        picture,
      };

      updateGroupMetadata(subId, groupId, metadata);
    };

    createSubscription({ filters, relayUrls, onEvent });
  }, [subId, relay, groupId, createSubscription]);

  return {
    metadata,
    isLoadingMetadata: isLoading,
    metadataEvents: events,
  };
};
