import { NDKUserProfile } from '@nostr-dev-kit/ndk';
import { useEffect, useState } from 'react';

import { useNdk } from '../use-ndk';

type ProfileParams = {
  nip05?: string;
  pubkey?: string;
  npub?: string;
  nip46Urls?: string[];
  relayUrls?: string[];
};

/**
 * Custom hook to fetch and manage a user profile.
 *
 * @param [profileParams] - Optional parameters to fetch the profile.
 * @returns An object containing the user profile.
 *
 * @example
 * const { profile } = useProfile({ nip05: 'example@domain.com' });
 */
export const useProfile = (profileParams?: ProfileParams) => {
  const [profile, setProfile] = useState<NDKUserProfile | undefined>(undefined);

  const { ndk } = useNdk();

  useEffect(() => {
    if (!profileParams) return;
    if (profileParams.constructor === Object && Object.keys(profileParams).length === 0) return;
    if (!profileParams.nip05 && !profileParams.pubkey && !profileParams.npub) return;
    if (!ndk) return;

    ndk
      .getUser(profileParams)
      .fetchProfile()
      .then((profile) => {
        setProfile(profile || undefined);
      });
  }, [
    setProfile,
    profileParams?.nip05,
    profileParams?.pubkey,
    profileParams?.npub,
    profileParams?.nip46Urls,
    profileParams?.relayUrls,
    ndk,
  ]);

  return { profile };
};
