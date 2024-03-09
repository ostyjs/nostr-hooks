import NDK from '@nostr-dev-kit/ndk';
import { createContext, useEffect } from 'react';
import { Updater, useImmer } from 'use-immer';

const initialNdk = new NDK({
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
});

export type NostrHooksContextType = { ndk: NDK; updateNdk: Updater<NDK> };

export const NostrHooksContext = createContext<NostrHooksContextType | null>(null);

export const NostrHooksContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [ndk, updateNdk] = useImmer<NDK>(initialNdk);

  useEffect(() => {
    ndk.connect();
  }, [ndk]);

  return (
    <NostrHooksContext.Provider value={{ ndk, updateNdk }}>{children}</NostrHooksContext.Provider>
  );
};
