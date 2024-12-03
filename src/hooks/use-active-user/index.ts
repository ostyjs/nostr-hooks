import { NDKUser } from '@nostr-dev-kit/ndk';
import { useEffect, useState } from 'react';

import { useNdk } from '../use-ndk';

export type ActiveUserStatus = 'loading' | 'success' | 'no-user';

/**
 * Custom hook that retrieves the active user using the NDK instance and the signer.
 *
 * @param fetchProfile - Optional boolean indicating whether to fetch profile for the active user. Default is false.
 * @returns An object containing the active user, null if there is no user, or undefined if the user is being fetched.
 */
export const useActiveUser = (fetchProfile?: boolean) => {
  const [activeUser, setActiveUser] = useState<NDKUser | null | undefined>(undefined);
  const [status, setStatus] = useState<ActiveUserStatus>('loading');

  const { ndk } = useNdk();

  useEffect(() => {
    setStatus('loading');

    if (!ndk) {
      setStatus('no-user');

      setActiveUser(null);
      return;
    }

    const { signer } = ndk;
    if (!signer) {
      setStatus('no-user');

      setActiveUser(null);
      return;
    }

    signer.user().then((user) => {
      if (!user) {
        setStatus('no-user');

        setActiveUser(null);
        return;
      }

      if (!fetchProfile) {
        setStatus('success');

        setActiveUser(user);
        return;
      }

      user.fetchProfile().finally(() => {
        setStatus('success');

        setActiveUser(user);
      });
    });
  }, [ndk, fetchProfile, setStatus]);

  return { activeUser, status };
};
