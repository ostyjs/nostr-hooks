import { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';
import { useEffect, useMemo } from 'react';

import { useSubscription } from '../../../hooks';
import { useNip29Store } from '../../store';
import { Nip29GroupMetadata } from '../../types';

const updateGroupMetadata = useNip29Store.getState().updateGroupMetadata;

const onEvent = (subId: string | undefined, event: NDKEvent) => {
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

  const groupId = dTag;

  updateGroupMetadata(subId, groupId, metadata);
};

export const useAllGroupsMetadataRecords = (relay: string | undefined) => {
  const subId = relay ? `${relay}-allGroups-metadata` : undefined;

  const allGroups = useNip29Store((state) => (subId ? state.groups[subId] : undefined));

  const metadataRecords = useMemo(
    () =>
      allGroups
        ? Object.entries(allGroups).reduce(
            (acc, [groupId, group]) => {
              if (group.metadata) acc[groupId] = group.metadata;
              return acc;
            },
            {} as Record<string, Nip29GroupMetadata>
          )
        : {},
    [allGroups]
  );

  const { events, createSubscription, removeSubscription, isLoading, loadMore, hasMore } =
    useSubscription(subId);

  useEffect(() => {
    if (!relay) return;

    const filters: NDKFilter[] = [{ kinds: [39000], limit: 100 }];

    const sub = createSubscription(filters, {}, [relay]);
    sub?.on('event', (event) => onEvent(subId, event));

    return () => {
      removeSubscription();
    };
  }, [subId, relay, createSubscription, removeSubscription]);

  return {
    metadataRecords,
    isLoadingMetadata: isLoading,
    metadataEvents: events,
    loadMoreMetadata: loadMore,
    hasMoreMetadata: hasMore,
  };
};
