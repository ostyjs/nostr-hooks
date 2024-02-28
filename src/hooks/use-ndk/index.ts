import { useContext } from 'react';

import { NostrHooksContext, NostrHooksContextType } from '../../contexts';

export const useNdk = () => {
  const { ndk, setNdk } = useContext(NostrHooksContext) as NostrHooksContextType;

  return { ndk, setNdk };
};
