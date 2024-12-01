import { NDKEvent, NDKRelaySet } from '@nostr-dev-kit/ndk';

import { useStore } from '../../../../store';
import { Nip29GroupMetadata } from '../../../types';

export const editGroupMetadata = ({
  relay,
  groupId,
  metadata,
  reason,
  onSuccess,
  onError,
}: {
  relay: string;
  groupId: string;
  metadata: Nip29GroupMetadata;
  reason?: string;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const ndk = useStore.getState().ndk;
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
