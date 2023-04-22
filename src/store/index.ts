import { Event, Filter, SimplePool, matchFilters } from 'nostr-tools';
import { create } from 'zustand';

import { mergeFilters } from '../utils';

import { Config } from '../types';
import _ from 'lodash';

type Queue = Record<string, Config>;
type SubMap = Record<string, { filters: Filter[]; eose: boolean }>;

interface State {
  pool: SimplePool;
  events: Event[];
  queue: Queue;
  isBatching: boolean;
  subMap: SubMap;
}

interface Actions {
  unSub: (subId: string) => void;
  purgeEvents: (subId: string) => void;
  setIsBatching: (isBatching: boolean) => void;
  clearQueue: () => void;
  addEvent: (event: Event) => void;
  handlePoolSub: (config: Config, subIds: string[]) => void;
  processQueue: () => void;
  addToQueue: (config: Config, subId: string) => void;
  setEose: (subIds: string[]) => void;
  addToSubList: (subId: string, filters: Filter[]) => void;
  removeFromSubList: (subId: string) => void;
  handleNewSub: (config: Config, subId: string) => void;
}

export const useNostrStore = create<State & Actions>()((set, get) => ({
  pool: new SimplePool(),
  events: [],
  queue: {},
  subMap: {},
  isBatching: false,
  setEose: (subIds) => {
    set((store) => ({
      subMap: _.mapValues(store.subMap, (val, key) =>
        subIds.includes(key) ? { ...val, eose: true } : val
      ),
    }));
  },
  unSub: (subId) => {
    get().purgeEvents(subId);
    get().removeFromSubList(subId);
  },
  purgeEvents: (subId) => {
    const subMap = get().subMap;
    const purgingSub = subMap[subId];
    if (!purgingSub) return;

    const purgingFilters = purgingSub.filters;
    const foundAnotherSubWithSameFilters = _.find(
      subMap,
      (sub, key) => key !== subId && _.isEqual(sub.filters, purgingFilters)
    );
    if (foundAnotherSubWithSameFilters) return;

    set((store) => ({
      events: store.events.filter((event) => !matchFilters(purgingFilters, event)),
    }));
  },
  setIsBatching: (isBatching) => set({ isBatching: isBatching }),
  addToQueue: ({ filters, relays }, subId) => {
    set((store) => ({ queue: { ...store.queue, [subId]: { filters, relays } } }));
  },
  clearQueue: () => set({ queue: {} }),
  addEvent: (event) => set((store) => ({ events: [...store.events, event] })),
  addToSubList: (subId, filters) => {
    set((store) => ({
      subMap: { ...store.subMap, [subId]: { filters, eose: false } },
    }));
  },
  removeFromSubList: (subId) => {
    set((store) => ({ subMap: _.omit(store.subMap, subId) }));
  },
  handlePoolSub: ({ filters, relays }, subIds) => {
    const pool = get().pool;
    const sub = pool.sub(_.uniq(relays), mergeFilters(filters));
    sub.on('event', (event: Event) => get().addEvent(event));
    sub.on('eose', () => {
      sub.unsub();
      get().setEose(subIds);
    });
  },
  processQueue: () => {
    const queue = get().queue;
    if (_.isEmpty(queue)) return;

    const { filters, relays } = _.reduce(
      queue,
      (acc, { filters, relays }) => {
        acc.filters.push(...filters);
        acc.relays.push(...relays);
        return acc;
      },
      { filters: [] as Filter[], relays: [] as string[] }
    );

    get().handlePoolSub({ filters, relays }, _.keys(queue));
    get().clearQueue();
    get().setIsBatching(false);
  },
  handleNewSub: ({ filters, relays, options }, subId) => {
    get().addToSubList(subId, filters);
    if (options?.force) {
      get().handlePoolSub({ filters, relays }, [subId]);
      return;
    }
    get().addToQueue({ filters, relays }, subId);
    if (!get().isBatching) {
      get().setIsBatching(true);
      setTimeout(get().processQueue, options?.batchingInterval || 500);
    }
  },
}));
