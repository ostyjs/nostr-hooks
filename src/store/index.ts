import { Event, SimplePool } from 'nostr-tools';
import { create } from 'zustand';

import { filterUniqueFilters, filterUniqueRelays } from '../utils';

import { Config } from '../types';

interface State {
  _pool: SimplePool;
  _events: Event[];
  _subscriptionQueue: Config[];
  _isBatching: boolean;
}

interface Actions {
  _setIsBatching: (isBatching: boolean) => void;
  _clearQueue: () => void;
  _addEvent: (event: Event) => void;
  _handlePoolSub: (config: Config) => void;
  _processQueue: () => void;
  _addToQueue: (config: Config) => void;
  _handleNewSub: (config: Config) => void;
}

export const useNostrStore = create<State & Actions>()((set, get) => ({
  _pool: new SimplePool(),
  _events: [],
  _subscriptionQueue: [],
  _isBatching: false,
  _setIsBatching: (isBatching) => set({ _isBatching: isBatching }),
  _addToQueue: ({ filters, relays }) => {
    set((store) => ({ _subscriptionQueue: [...store._subscriptionQueue, { filters, relays }] }));
  },
  _clearQueue: () => set({ _subscriptionQueue: [] }),
  _addEvent: (event) => set((store) => ({ _events: [...store._events, event] })),
  _handlePoolSub: ({ filters, relays }) => {
    const pool = get()._pool;
    const sub = pool.sub(filterUniqueRelays(relays), filterUniqueFilters(filters));
    sub.on('event', (event: Event) => {
      get()._addEvent(event);
    });
    sub.on('eose', () => {
      sub.unsub();
    });
  },
  _processQueue: () => {
    const subscriptionQueue = get()._subscriptionQueue;
    if (subscriptionQueue.length > 0) {
      const flattenSub = subscriptionQueue.reduce<Config>(
        (acc, curr) => {
          return {
            relays: [...acc.relays, ...curr.relays],
            filters: [...acc.filters, ...curr.filters],
          };
        },
        { relays: [], filters: [] }
      );

      get()._handlePoolSub({ filters: flattenSub.filters, relays: flattenSub.relays });

      get()._clearQueue();
      get()._setIsBatching(false);
    }
  },
  _handleNewSub: ({ filters, relays, options }: Config) => {
    if (options?.force) {
      get()._handlePoolSub({ filters, relays });

      return;
    }

    get()._addToQueue({ filters, relays });
    if (!get()._isBatching) {
      get()._setIsBatching(true);
      setTimeout(get()._processQueue, options?.batchingInterval || 500);
    }
  },
}));
