import NDK, {
  NDKConstructorParams,
} from '@nostr-dev-kit/ndk';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type State = {
  // ndk state
  constructorParams: NDKConstructorParams | undefined;

  ndk: NDK | undefined;
};

type Actions = {
  // ndk actions
  initNdk: (constructorParams?: NDKConstructorParams) => void;

  setSigner: (signer: NDKSigner | undefined) => void;

};

export const createStore = (storeName: string) => {
  return create<State & Actions>()(
    persist(
      (set, get) => ({
        // ndk state
        constructorParams: undefined,

        ndk: undefined,

        // ndk actions
        initNdk: (constructorParams) => {
          const ndk = new NDK(constructorParams);

          set({ constructorParams, ndk });
        },

        setSigner: (signer) => {
          const newConstructorParams = { ...get().constructorParams };

          if (!signer) {
            delete newConstructorParams.signer;
          } else {
            newConstructorParams.signer = signer;
          }

          get().initNdk(newConstructorParams);
        },
      }),
      {
        name: storeName || 'ndk-store',
        partialize: (state) => ({ loginData: state.loginData }),
      }
    )
  );
};
