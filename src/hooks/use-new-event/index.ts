import { NDKEvent } from '@nostr-dev-kit/ndk';
import { useContext } from 'react';

import { NostrHooksContext } from '../../contexts';

export const useNewEvent = () => {
  const { ndk } = useContext(NostrHooksContext);

  const createNewEvent = () => new NDKEvent(ndk);

  return { createNewEvent };
};
