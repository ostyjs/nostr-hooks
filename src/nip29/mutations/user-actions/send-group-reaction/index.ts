import { NDKEvent, NDKRelaySet } from '@nostr-dev-kit/ndk';

import { useStore } from '../../../../store';
import { Nip29GroupReaction } from '../../../types';

export const sendGroupReaction = ({
  relay,
  groupId,
  reaction,
  onSuccess,
  onError,
}: {
  relay: string;
  groupId: string;
  reaction: Pick<Nip29GroupReaction, 'content' | 'targetId'>;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const ndk = useStore.getState().ndk;
  if (!ndk) return;

  if (!groupId) return;

  const event = new NDKEvent(ndk);
  event.kind = 9;
  event.content = reaction.content;
  event.tags = [['h', groupId]];
  reaction.targetId && event.tags.push(['e', reaction.targetId]);

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
