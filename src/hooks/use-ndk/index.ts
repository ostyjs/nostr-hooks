import { useContext } from 'react';

import { NostrHooksContext } from '../../contexts';

export const useNdk = () => {
  const { ndk } = useContext(NostrHooksContext);

  return ndk;
};
