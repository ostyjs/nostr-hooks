import { NDKEvent, NDKRelaySet } from '@nostr-dev-kit/ndk';

import { useStore } from '../../../../store';

export const createGroupInvite = ({
  relay,
  groupId,
  code,
  reason,
  onSuccess,
  onError,
}: {
  relay: string;
  groupId: string;
  code: string;
  reason?: string;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const ndk = useStore.getState().ndk;
  if (!ndk) return;

  if (!groupId) return;

  const event = new NDKEvent(ndk);
  event.kind = 9009;
  event.content = reason || '';
  event.tags = [['h', groupId, code]];

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
