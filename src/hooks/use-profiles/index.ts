import { NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
import { useEffect, useState } from 'react';

import { useNdk } from '../use-ndk';

type Props = (
  | {
      type: 'events';
      events: NDKEvent[];
    }
  | {
      type: 'users';
      users: NDKUser[];
    }
) & { mutateOriginal?: boolean };

export const useProfiles = <T extends Props>(props: T) => {
  const { mutateOriginal = true } = props;

  const [events, setEvents] = useState<NDKEvent[]>([]);
  const [users, setUsers] = useState<NDKUser[]>([]);

  const ndk = useNdk();

  useEffect(() => {
    if (props.type == 'events') {
      props.events.forEach((event) => {
        if (mutateOriginal == false) {
          event = new NDKEvent(ndk, event.rawEvent());
        }

        event.author.fetchProfile().then(() => {
          setEvents((prev) => (prev.find((e) => e.id == event.id) ? prev : [...prev, event]));
        });
      });
    } else {
      props.users.forEach((user) => {
        if (mutateOriginal == false) {
          user = new NDKUser({ pubkey: user.pubkey });
        }

        user.fetchProfile().then(() => {
          setUsers((prev) => (prev.find((u) => u.pubkey == user.pubkey) ? prev : [...prev, user]));
        });
      });
    }
  }, [props, setEvents, setUsers]);

  if (props.type == 'events') {
    return events as T extends { type: 'events' } ? NDKEvent[] : never;
  } else {
    return users as T extends { type: 'users' } ? NDKUser[] : never;
  }
};
