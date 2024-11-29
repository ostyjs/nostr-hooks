import { NDKEvent } from '@nostr-dev-kit/ndk';

import { useNdk } from '../../../../hooks';

export const deleteGroup = ({
  groupId,
  reason,
  onSuccess,
  onError,
}: {
  groupId: string;
  reason?: string;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const { ndk } = useNdk();
  if (!ndk) return;

  if (!groupId) return;

  const event = new NDKEvent(ndk);
  event.kind = 9008;
  event.content = reason || '';
  event.tags = [['h', groupId]];

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
