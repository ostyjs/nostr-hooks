import { NDKUserProfile } from '@nostr-dev-kit/ndk';
import { useCallback } from 'react';

import { useActiveUser, useNdk } from '../';

export const useUpdateUserProfile = () => {
  const { activeUser } = useActiveUser();
  const { ndk } = useNdk();

  const updateUserProfile = useCallback(
    (userProfile: NDKUserProfile, onSuccess?: () => void, onError?: (e: any) => void) => {
      if (!ndk || !ndk.signer || !activeUser) {
        return;
      }

      const _u = ndk.getUser({ pubkey: activeUser.pubkey });

      _u.profile = { ...userProfile };

      _u.publish()
        .then(() => onSuccess?.())
        .catch((e) => onError?.(e));
    },
    [ndk, activeUser]
  );

  return { updateUserProfile };
};
