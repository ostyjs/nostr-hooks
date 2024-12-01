import { NDKEvent, NDKRelaySet } from '@nostr-dev-kit/ndk';

import { useStore } from '../../../../store';
import { Nip29GroupChat } from '../../../types';

export const sendGroupChat = ({
  relay,
  groupId,
  chat,
  onSuccess,
  onError,
}: {
  relay: string;
  groupId: string;
  chat: Pick<Nip29GroupChat, 'content' | 'parentId'>;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const ndk = useStore.getState().ndk;
  if (!ndk) return;

  if (!groupId) return;

  const event = new NDKEvent(ndk);
  event.kind = 9;
  event.content = chat.content;
  event.tags = [['h', groupId]];
  chat.parentId && event.tags.push(['q', chat.parentId]);

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
