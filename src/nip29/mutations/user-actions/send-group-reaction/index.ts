import { NDKEvent } from '@nostr-dev-kit/ndk';

import { useNdk } from '../../../../hooks';
import { Nip29GroupReaction } from '../../../types';

export const sendGroupReaction = ({
  groupId,
  reaction,
  onSuccess,
  onError,
}: {
  groupId: string;
  reaction: Pick<Nip29GroupReaction, 'content' | 'targetId'>;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const { ndk } = useNdk();
  if (!ndk) return;

  if (!groupId) return;

  const event = new NDKEvent(ndk);
  event.kind = 9;
  event.content = reaction.content;
  event.tags = [['h', groupId]];
  reaction.targetId && event.tags.push(['e', reaction.targetId]);

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
