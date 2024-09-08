import NDK, { NDKSigner } from '@nostr-dev-kit/ndk';
import { useCallback } from 'react';

import { useStore } from '../../store';

type Params = {
  customNdk: NDK;
  setCustomNdk?: (customNdk: NDK) => void;
};

/**
 * Custom hook for managing the signer. It can work with the global NDK instance or a custom one.
 * If a custom NDK instance is provided, it uses the custom NDK instance and its setter function instead of the global NDK instance.
 * To set the signer of a custom NDK, a custom setter function must be provided.
 *
 * @param params - Optional custom NDK instance and its setter function to use instead of the global NDK instance.
 * @returns An object containing the current signer and a function to update the signer.
 */
export const useSigner = (params?: Params) => {
  // Get reactive NDK instance and its setter function from the global store
  const globalNdk = useStore((state) => state.ndk);
  const setGlobalNdk = useStore((state) => state.setNdk);

  // Use the custom NDK instance and its setter function if provided instead of the global NDK instance
  const ndk = params ? params.customNdk : globalNdk;
  const setNdk = params ? params.setCustomNdk : setGlobalNdk;

  const signer = ndk.signer;

  const setSigner = useCallback(
    (signer: NDKSigner | undefined) => {
      if (!ndk || !setNdk) return;

      ndk.signer = signer;
      setNdk(ndk);
    },
    [ndk, setNdk]
  );

  return { signer, setSigner };
};
