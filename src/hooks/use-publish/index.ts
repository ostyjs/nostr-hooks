import NDK, { NDKEvent, NDKRelay } from '@nostr-dev-kit/ndk';

import { useNdk } from '../use-ndk';

/**
 * Hook for publishing an NDK event.
 *
 * @param customNdk - Optional NDK instance to use for the publish instead of the global NDK instance.
 * @returns An object containing the `publish` function.
 */
export const usePublish = (params?: { customNdk?: NDK | undefined }) => {
  // Get reactive NDK instance from the global store
  const { ndk: globalNdk } = useNdk();

  // Use the custom NDK instance if provided
  const ndk = params?.customNdk || globalNdk;

  /**
   * Publishes an NDK event.
   *
   * @param event - The NDK event to publish.
   * @returns A Promise that resolves to an array of relay sets. If the event fails to publish, the array will be empty.
   */
  const publish = async (event: NDKEvent): Promise<NDKRelay[]> => {
    if (!ndk) return [];

    try {
      const relaySet = await event.publish();
      return [...relaySet];
    } catch (error) {
      return [];
    }
  };

  return { publish };
};
