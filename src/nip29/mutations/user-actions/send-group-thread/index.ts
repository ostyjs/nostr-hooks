import { NDKEvent, NDKRelaySet } from '@nostr-dev-kit/ndk';

import { useStore } from '../../../../store';
import { Nip29GroupThread } from '../../../types';

export const sendGroupThread = ({
  relay,
  groupId,
  thread,
  onSuccess,
  onError,
}: {
  relay: string;
  groupId: string;
  thread: Pick<Nip29GroupThread, 'content' | 'subject'>;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const ndk = useStore.getState().ndk;
  if (!ndk) return;

  if (!groupId) return;

  const event = new NDKEvent(ndk);
  event.kind = 11;
  event.content = thread.content;
  event.tags = [['h', groupId]];
  thread.subject && event.tags.push(['subject', thread.subject]);

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
