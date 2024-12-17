import { NDKEvent, NDKFilter, NDKKind } from '@nostr-dev-kit/ndk';
import { useEffect, useMemo } from 'react';

import { useSubscription } from '../../../hooks';
import { useNip29Store } from '../../../nip29/store';
import { Nip29GroupRole } from '../../types';

const updateGroupRoles = useNip29Store.getState().updateGroupRoles;

export const useGroupRoles = (relay: string | undefined, groupId: string | undefined) => {
  const subId = relay && groupId ? `${relay}-${groupId}-roles` : undefined;

  const roles = useNip29Store((state) =>
    subId && groupId ? state.groups[subId]?.[groupId]?.roles : undefined
  );

  const { events, eose, createSubscription } = useSubscription(subId);

  useEffect(() => {
    if (!relay || !groupId || !subId) return;

    const filters: NDKFilter[] = [{ kinds: [39003 as NDKKind], '#d': [groupId], limit: 1 }];
    const relayUrls = [relay];

    const onEvent = (event: NDKEvent) => {
      const roles: Nip29GroupRole[] = event
        .getMatchingTags('role')
        .filter((t) => t.length > 1)
        .map((t) => {
          let r: Nip29GroupRole = { name: t[1] || '' };
          if (t.length > 2) r.description = t[2] || '';
          return r;
        });

      updateGroupRoles(subId, groupId, roles);
    };

    createSubscription({ filters, relayUrls, onEvent });
  }, [subId, relay, groupId, createSubscription]);

  const isLoading = useMemo(() => (!events || events.length == 0) && !eose, [events, eose]);

  return {
    roles,
    isLoadingRoles: isLoading,
    rolesEvents: events,
  };
};
