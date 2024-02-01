import NDK, { NDKNip07Signer } from '@nostr-dev-kit/ndk';
import NDKCacheAdapterDexie from '@nostr-dev-kit/ndk-cache-dexie';
import { createContext, useContext, useEffect } from 'react';

export type NostrHooksContextProps = { ndk?: NDK; relays?: string[] };

const initialRelays = ['wss://nos.lol'];
const initialNDK = new NDK({
  signer: new NDKNip07Signer(),
  explicitRelayUrls: initialRelays,
  cacheAdapter: new NDKCacheAdapterDexie({ dbName: 'nostr-hooks-cache' }),
});

export const NostrHooksContext = createContext<NostrHooksContextProps>({
  ndk: initialNDK,
  relays: initialRelays,
});

export const useNostrHooksContext = () => useContext(NostrHooksContext);

export const NostrHooksContextProvider = ({
  children,
  ndk = initialNDK,
  relays = initialRelays,
}: NostrHooksContextProps & { children: React.ReactNode }) => {
  useEffect(() => {
    ndk?.connect();
  }, [ndk]);

  return (
    <NostrHooksContext.Provider value={{ ndk, relays }}>{children}</NostrHooksContext.Provider>
  );
};
