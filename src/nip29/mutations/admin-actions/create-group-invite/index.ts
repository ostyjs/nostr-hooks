import { NDKEvent } from '@nostr-dev-kit/ndk';

import { useNdk } from '../../../../hooks';

export const createGroupInvite = ({
  groupId,
  code,
  reason,
  onSuccess,
  onError,
}: {
  groupId: string;
  code: string;
  reason?: string;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const { ndk } = useNdk();
  if (!ndk) return;

  if (!groupId) return;

  const event = new NDKEvent(ndk);
  event.kind = 9009;
  event.content = reason || '';
  event.tags = [['h', groupId, code]];

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
