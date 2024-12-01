import { NDKEvent, NDKRelaySet } from '@nostr-dev-kit/ndk';

import { useStore } from '../../../../store';

export const putGroupUser = ({
  relay,
  groupId,
  pubkey,
  roles,
  reason,
  onSuccess,
  onError,
}: {
  relay: string;
  groupId: string;
  pubkey: string;
  roles?: string[];
  reason?: string;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const ndk = useStore.getState().ndk;
  if (!ndk) return;

  if (!groupId || !pubkey) return;

  const event = new NDKEvent(ndk);
  event.kind = 9000;
  event.content = reason || '';
  event.tags = [
    ['h', groupId],
    ['p', pubkey, ...(roles || [])],
  ];

  event.publish(NDKRelaySet.fromRelayUrls([relay], ndk)).then(
    (r) => {
      if (r.size > 0) {
        onSuccess?.();
      } else {
        onError?.();
      }
    },
    () => {
      onError?.();
    }
  );
};
