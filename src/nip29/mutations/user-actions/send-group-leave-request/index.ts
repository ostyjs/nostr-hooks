import { NDKEvent } from '@nostr-dev-kit/ndk';

import { useNdk } from '../../../../hooks';
import { Nip29GroupLeaveRequest } from '../../../types';

export const sendGroupLeaveRequest = ({
  groupId,
  leaveRequest,
  onSuccess,
  onError,
}: {
  groupId: string;
  leaveRequest: Pick<Nip29GroupLeaveRequest, 'reason'>;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const { ndk } = useNdk();
  if (!ndk) return;

  if (!groupId) return;

  const event = new NDKEvent(ndk);
  event.kind = 9022;
  event.content = leaveRequest.reason || '';
  event.tags = [['h', groupId]];

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
