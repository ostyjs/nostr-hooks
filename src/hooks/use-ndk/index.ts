import NDK, { NDKSigner } from '@nostr-dev-kit/ndk';
import cloneDeep from 'lodash/cloneDeep';
import { create } from 'zustand';

type State = {
  ndk: NDK;
};

type Actions = {
  setNdk: (ndk: NDK) => void;
  setSigner: (signer: NDKSigner) => void;
};

/**
 * Custom hook for managing NDK (Nostr Development Kit) instance.
 */
export const useNdk = create<State & Actions>((set) => ({
  /**
   * The NDK instance.
   */
  ndk: new NDK({
    explicitRelayUrls: [
      'wss://nos.lol',
      'wss://relay.nostr.band',
      'wss://relay.damus.io',
      'wss://relay.snort.social',
      'wss://relayable.org',
      'wss://offchain.pub',
      'wss://purplepag.es',
      'wss://relay.primal.net',
      'wss://atlas.nostr.land',
      'wss://eden.nostr.land',
      'wss://relay.noswhere.com',
      'wss://relay.nostr.bg',
    ],
  }),

  /**
   * Sets the NDK instance.
   * @param ndk - The new NDK instance.
   */
  setNdk: (ndk) => ({ ndk }),

  /**
   * Sets the signer for the current NDK instance.
   * @param signer - The new signer.
   */
  setSigner: (signer) =>
    set((state) => {
      if (!state.ndk) return state;

      const ndk = cloneDeep(state.ndk);
      ndk.signer = signer;

      return { ...state, ndk };
    }),
}));
