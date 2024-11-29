import { NDKEvent } from '@nostr-dev-kit/ndk';

import { useNdk } from '../../../../hooks';
import { Nip29GroupThreadComment } from '../../../types';

export const sendGroupThreadComment = ({
  groupId,
  threadComment,
  onSuccess,
  onError,
}: {
  groupId: string;
  threadComment: Pick<Nip29GroupThreadComment, 'content' | 'rootId'>;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const { ndk } = useNdk();
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
