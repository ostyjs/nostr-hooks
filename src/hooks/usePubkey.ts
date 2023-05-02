import { useEffect } from 'react';

import { useNostrStore } from '../store';

const usePubkey = () => {
  const pubkey = useNostrStore((store) => store.pubkey);
  const setPubkey = useNostrStore((store) => store.setPubkey);

  useEffect(() => {
    if (pubkey) return;

    const localStoragePubkey = localStorage.getItem('pubkey');
    if (localStoragePubkey) {
      setPubkey(localStoragePubkey);
    } else if ((window as any).nostr) {
      (window as any).nostr.getPublickey().then((pubkey: string) => {
        localStorage.setItem('pubkey', pubkey);
        setPubkey(pubkey);
      });
    }
  }, [pubkey, setPubkey]);

  return pubkey;
};

export default usePubkey;
