import { NDKNip07Signer } from '@nostr-dev-kit/ndk';
import { useEffect } from 'react';

import { useNdk } from '../use-ndk';

export const useNip07 = () => {
  const { ndk, setSigner } = useNdk();

  useEffect(() => {
    if (ndk.signer && ndk.signer instanceof NDKNip07Signer) return;

    const signer = new NDKNip07Signer();
    signer.blockUntilReady().then(() => {
      setSigner(signer);
    });
  }, [ndk, setSigner]);
};
