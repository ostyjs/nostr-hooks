import { NDKEvent } from '@nostr-dev-kit/ndk';

import { useNdk } from '../../../../hooks';

export const putGroupUser = ({
  groupId,
  pubkey,
  roles,
  reason,
  onSuccess,
  onError,
}: {
  groupId: string;
  pubkey: string;
  roles?: string[];
  reason?: string;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const { ndk } = useNdk();
  if (!ndk) return;

  if (!groupId || !pubkey) return;

  const event = new NDKEvent(ndk);
  event.kind = 9000;
  event.content = reason || '';
  event.tags = [
    ['h', groupId],
    ['p', pubkey, ...(roles || [])],
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
