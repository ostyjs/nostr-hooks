import NDK, { NDKUserProfile } from '@nostr-dev-kit/ndk';
import { useEffect, useState } from 'react';

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
 * @param ndk - NDK instance to use for fetching the user profile.
 * @param profileParams - Optional parameters for fetching the user profile.
 * @returns An object containing the user profile or null.
 */
export const useProfile = (ndk: NDK | undefined, profileParams?: ProfileParams) => {
  const [profile, setProfile] = useState<NDKUserProfile | null>(null);

  useEffect(() => {
    if (!profileParams) return;
    if (profileParams.constructor === Object && Object.keys(profileParams).length === 0) return;
    if (!ndk) return;

    ndk
      .getUser(profileParams)
      .fetchProfile()
      .then((profile) => {
        setProfile(profile);
      });
  }, [
    profileParams?.nip05,
    profileParams?.pubkey,
    profileParams?.npub,
    profileParams?.nip46Urls,
    profileParams?.relayUrls,
    ndk,
  ]);

  return { profile };
};
