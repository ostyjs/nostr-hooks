import { NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
import { useEffect, useState } from 'react';

import { useNdk } from '../use-ndk';

type Props = {
  events?: NDKEvent[];
  users?: NDKUser[];
} & { mutateOriginal?: boolean };

export const useProfiles = ({
  mutateOriginal = true,
  events: _events = [],
  users: _users = [],
}: Props) => {
  const [events, setEvents] = useState<NDKEvent[]>([]);
  const [users, setUsers] = useState<NDKUser[]>([]);

  const { ndk } = useNdk();

  useEffect(() => {
    if (mutateOriginal == false && !ndk) return;

    _events.forEach((event) => {
      if (event.author.profile) return;

      if (mutateOriginal == false) {
        event = new NDKEvent(ndk, event.rawEvent());
      }

      event.author.fetchProfile().then(() => {
        setEvents((prev) => (prev.find((e) => e.id == event.id) ? prev : [...prev, event]));
      });
    });

    _users.forEach((user) => {
      if (user.profile) return;

      if (mutateOriginal == false) {
        user = ndk!.getUser({ pubkey: user.pubkey });
      }

      user.fetchProfile().then(() => {
        setUsers((prev) => (prev.find((u) => u.pubkey == user.pubkey) ? prev : [...prev, user]));
      });
    });
  }, [ndk, _events, _users, mutateOriginal, setEvents, setUsers]);

  return { events, users };
};
