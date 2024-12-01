import { NDKEvent, NDKRelaySet } from '@nostr-dev-kit/ndk';

import { useStore } from '../../../../store';

export const deleteGroupEvent = ({
  relay,
  groupId,
  eventId,
  reason,
  onSuccess,
  onError,
}: {
  relay: string;
  groupId: string;
  eventId: string;
  reason?: string;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const ndk = useStore.getState().ndk;
  if (!ndk) return;

  if (!groupId || !eventId) return;

  const event = new NDKEvent(ndk);
  event.kind = 9005;
  event.content = reason || '';
  event.tags = [
    ['h', groupId],
    ['e', eventId],
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
