import { NDKEvent, NDKRelaySet } from '@nostr-dev-kit/ndk';

import { useStore } from '../../../../store';
import { Nip29GroupLeaveRequest } from '../../../types';

export const sendGroupLeaveRequest = ({
  relay,
  groupId,
  leaveRequest,
  onSuccess,
  onError,
}: {
  relay: string;
  groupId: string;
  leaveRequest: Pick<Nip29GroupLeaveRequest, 'reason'>;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const ndk = useStore.getState().ndk;
  if (!ndk) return;

  if (!groupId) return;

  const event = new NDKEvent(ndk);
  event.kind = 9022;
  event.content = leaveRequest.reason || '';
  event.tags = [['h', groupId]];

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
