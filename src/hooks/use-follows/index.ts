import { NDKUser } from '@nostr-dev-kit/ndk';
import { useEffect, useState } from 'react';

import { useNdk } from '../use-ndk';

type ProfileParams = {
  nip05?: string;
  pubkey?: string;
  npub?: string;
  nip46Urls?: string[];
  relayUrls?: string[];
};

export type FollowsStatus = 'idle' | 'loading' | 'success' | 'not-found' | 'error';

export const useFollows = (profileParams?: ProfileParams) => {
  const [follows, setFollows] = useState<NDKUser[] | null | undefined>();
  const [status, setStatus] = useState<FollowsStatus>('idle');

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
      .follows()
      .then((ndkUserSet) => {
        if (ndkUserSet.size > 0) {
          setFollows([...ndkUserSet]);
          setStatus('success');
        } else {
          setFollows(null);
          setStatus('not-found');
        }
      })
      .catch(() => {
        setFollows(undefined);
        setStatus('error');
      });
  }, [
    setFollows,
    setStatus,
    profileParams?.nip05,
    profileParams?.pubkey,
    profileParams?.npub,
    profileParams?.nip46Urls,
    profileParams?.relayUrls,
    ndk,
  ]);

  return { follows, status };
};
