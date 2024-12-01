import { NDKEvent, NDKRelaySet } from '@nostr-dev-kit/ndk';

import { useStore } from '../../../../store';

export const removeGroupUser = ({
  relay,
  groupId,
  pubkey,
  onError,
  onSuccess,
  reason,
}: {
  relay: string;
  groupId: string;
  pubkey: string;
  reason?: string;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const ndk = useStore.getState().ndk;
  if (!ndk) return;

  if (!groupId || !pubkey) return;

  const event = new NDKEvent(ndk);
  event.kind = 9001;
  event.content = reason || '';
  event.tags = [
    ['h', groupId],
    ['p', pubkey],
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
