import { NDKNip07Signer, NDKNip46Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useCallback } from 'react';

import { useNdk } from '../use-ndk';
import { useSigner } from '../use-signer';

enum LoginMethod {
  Extension = 'extension',
  Remote = 'remote',
  SecretKey = 'secret-key',
}

/**
 * Custom hook for handling login functionality.
 * This hook provides methods for logging in with different login methods,
 * such as extension (NIP07), remote signer (NIP46), and secret key.
 * It also provides a method for re-logging in from previously stored login method in local storage.
 *
 * @returns An object containing the following methods:
 * - `loginWithExtention`: A function for logging in with the extension method (NIP07).
 * - `loginWithRemoteSigner`: A function for logging in with the remote signer method (NIP46).
 * - `loginWithSecretKey`: A function for logging in with the secret key method.
 * - `reLoginFromLocalStorage`: A function for re-logging in from previously stored login method in local storage.
 */
export const useLogin = () => {
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

  const { ndk } = useNdk();
  const { signer, setSigner } = useSigner();

  const loginWithExtention = useCallback(
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
      secretKey?: string;
      onError?: (err: unknown) => void;
      onSuccess?: (signer: NDKPrivateKeySigner) => void;
    }) => {
      const secretKey = options && options.secretKey !== '' ? options.secretKey : localSecretKey;

      if (secretKey && secretKey !== '') {
        try {
          const signer = new NDKPrivateKeySigner(secretKey);

          signer.user().then(() => {
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
          loginWithExtention({
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
    [signer, localLoginMethod, loginWithExtention, loginWithRemoteSigner, loginWithSecretKey]
  );

  const logout = useCallback(() => {
    setLocalLoginMethod(undefined);
    setLocalNip46Address(undefined);
    setLocalSecretKey(undefined);

    setSigner(undefined);
  }, [setLocalLoginMethod, setLocalNip46Address, setLocalSecretKey, setSigner]);

  return {
    loginWithExtention,
    loginWithRemoteSigner,
    loginWithSecretKey,
    loginFromLocalStorage,
    logout,
  };
};
