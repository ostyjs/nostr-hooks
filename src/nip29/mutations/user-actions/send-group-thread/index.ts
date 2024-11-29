import { NDKEvent } from '@nostr-dev-kit/ndk';

import { useNdk } from '../../../../hooks';
import { Nip29GroupThread } from '../../../types';

export const sendGroupThread = ({
  groupId,
  thread,
  onSuccess,
  onError,
}: {
  groupId: string;
  thread: Pick<Nip29GroupThread, 'content' | 'subject'>;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const { ndk } = useNdk();
  if (!ndk) return;

  if (!groupId) return;

  const event = new NDKEvent(ndk);
  event.kind = 11;
  event.content = thread.content;
  event.tags = [['h', groupId]];
  thread.subject && event.tags.push(['subject', thread.subject]);

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
