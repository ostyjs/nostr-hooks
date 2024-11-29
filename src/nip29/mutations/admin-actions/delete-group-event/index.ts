import { NDKEvent } from '@nostr-dev-kit/ndk';

import { useNdk } from '../../../../hooks';

export const deleteGroupEvent = ({
  groupId,
  eventId,
  reason,
  onSuccess,
  onError,
}: {
  groupId: string;
  eventId: string;
  reason?: string;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const { ndk } = useNdk();
  if (!ndk) return;

  if (!groupId || !eventId) return;

  const event = new NDKEvent(ndk);
  event.kind = 9005;
  event.content = reason || '';
  event.tags = [
    ['h', groupId],
    ['e', eventId],
  ];

  event.publish().then(
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
