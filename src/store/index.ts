import NDK, { NDKSigner } from '@nostr-dev-kit/ndk';
import cloneDeep from 'lodash/cloneDeep';
import { create } from 'zustand';

type NDKState = {
  ndk: NDK;
};

type NDKActions = {
  setNdk: (ndk: NDK) => void;
};

type SignerActions = {
  setSigner: (signer: NDKSigner | undefined) => void;
};

export const useStore = create<NDKState & NDKActions & SignerActions>()((set) => ({
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

  setNdk: (ndk) => set({ ndk }),

  setSigner: (signer) =>
    set((state) => {
      if (!state.ndk) return state;

      const ndk = cloneDeep(state.ndk);
      ndk.signer = signer;

      return { ...state, ndk };
    }),
}));
