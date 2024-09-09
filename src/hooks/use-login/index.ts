import NDK, { NDKNip07Signer, NDKNip46Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useCallback } from 'react';

import { useNdk } from '../use-ndk';
import { useSigner } from '../use-signer';

enum LoginMethod {
  Extension = 'extension',
  Remote = 'remote',
  SecretKey = 'secret-key',
}

type Params = {
  customNdk: NDK;
  setCustomNdk: (customNdk: NDK) => void;
};

/**
 * Custom hook for handling login functionality.
 * This hook provides methods for logging in with different login methods,
 * such as extension (NIP07), remote signer (NIP46), and secret key.
 * It also provides a method for re-logging in from previously stored login method in local storage.
 *
 * @param params - Optional parameters for custom NDK instance and its setter function.
 * @returns An object containing the following methods:
 * - `loginWithExtension`: A function for logging in with the extension method (NIP07).
 * - `loginWithRemoteSigner`: A function for logging in with the remote signer method (NIP46).
 * - `loginWithSecretKey`: A function for logging in with the secret key method.
 * - `reLoginFromLocalStorage`: A function for re-logging in from previously stored login method in local storage.
 */
export const useLogin = (params?: Params) => {
  const [localLoginMethod, setLocalLoginMethod] = useLocalStorage<LoginMethod | undefined>(
    'login-method',
    undefined
  );
  const [localNip46Address, setLocalNip46Address] = useLocalStorage<string | undefined>(
    'nip46-address',
    undefined
  );
  const [localSecretKey, setLocalSecretKey] = useLocalStorage<string | undefined>(
    'secret-key',
    undefined
  );

  // Get reactive NDK instance from the global store
  const { ndk: globalNdk } = useNdk();

  // Use the custom NDK instance if provided
  const ndk = params?.customNdk || globalNdk;

  const { signer, setSigner } = useSigner(params);

  const loginWithExtension = useCallback(
    (options?: { onSuccess?: (signer: NDKNip07Signer) => void; onError?: (err: any) => void }) => {
      const signer = new NDKNip07Signer();

      signer
        .blockUntilReady()
        .then(() => {
          setLocalNip46Address(undefined);
          setLocalSecretKey(undefined);

          setLocalLoginMethod(LoginMethod.Extension);

          setSigner(signer);

          options?.onSuccess?.(signer);
        })
        .catch((err) => {
          setLocalLoginMethod(undefined);
          setLocalNip46Address(undefined);
          setLocalSecretKey(undefined);

          options?.onError?.(err);
        });
    },
    [setLocalLoginMethod, setLocalNip46Address, setLocalSecretKey, setSigner]
  );

  const loginWithRemoteSigner = useCallback(
    (options?: {
      nip46Address?: string;
      onSuccess?: (signer: NDKNip46Signer) => void;
      onError?: (err: unknown) => void;
    }) => {
      const nip46Address = options?.nip46Address || localNip46Address;

      if (nip46Address && nip46Address !== '') {
        const signer = new NDKNip46Signer(ndk, nip46Address);

        signer.on('authUrl', (url) => {
          window.open(url, 'auth', 'width=600,height=600');
        });

        signer
          .blockUntilReady()
          .then(() => {
            setLocalSecretKey(undefined);

            setLocalLoginMethod(LoginMethod.Remote);

            setSigner(signer);

            options?.onSuccess?.(signer);
          })
          .catch((err) => {
            setLocalLoginMethod(undefined);
            setLocalNip46Address(undefined);
            setLocalSecretKey(undefined);

            options?.onError?.(err);
          });
      } else {
        setLocalLoginMethod(undefined);
        setLocalNip46Address(undefined);
        setLocalSecretKey(undefined);

        options?.onError?.('NIP46 address is empty');
      }
    },
    [
      localNip46Address,
      ndk,
      setLocalLoginMethod,
      setLocalNip46Address,
      setLocalSecretKey,
      setSigner,
    ]
  );

  const loginWithSecretKey = useCallback(
    (options?: {
      secretKey?: string | undefined;
      onError?: (err: unknown) => void;
      onSuccess?: (signer: NDKPrivateKeySigner) => void;
    }) => {
      const secretKey = options?.secretKey || localSecretKey;

      if (secretKey && secretKey !== '') {
        try {
          const signer = new NDKPrivateKeySigner(secretKey);

          signer.blockUntilReady().then(() => {
            setLocalSecretKey(secretKey);

            setLocalNip46Address(undefined);

            setLocalLoginMethod(LoginMethod.SecretKey);

            setSigner(signer);

            options?.onSuccess?.(signer);
          });
        } catch (err) {
          setLocalLoginMethod(undefined);
          setLocalNip46Address(undefined);
          setLocalSecretKey(undefined);

          options?.onError?.(err);
        }
      } else {
        setLocalLoginMethod(undefined);
        setLocalNip46Address(undefined);
        setLocalSecretKey(undefined);

        options?.onError?.('Secret key is empty');
      }
    },
    [
      localSecretKey,
      localNip46Address,
      setLocalLoginMethod,
      setLocalNip46Address,
      setLocalSecretKey,
      setSigner,
    ]
  );

  const loginFromLocalStorage = useCallback(
    (options?: {
      onError?: (err: unknown) => void;
      onSuccess?: (signer: NDKNip46Signer | NDKNip07Signer | NDKPrivateKeySigner) => void;
    }) => {
      if (signer) return;

      switch (localLoginMethod) {
        case LoginMethod.Extension:
          loginWithExtension({
            onSuccess: (signer) => {
              options?.onSuccess?.(signer);
            },
            onError: (err) => {
              options?.onError?.(err);
            },
          });
          break;
        case LoginMethod.Remote:
          loginWithRemoteSigner({
            onSuccess: (signer) => {
              options?.onSuccess?.(signer);
            },
            onError: (err) => {
              options?.onError?.(err);
            },
          });
          break;
        case LoginMethod.SecretKey:
          loginWithSecretKey({
            onSuccess: (signer) => {
              options?.onSuccess?.(signer);
            },
            onError: (err) => {
              options?.onError?.(err);
            },
          });
          break;
        default:
          options?.onError?.('Login method is not set in local storage');
          break;
      }
    },
    [signer, localLoginMethod, loginWithExtension, loginWithRemoteSigner, loginWithSecretKey]
  );

  const logout = useCallback(() => {
    setLocalLoginMethod(undefined);
    setLocalNip46Address(undefined);
    setLocalSecretKey(undefined);

    setSigner(undefined);
  }, [setLocalLoginMethod, setLocalNip46Address, setLocalSecretKey, setSigner]);

  return {
    loginWithExtension,
    loginWithRemoteSigner,
    loginWithSecretKey,
    loginFromLocalStorage,
    logout,
  };
};
