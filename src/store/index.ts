import { Event, Filter, SimplePool, matchFilters } from 'nostr-tools';
import { create } from 'zustand';

import { areAllFiltersEqual, filterUniqueFilters, filterUniqueRelays } from '../utils';

import { Config } from '../types';

interface State {
  _pool: SimplePool;
  _events: Event[];
  _queue: { config: Config; subId: string }[];
  _isBatching: boolean;
  _subList: { id: string; filters: Filter[]; eose: boolean }[];
}

interface Actions {
  _unSub: (subId: string) => void;
  _purgeEvents: (subId: string) => void;
  _setIsBatching: (isBatching: boolean) => void;
  _clearQueue: () => void;
  _addEvent: (event: Event) => void;
  _handlePoolSub: (config: Config, subIds: string[]) => void;
  _processQueue: () => void;
  _addToQueue: (config: Config, subId: string) => void;
  _setEose: (subIds: string[]) => void;
  _addToSubList: (subId: string, filters: Filter[]) => void;
  _removeFromSubList: (subId: string) => void;
  _handleNewSub: (config: Config, subId: string) => void;
}

export const useNostrStore = create<State & Actions>()((set, get) => ({
  _pool: new SimplePool(),
  _events: [],
  _queue: [],
  _subList: [],
  _isBatching: false,
  _setEose: (subIds) => {
    set((store) => ({
      _subList: store._subList.map((sub) =>
        subIds.includes(sub.id) ? { ...sub, eose: true } : sub
      ),
    }));
  },
  _unSub: (subId) => {
    get()._purgeEvents(subId);
    get()._removeFromSubList(subId);
  },
  _purgeEvents: (subId) => {
    const subList = get()._subList;
    const purgingSub = subList.find((sub) => sub.id === subId);
    if (!purgingSub) return;

    const purgingFilters = purgingSub.filters;
    const otherSubsWithSameFilters = subList.filter((otherSub) => {
      if (otherSub.id === subId) return false;

      const otherSubFilters = otherSub.filters;
      return areAllFiltersEqual(purgingFilters, otherSubFilters);
    });
    if (otherSubsWithSameFilters.length > 0) return;

    set((store) => ({
      _events: store._events.filter((event) => !matchFilters(purgingFilters, event)),
    }));
  },
  _setIsBatching: (isBatching) => set({ _isBatching: isBatching }),
  _addToQueue: ({ filters, relays }, subId) => {
    set((store) => ({
      _queue: [...store._queue, { config: { filters, relays }, subId }],
    }));
  },
  _clearQueue: () => set({ _queue: [] }),
  _addEvent: (event) => set((store) => ({ _events: [...store._events, event] })),
  _addToSubList: (subId, filters) => {
    set((store) => ({ _subList: [...store._subList, { id: subId, filters, eose: false }] }));
  },
  _removeFromSubList: (subId) => {
    set((store) => ({ _subList: store._subList.filter((sub) => sub.id !== subId) }));
  },
  _handlePoolSub: ({ filters, relays }, subIds) => {
    const pool = get()._pool;
    const sub = pool.sub(filterUniqueRelays(relays), filterUniqueFilters(filters));
    sub.on('event', (event: Event) => get()._addEvent(event));
    sub.on('eose', () => {
      sub.unsub();
      get()._setEose(subIds);
    });
  },
  _processQueue: () => {
    const queue = get()._queue;
    if (queue.length > 0) {
      const flattenSub = queue.reduce(
        (acc, curr) => {
          return {
            config: {
              relays: [...acc.config.relays, ...curr.config.relays],
              filters: [...acc.config.filters, ...curr.config.filters],
            },
            subId: curr.subId,
          };
        },
        { config: { relays: [], filters: [] }, subId: '' }
      );
      get()._handlePoolSub(
        { filters: flattenSub.config.filters, relays: flattenSub.config.relays },
        queue.map((sub) => sub.subId)
      );
      get()._clearQueue();
      get()._setIsBatching(false);
    }
  },
  _handleNewSub: ({ filters, relays, options }, subId) => {
    get()._addToSubList(subId, filters);
    if (options?.force) {
      get()._handlePoolSub({ filters, relays }, [subId]);
      return;
    }
    get()._addToQueue({ filters, relays }, subId);
    if (!get()._isBatching) {
      get()._setIsBatching(true);
      setTimeout(get()._processQueue, options?.batchingInterval || 500);
    }
  },
}));
