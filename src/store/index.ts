import NDK, {
  NDKConstructorParams,
  NDKNip07Signer,
  NDKNip46Signer,
  NDKPrivateKeySigner,
  NDKSigner,
} from '@nostr-dev-kit/ndk';
import { produce } from 'immer';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type State = {
  // ndk state
  constructorParams: NDKConstructorParams | undefined;

  ndk: NDK | undefined;

  // login state
  loginData: {
    privateKey: string | undefined;
    loginMethod: 'Extension' | 'Remote' | 'PrivateKey' | undefined;
    nip46Address: string | undefined;
  };
};

type Actions = {
  // ndk actions
  initNdk: (constructorParams?: NDKConstructorParams) => void;

  setSigner: (signer: NDKSigner | undefined) => void;

  // login actions
  loginWithExtension: (options?: {
    onError?: (err: any) => void;
    onSuccess?: (signer: NDKNip07Signer) => void;
  }) => void;
  loginWithRemoteSigner: (options?: {
    nip46Address?: string | undefined;
    onError?: (err: unknown) => void;
    onSuccess?: (signer: NDKNip46Signer) => void;
  }) => void;
  loginWithPrivateKey: (options?: {
    privateKey?: string | undefined;
    onError?: (err: unknown) => void;
    onSuccess?: (signer: NDKPrivateKeySigner) => void;
  }) => void;
  loginFromLocalStorage: () => void;
  logout: () => void;
};

export const useStore = create<State & Actions>()(
    persist(
      (set, get) => ({
        // ndk state
        constructorParams: undefined,

        ndk: undefined,

        // login state
        loginData: {
          privateKey: undefined,
          loginMethod: undefined,
          nip46Address: undefined,
        },

        // ndk actions
        initNdk: (constructorParams) => {
        if (!constructorParams) return;

          const ndk = new NDK(constructorParams);

        set(
          produce((state) => {
            state.constructorParams = constructorParams;
            state.ndk = ndk;
          })
        );
        },

        setSigner: (signer) => {
          const newConstructorParams = { ...get().constructorParams };

        set(
          produce((state) => {
            if (signer) {
              newConstructorParams.signer = signer;
            } else {
            delete newConstructorParams.signer;
            }

            const ndk = new NDK(newConstructorParams);

            state.ndk = ndk;
          })
        );
        },

        // login actions
        loginWithExtension: ({
          onError,
          onSuccess,
      }: {
        onError?: (err: any) => void;
        onSuccess?: (signer: NDKNip07Signer) => void;
      } = {}) => {
          const signer = new NDKNip07Signer();

          signer
            .blockUntilReady()
            .then(() => {
            set(
              produce((state) => {
                state.loginData.privateKey = undefined;
                state.loginData.loginMethod = 'Extension';
                state.loginData.nip46Address = undefined;
              })
            );

              get().setSigner(signer);

              onSuccess?.(signer);
            })
            .catch((err) => {
            set(
              produce((state) => {
                state.loginData.privateKey = undefined;
                state.loginData.loginMethod = undefined;
                state.loginData.nip46Address = undefined;
              })
            );

              onError?.(err);
            });
        },

        loginWithRemoteSigner: ({
          nip46Address,
          onError,
          onSuccess,
        }: {
          nip46Address?: string | undefined;
          onError?: (err: unknown) => void;
          onSuccess?: (signer: NDKNip46Signer) => void;
        } = {}) => {
          const { ndk } = get();
          if (!ndk) {
            onError?.('NDK instance is not initialized');

            return;
          }

          const _addr = !nip46Address ? get().loginData.nip46Address : nip46Address;

          if (!_addr) {
          set(
            produce((state) => {
              state.loginData.privateKey = undefined;
              state.loginData.loginMethod = undefined;
              state.loginData.nip46Address = undefined;
            })
          );

            onError?.('NIP46 address is empty');

            return;
          }

          const signer = new NDKNip46Signer(ndk, _addr);

          signer.on('authUrl', (url) => {
            window.open(url, 'auth', 'width=600,height=600');
          });

          signer
            .blockUntilReady()
            .then(() => {
            set(
              produce((state) => {
                state.loginData.privateKey = undefined;
                state.loginData.loginMethod = 'Remote';
                state.loginData.nip46Address = _addr;
              })
            );

              get().setSigner(signer);

              onSuccess?.(signer);
            })
            .catch((err) => {
            set(
              produce((state) => {
                state.loginData.privateKey = undefined;
                state.loginData.loginMethod = undefined;
                state.loginData.nip46Address = undefined;
              })
            );

              onError?.(err);
            });
        },

        loginWithPrivateKey: ({
          privateKey,
          onError,
          onSuccess,
        }: {
          privateKey?: string | undefined;
          onError?: (err: unknown) => void;
          onSuccess?: (signer: NDKPrivateKeySigner) => void;
        } = {}) => {
          const signer = new NDKPrivateKeySigner(privateKey);

          signer
            .blockUntilReady()
            .then(() => {
            set(
              produce((state) => {
                state.loginData.privateKey = privateKey;
                state.loginData.loginMethod = 'PrivateKey';
                state.loginData.nip46Address = undefined;
              })
            );

              get().setSigner(signer);

              onSuccess?.(signer);
            })
            .catch((err) => {
            set(
              produce((state) => {
                state.loginData.privateKey = undefined;
                state.loginData.loginMethod = undefined;
                state.loginData.nip46Address = undefined;
              })
            );

              onError?.(err);
            });
        },

        loginFromLocalStorage: () => {
          const { privateKey, loginMethod, nip46Address } = get().loginData;

          if (loginMethod === 'PrivateKey' && privateKey) {
            get().loginWithPrivateKey({ privateKey });
          } else if (loginMethod === 'Remote' && nip46Address) {
            get().loginWithRemoteSigner({ nip46Address });
          } else if (loginMethod === 'Extension') {
            get().loginWithExtension();
          }
        },

        logout: () => {
        set(
          produce((state) => {
            state.loginData.privateKey = undefined;
            state.loginData.loginMethod = undefined;
            state.loginData.nip46Address = undefined;
          })
        );

          get().setSigner(undefined);
        },
      }),
      {
      name: 'ndk-store',
        partialize: (state) => ({ loginData: state.loginData }),
      }
    )
  );
