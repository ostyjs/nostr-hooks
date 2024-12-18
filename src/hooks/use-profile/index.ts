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

export type ProfileStatus = 'idle' | 'loading' | 'success' | 'not-found' | 'error';

/**
 * Custom hook to fetch a user profile.
 *
 * @param [profileParams] - Optional parameters to fetch the profile.
 * @returns An object containing the user profile, null if the profile is not found,
 * or undefined if the profile is being fetched.
 * The status of the profile fetch is also returned.
 *
 * @example
 * const { profile } = useProfile({ nip05: 'example@domain.com' });
 */
export const useProfile = (profileParams?: ProfileParams) => {
  const [profile, setProfile] = useState<NDKUserProfile | null | undefined>();
  const [status, setStatus] = useState<ProfileStatus>('idle');

  const { ndk } = useNdk();

  useEffect(() => {
    setStatus('idle');

    if (!profileParams) return;
    if (profileParams.constructor === Object && Object.keys(profileParams).length === 0) return;
    if (!profileParams.nip05 && !profileParams.pubkey && !profileParams.npub) return;
    if (!ndk) return;

    setStatus('loading');

    ndk
      .getUser(profileParams)
      .fetchProfile()
      .then((profile) => {
        setProfile(profile);

        setStatus(profile ? 'success' : 'not-found');
      })
      .catch(() => {
        setProfile(undefined);
        setStatus('error');
      });
  }, [
    setProfile,
    setStatus,
    profileParams?.nip05,
    profileParams?.pubkey,
    profileParams?.npub,
    profileParams?.nip46Urls,
    profileParams?.relayUrls,
    ndk,
  ]);

  return { profile, status };
};
