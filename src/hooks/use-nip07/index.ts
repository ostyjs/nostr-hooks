import { NDKNip07Signer } from '@nostr-dev-kit/ndk';
import { useEffect } from 'react';

import { useNdk } from '../use-ndk';

export const useNip07 = () => {
  const { ndk, updateNdk } = useNdk();

  useEffect(() => {
    if (ndk.signer && ndk.signer instanceof NDKNip07Signer) return;

    updateNdk((draft) => {
      draft.signer = new NDKNip07Signer();
    });
  }, [ndk, updateNdk]);
};
