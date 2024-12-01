import { NDKEvent, NDKRelaySet } from '@nostr-dev-kit/ndk';

import { useStore } from '../../../../store';
import { Nip29GroupJoinRequest } from '../../../types';

export const sendGroupJoinRequest = ({
  relay,
  groupId,
  joinRequest,
  onSuccess,
  onError,
}: {
  relay: string;
  groupId: string;
  joinRequest: Pick<Nip29GroupJoinRequest, 'reason' | 'code'>;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const ndk = useStore.getState().ndk;
  if (!ndk) return;

  if (!groupId) return;

  const event = new NDKEvent(ndk);
  event.kind = 9021;
  event.content = joinRequest.reason || '';
  event.tags = [['h', groupId]];
  joinRequest.code && event.tags.push(['code', joinRequest.code]);

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
