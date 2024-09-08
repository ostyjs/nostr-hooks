import NDK, { NDKEvent } from '@nostr-dev-kit/ndk';

import { useNdk } from '../use-ndk';

/**
 * Custom hook for creating a new event.
 *
 * @param customNdk - Optional custom NDK instance to use instead of the global NDK instance.
 * @returns An object with a `createNewEvent` function that creates a new NDKEvent instance with the provided NDK instance.
 */
export const useNewEvent = (params?: { customNdk?: NDK | undefined }) => {
  // Get reactive NDK instance from the global store
  const { ndk: globalNdk } = useNdk();

  // Use the custom NDK instance if provided
  const ndk = params?.customNdk || globalNdk;

  const createNewEvent = () => new NDKEvent(ndk);

  return { createNewEvent };
};
