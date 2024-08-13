import { NDKSigner } from '@nostr-dev-kit/ndk';
import { useCallback } from 'react';

import { useStore } from '../../store';

export const useSigner = () => {
  const ndk = useStore((state) => state.ndk);
  const setNdk = useStore((state) => state.setNdk);

  const signer = ndk.signer;

  const setSigner = useCallback(
    (signer: NDKSigner | undefined) => {
      ndk.signer = signer;
      setNdk(ndk);
    },
    [ndk, setNdk]
  );

  return { signer, setSigner };
};
