import { NDKEvent } from '@nostr-dev-kit/ndk';

import { useNdk } from '../../../../hooks';
import { Nip29GroupJoinRequest } from '../../../types';

export const sendGroupJoinRequest = ({
  groupId,
  joinRequest,
  onSuccess,
  onError,
}: {
  groupId: string;
  joinRequest: Pick<Nip29GroupJoinRequest, 'reason' | 'code'>;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const { ndk } = useNdk();
  if (!ndk) return;

  if (!groupId) return;

  const event = new NDKEvent(ndk);
  event.kind = 9021;
  event.content = joinRequest.reason || '';
  event.tags = [['h', groupId]];
  joinRequest.code && event.tags.push(['code', joinRequest.code]);

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
