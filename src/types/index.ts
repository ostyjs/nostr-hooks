import {
  NDKConstructorParams,
  NDKEvent,
  NDKFilter,
  NDKNip07Signer,
  NDKNip46Signer,
  NDKPrivateKeySigner,
  NDKSigner,
  NDKSubscription,
  NDKSubscriptionOptions,
} from '@nostr-dev-kit/ndk';

export type InitNdk = (constructorParams?: NDKConstructorParams) => void;

export type SetSigner = (signer: NDKSigner | undefined) => void;

export type LoginData = {
  privateKey: string | undefined;
  loginMethod: 'Extension' | 'Remote' | 'PrivateKey' | undefined;
  nip46Address: string | undefined;
};

export type LoginWithExtension = (options?: {
  onError?: (err: any) => void;
  onSuccess?: (signer: NDKNip07Signer) => void;
}) => void;

export type LoginWithRemoteSigner = (options?: {
  nip46Address?: string | undefined;
  onError?: (err: unknown) => void;
  onSuccess?: (signer: NDKNip46Signer) => void;
}) => void;

export type LoginWithPrivateKey = (options?: {
  privateKey?: string | undefined;
  onError?: (err: unknown) => void;
  onSuccess?: (signer: NDKPrivateKeySigner) => void;
}) => void;
