import { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';
import { useEffect } from 'react';

import { useSubscription } from '../../../hooks';
import { useNip29Store } from '../../../nip29/store';
import { Nip29GroupMember } from '../../types';

const updateGroupMembers = useNip29Store.getState().updateGroupMembers;

const onEvent = (subId: string | undefined, groupId: string | undefined, event: NDKEvent) => {
  const members: Nip29GroupMember[] = event
    .getMatchingTags('p')
    .filter((pTag) => pTag.length > 1)
    .map((pTag) => ({
      pubkey: pTag[1] || '',
    }));

  updateGroupMembers(subId, groupId, members);
};

export const useGroupMembers = (relay: string | undefined, groupId: string | undefined) => {
  const subId = relay && groupId ? `${relay}-${groupId}-members` : undefined;

  const members = useNip29Store((state) =>
    subId && groupId ? state.groups[subId]?.[groupId]?.members : undefined
  );

  const { events, isLoading, createSubscription, removeSubscription } = useSubscription(subId);

  useEffect(() => {
    if (!relay || !groupId || !subId) return;

    const filters: NDKFilter[] = [{ kinds: [39002], '#d': [groupId], limit: 1 }];

    const sub = createSubscription(filters, {}, [relay]);
    sub?.on('event', (event) => onEvent(subId, groupId, event));

    return () => {
      removeSubscription();
    };
  }, [subId, relay, groupId, createSubscription, removeSubscription]);

  return {
    members,
    isLoadingMembers: isLoading,
    membersEvents: events,
  };
};
