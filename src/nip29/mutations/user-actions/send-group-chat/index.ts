import { NDKEvent } from '@nostr-dev-kit/ndk';

import { useNdk } from '../../../../hooks';
import { Nip29GroupChat } from '../../../types';

export const sendGroupChat = ({
  groupId,
  chat,
  onSuccess,
  onError,
}: {
  groupId: string;
  chat: Pick<Nip29GroupChat, 'content' | 'parentId'>;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const { ndk } = useNdk();
  if (!ndk) return;

  if (!groupId) return;

  const event = new NDKEvent(ndk);
  event.kind = 9;
  event.content = chat.content;
  event.tags = [['h', groupId]];
  chat.parentId && event.tags.push(['q', chat.parentId]);

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
