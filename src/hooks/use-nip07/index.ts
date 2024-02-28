import NDK, { NDKNip07Signer } from '@nostr-dev-kit/ndk';
import { useEffect } from 'react';

import { useNdk } from '../use-ndk';

export const useNip07 = () => {
  const { ndk, setNdk } = useNdk();

  useEffect(() => {
    if (ndk.signer && ndk.signer instanceof NDKNip07Signer) return;

    const signer = new NDKNip07Signer();

    setNdk(new NDK({ ...ndk, signer }));
  }, [ndk, setNdk]);
};
