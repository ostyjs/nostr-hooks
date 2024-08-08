import { NDKUser } from '@nostr-dev-kit/ndk';
import { useEffect, useState } from 'react';

import { useSigner } from '../use-signer';

/**
 * Custom hook that retrieves the active user using the NDK instance and the signer.
 *
 * @param fetchProfile - Optional boolean indicating whether to fetch profile for the active user. Default is false.
 * @returns An object containing the active user or undefined if there is no active user.
 */
export const useActiveUser = (options?: { fetchProfile?: boolean | undefined }) => {
  const [activeUser, setActiveUser] = useState<NDKUser | undefined>(undefined);

  const { signer } = useSigner();

  useEffect(() => {
    if (signer) {
      signer.user().then((user) => {
        if (!user) return;

        if (options?.fetchProfile) {
          user.fetchProfile().finally(() => {
            setActiveUser(user);
          });
        } else {
          setActiveUser(user);
        }
      });
    } else {
      setActiveUser(undefined);
    }
  }, [signer, options?.fetchProfile]);

  return { activeUser };
};
