import { NDKEvent } from '@nostr-dev-kit/ndk';

import { useNdk } from '../../../../hooks';

export const removeGroupUser = ({
  groupId,
  pubkey,
  onError,
  onSuccess,
  reason,
}: {
  groupId: string;
  pubkey: string;
  reason?: string;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const { ndk } = useNdk();
  if (!ndk) return;

  if (!groupId || !pubkey) return;

  const event = new NDKEvent(ndk);
  event.kind = 9001;
  event.content = reason || '';
  event.tags = [
    ['h', groupId],
    ['p', pubkey],
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
