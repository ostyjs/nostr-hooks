import NDK from '@nostr-dev-kit/ndk';
import { useEffect } from 'react';

import { useNdk } from '../use-ndk';

export const useNostrHooks = (initialNdk?: NDK | undefined) => {
  const { ndk, setNdk } = useNdk();

  useEffect(() => {
    ndk.connect();
  }, [ndk]);

  useEffect(() => {
    if (initialNdk) {
      setNdk(initialNdk);
    }
  }, [initialNdk]);
};
