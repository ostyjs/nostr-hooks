import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
import { base64 } from '@scure/base';
import { useCallback } from 'react';

import { useNdk } from '../use-ndk';

export const useNip98 = () => {
  const { ndk } = useNdk();

  const getToken = useCallback(
    async ({ url, method }: { url: string; method: string }) => {
      if (!ndk || !ndk.signer) {
        return;
      }

      const e = new NDKEvent(ndk);
      e.kind = NDKKind.HttpAuth;
      e.tags = [
        ['u', url],
        ['method', method],
      ];
      await e.sign();
      const signedEvent = await e.toNostrEvent();

      const token = 'Nostr ' + base64.encode(new TextEncoder().encode(JSON.stringify(signedEvent)));

      return token;
    },
    [ndk]
  );

  return { getToken };
};
