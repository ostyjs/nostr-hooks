import { Event, EventTemplate } from 'nostr-tools';
import { useCallback } from 'react';

import { useNostrStore } from '../store';

import { signEventWithNip07, signEventWithPrivateKey } from '../utils';

const usePublish = (relays: string[], privateKey?: string) => {
  const storePublish = useNostrStore(useCallback((store) => store.publish, []));

  const publish = useCallback(
    (partialEvent: Partial<EventTemplate>) =>
      new Promise<Event>(async (resolve, reject) => {
        if (!partialEvent.kind) {
          reject(new Error('Kind is not provided'));
          return;
        }

        const nowInSeconds = Math.floor(Date.now() / 1000);

        const eventTemplate: EventTemplate = {
          ...partialEvent,
          content: partialEvent.content || '',
          created_at: partialEvent.created_at || nowInSeconds,
          kind: partialEvent.kind,
          tags: partialEvent.tags || [],
        };

        try {
          const signedEvent = privateKey
            ? signEventWithPrivateKey(eventTemplate, privateKey)
            : await signEventWithNip07(eventTemplate);

          await storePublish(relays, signedEvent);
          resolve(signedEvent);
        } catch (error) {
          reject(error);
        }
      }),
    [relays, privateKey, storePublish]
  );

  return publish;
};

export default usePublish;
