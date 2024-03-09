import { useContext } from 'react';

import { NostrHooksContext, NostrHooksContextType } from '../../contexts';

/**
 * Custom hook for accessing the ndk instance and its setter.
 * @returns An object containing the ndk instance and its setter.
 */
export const useNdk = () => {
  const { ndk, updateNdk } = useContext(NostrHooksContext) as NostrHooksContextType;

  return { ndk, updateNdk };
};
