import { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';
import { useEffect, useMemo } from 'react';

import { useSubscription } from '../../../hooks';
import { useNip29Store } from '../../store';
import { Nip29GroupMetadata } from '../../types';

const updateGroupMetadata = useNip29Store.getState().updateGroupMetadata;

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

  const { events, isLoading, hasMore, createSubscription, loadMore } = useSubscription(subId);

  useEffect(() => {
    if (!relay || !subId) return;

    const filters: NDKFilter[] = [{ kinds: [39000], limit: 100 }];
    const relayUrls = [relay];

    const onEvent = (event: NDKEvent) => {
      const { dTag: groupId } = event;
      if (!groupId) return;

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
  }, [subId, relay, createSubscription]);

  return {
    metadataRecords,
    isLoadingMetadata: isLoading,
    metadataEvents: events,
    loadMoreMetadata: loadMore,
    hasMoreMetadata: hasMore,
  };
};
