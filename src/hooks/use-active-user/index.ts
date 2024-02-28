import { NDKUser } from '@nostr-dev-kit/ndk';
import { useEffect, useState } from 'react';

import { useNdk } from '../use-ndk';

/**
 * Custom hook that retrieves the active user using the NDK instance and the signer.
 * @returns An object containing the active user or undefined if there is no active user.
 */
export const useActiveUser = () => {
  const { ndk } = useNdk();

  const [activeUser, setActiveUser] = useState<NDKUser | undefined>(undefined);

  useEffect(() => {
    if (!ndk || !ndk.signer) return;

    ndk.signer.user().then((user) => {
      user &&
        user.fetchProfile().then(() => {
          setActiveUser(user);
        });
    });
  }, [ndk, setActiveUser]);

  return { activeUser };
};
