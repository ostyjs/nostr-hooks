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

export const useProfile = (profileParams: ProfileParams, ndk?: NDK) => {
  const [profile, setProfile] = useState<NDKUserProfile | null>(null);

  const { ndk: _ndk } = useNdk();

  useEffect(() => {
    if (!profileParams) return;

    if (!ndk) {
      ndk = _ndk;
    }

    if (!ndk) return;

    ndk
      .getUser(profileParams)
      .fetchProfile()
      .then((profile) => {
        setProfile(profile);
      });
  }, [profileParams, _ndk, ndk]);

  return { profile };
};
