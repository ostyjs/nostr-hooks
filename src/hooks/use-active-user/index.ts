import { NDKUser } from '@nostr-dev-kit/ndk';
import { useEffect, useState } from 'react';

import { useNdk } from '../use-ndk';

/**
 * Custom hook that retrieves the active user using the NDK instance and the signer.
 *
 * @param fetchProfile - Optional boolean indicating whether to fetch profile for the active user. Default is false.
 * @returns An object containing the active user or undefined if there is no active user.
 */
export const useActiveUser = (fetchProfile?: boolean) => {
  const [activeUser, setActiveUser] = useState<NDKUser | undefined>(undefined);

  const { ndk } = useNdk();

  useEffect(() => {
    if (!ndk) {
      setActiveUser(undefined);
      return;
    }

    const { signer } = ndk;
    if (!signer) {
      setActiveUser(undefined);
      return;
    }

    signer.user().then((user) => {
      if (!user) {
        setActiveUser(undefined);
        return;
      }

      if (!fetchProfile) {
        setActiveUser(user);
        return;
      }

      user.fetchProfile().finally(() => {
        setActiveUser(user);
      });
    });
  }, [ndk, fetchProfile]);

  return { activeUser };
};
