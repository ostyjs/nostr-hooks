import { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';
import { useEffect } from 'react';

import { useSubscription } from '../../../hooks';
import { useNip29Store } from '../../../nip29/store';
import { Nip29GroupMetadata } from '../../types';

const updateGroupMetadata = useNip29Store.getState().updateGroupMetadata;

const onEvent = (subId: string | undefined, groupId: string | undefined, event: NDKEvent) => {
  const { dTag } = event;
  if (!dTag) return;

  const nameTag = event.getMatchingTags('name')[0];
  const pictureTag = event.getMatchingTags('picture')[0];
  const aboutTag = event.getMatchingTags('about')[0];
  const isOpen = event.getMatchingTags('open') ? true : false;
  const isPublic = event.getMatchingTags('public') ? true : false;

  const metadata: Nip29GroupMetadata = {
    about: aboutTag?.[1] || '',
    isOpen,
    isPublic,
    name: nameTag?.[1] || '<unnamed>',
    picture: pictureTag?.[1] || '',
  };

  updateGroupMetadata(subId, groupId, metadata);
};

export const useGroupMetadata = (relay: string | undefined, groupId: string | undefined) => {
  const subId = relay && groupId ? `${relay}-${groupId}-metadata` : undefined;

  const metadata = useNip29Store((state) =>
    subId && groupId ? state.groups[subId]?.[groupId]?.metadata : undefined
  );

  const { events, isLoading, createSubscription, removeSubscription } = useSubscription(subId);

  useEffect(() => {
    if (!relay || !groupId || !subId) return;

    const filters: NDKFilter[] = [{ kinds: [39000], '#d': [groupId], limit: 1 }];

    const sub = createSubscription(filters, {}, [relay]);
    sub?.on('event', (event) => onEvent(subId, groupId, event));

    return () => {
      removeSubscription();
    };
  }, [subId, relay, groupId, createSubscription, removeSubscription]);

  return {
    metadata,
    isLoadingMetadata: isLoading,
    metadataEvents: events,
  };
};
