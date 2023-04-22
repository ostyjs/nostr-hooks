import { useEffect, useRef } from 'react';
import { matchFilters } from 'nostr-tools';

import { useNostrStore } from './store';

import { Config } from './types';

import { generateSubId } from './utils';

export * from './types';
export * as utils from './utils';

export const useNostr = ({ filters, relays, options }: Config) => {
  const subId = useRef<string>(generateSubId());

  const sub = useNostrStore((store) => store.handleNewSub);
  const unSub = useNostrStore((store) => store.unSub);
  const events = useNostrStore(
    (store) => store.events.filter((event) => matchFilters(filters, event)),
    (prev, next) => {
      const matchingPrev = prev.filter((event) => matchFilters(filters, event));
      const matchingNext = next.filter((event) => matchFilters(filters, event));

      if (matchingPrev.length !== matchingNext.length) {
        return false;
      }

      // every event ids in next must be in prev to return true and avoid re-render
      const isTheSame = matchingNext.every((nextEvent) => {
        return matchingPrev.some((prevEvent) => prevEvent.id === nextEvent.id);
      });

      return isTheSame;
    }
  );

  useEffect(() => {
    if (options?.enabled === undefined || options?.enabled === true) {
      sub({ filters, relays, options }, subId.current);
    }

    return () => {
      unSub(subId.current);
    };
  }, [options?.enabled]);

  return {
    events,
  };
};
