import { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';
import { useEffect } from 'react';

import { useSubscription } from '../../../hooks';
import { useNip29Store } from '../../../nip29/store';
import { Nip29GroupMember } from '../../types';

const updateGroupMembers = useNip29Store.getState().updateGroupMembers;

export const useGroupMembers = (relay: string | undefined, groupId: string | undefined) => {
  const subId = relay && groupId ? `${relay}-${groupId}-members` : undefined;

  const members = useNip29Store((state) =>
    subId && groupId ? state.groups[subId]?.[groupId]?.members : undefined
  );

  const { events, isLoading, createSubscription } = useSubscription(subId);

  useEffect(() => {
    if (!relay || !groupId || !subId) return;

    const filters: NDKFilter[] = [{ kinds: [39002], '#d': [groupId], limit: 1 }];
    const relayUrls = [relay];

    const onEvent = (event: NDKEvent) => {
      const members: Nip29GroupMember[] = event
        .getMatchingTags('p')
        .filter((pTag) => pTag.length > 1)
        .map((pTag) => ({ pubkey: pTag[1] || '' }));

      updateGroupMembers(subId, groupId, members);
    };

    createSubscription({ filters, relayUrls, onEvent });
  }, [subId, relay, groupId, createSubscription]);

  return {
    members,
    isLoadingMembers: isLoading,
    membersEvents: events,
  };
};
