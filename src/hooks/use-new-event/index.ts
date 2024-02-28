import { NDKEvent } from '@nostr-dev-kit/ndk';

import { useNdk } from '../use-ndk';

export const useNewEvent = () => {
  const { ndk } = useNdk();

  const createNewEvent = () => new NDKEvent(ndk);

  return { createNewEvent };
};
