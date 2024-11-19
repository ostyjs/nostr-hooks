import NDK, { NDKUserProfile } from '@nostr-dev-kit/ndk';
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
 * @param customNdk - Optional custom NDK instance.
 * @returns An object containing the user profile or null.
 */
export const useProfile = (profileParams?: ProfileParams, customNdk?: NDK) => {
  const [profile, setProfile] = useState<NDKUserProfile | null>(null);

  // Get reactive NDK instance from the global store
  const { ndk: globalNdk } = useNdk();

  // Use the custom NDK instance if provided
  const ndk = customNdk || globalNdk;

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
