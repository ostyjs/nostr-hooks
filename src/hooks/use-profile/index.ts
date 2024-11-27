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
 * Custom hook for fetching a user profile.
 *
 * @param profileParams - Optional parameters for fetching the user profile.
 * @returns An object containing the user profile or undefined.
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
