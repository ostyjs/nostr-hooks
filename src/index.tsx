import { useEffect } from 'react';
import { matchFilters } from 'nostr-tools';

import { useNostrStore } from './store';

import { Config } from './types';

export * from './types';
export * as utils from './utils';

export const useNostr = ({ filters, relays, options }: Config) => {
  const sub = useNostrStore((store) => store._handleNewSub);

  useEffect(() => {
    if (options?.enabled === undefined || options?.enabled === true) {
      sub({ filters, relays, options });
    }
  }, [options?.enabled]);

  const events = useNostrStore(
    (store) => store._events.filter((event) => matchFilters(filters, event)),
    (prev, next) => {
      return prev.length === next.length;
    }
  );

  return {
    events,
  };
};
