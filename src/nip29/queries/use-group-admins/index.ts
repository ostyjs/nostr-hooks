import { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';
import { useEffect } from 'react';

import { useSubscription } from '../../../hooks';
import { useNip29Store } from '../../../nip29/store';
import { Nip29GroupAdmin } from '../../types';

const updateGroupAdmins = useNip29Store.getState().updateGroupAdmins;

export const useGroupAdmins = (relay: string | undefined, groupId: string | undefined) => {
  const subId = relay && groupId ? `${relay}-${groupId}-admins` : undefined;

  const admins = useNip29Store((state) =>
    subId && groupId ? state.groups[subId]?.[groupId]?.admins : undefined
  );

  const { events, isLoading, createSubscription } = useSubscription(subId);

  useEffect(() => {
    if (!relay || !groupId || !subId) return;

    const filters: NDKFilter[] = [{ kinds: [39001], '#d': [groupId], limit: 1 }];
    const relayUrls = [relay];

    const onEvent = (event: NDKEvent) => {
      const admins: Nip29GroupAdmin[] = event
        .getMatchingTags('p')
        .filter((pTag) => pTag.length > 1)
        .map((pTag) => ({
          pubkey: pTag[1] || '',
          roles: pTag.slice(2),
        }));
      updateGroupAdmins(subId, groupId, admins);
    };

    createSubscription({ filters, relayUrls, onEvent });
  }, [subId, relay, groupId, createSubscription]);

  return {
    admins,
    isLoadingAdmins: isLoading,
    adminsEvents: events,
  };
};
