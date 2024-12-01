import { NDKEvent, NDKRelaySet } from '@nostr-dev-kit/ndk';

import { useStore } from '../../../../store';
import { Nip29GroupThreadComment } from '../../../types';

export const sendGroupThreadComment = ({
  relay,
  groupId,
  threadComment,
  onSuccess,
  onError,
}: {
  relay: string;
  groupId: string;
  threadComment: Pick<Nip29GroupThreadComment, 'content' | 'rootId'>;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const ndk = useStore.getState().ndk;
  if (!ndk) return;

  if (!groupId) return;

  const event = new NDKEvent(ndk);
  event.kind = 1111;
  event.content = threadComment.content;
  event.tags = [
    ['h', groupId],
    ['K', '11'],
    ['E', threadComment.rootId],
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
