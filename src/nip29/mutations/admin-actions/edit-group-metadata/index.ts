import { NDKEvent } from '@nostr-dev-kit/ndk';

import { useNdk } from '../../../../hooks';
import { Nip29GroupMetadata } from '../../../types';

export const editGroupMetadata = ({
  groupId,
  metadata,
  reason,
  onSuccess,
  onError,
}: {
  groupId: string;
  metadata: Nip29GroupMetadata;
  reason?: string;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const { ndk } = useNdk();
  if (!ndk) return;

  if (!groupId) return;

  const event = new NDKEvent(ndk);
  event.kind = 9002;
  event.content = reason || '';
  event.tags = [
    ['h', groupId],
    ['name', metadata.name],
    ['about', metadata.about],
    ['picture', metadata.picture],
    [metadata.isPublic ? 'public' : 'private'],
    [metadata.isOpen ? 'open' : 'closed'],
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
