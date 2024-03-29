import { NDKEvent } from '@nostr-dev-kit/ndk';

import { useNdk } from '../use-ndk';

/**
 * Hook for publishing an NDK event.
 *
 * @returns An object containing the `publish` function.
 */
export const usePublish = () => {
  const { ndk } = useNdk();

  /**
   * Publishes an NDK event.
   *
   * @param event - The NDK event to publish.
   * @returns A Promise that resolves to an array of relay sets. If the event fails to publish, the array will be empty.
   */
  const publish = async (event: NDKEvent) => {
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
