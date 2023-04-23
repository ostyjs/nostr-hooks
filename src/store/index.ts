import _ from 'lodash';
import { Event, Filter, SimplePool, matchFilters } from 'nostr-tools';
import { create } from 'zustand';

import { mergeFilters } from '../utils';

import { Config } from '../types';

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
  purgeEvents: (subId: string, force?: boolean) => void;
  setIsBatching: (isBatching: boolean) => void;
  clearQueue: () => void;
  addEvent: (event: Event) => void;
  handlePoolSub: (config: Config, subIds: string[]) => void;
  processQueue: () => void;
  addToQueue: (config: Config, subId: string) => void;
  setEoseBySubIds: (subIds: string[], eose: boolean) => void;
  setEoseByFilters: (filters: Filter[], eose: boolean) => void;
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
  setEoseBySubIds: (subIds, eose) => {
    set((store) => ({
      subMap: _.mapValues(store.subMap, (val, key) =>
        subIds.includes(key) ? { ...val, eose } : val
      ),
    }));
  },
  setEoseByFilters: (filters, eose) => {
    const subMap = get().subMap;
    const subIds = _.keys(subMap);
    const subIdsWithSameFilters = subIds.filter((subId) =>
      _.isEqual(subMap[subId]?.filters, filters)
    );

    get().setEoseBySubIds(subIdsWithSameFilters, eose);
  },
  unSub: (subId) => {
    get().purgeEvents(subId);
    get().removeFromSubList(subId);
  },
  purgeEvents: (subId, force = false) => {
    const subMap = get().subMap;
    const purgingSub = subMap[subId];
    if (!purgingSub) return;

    const purgingFilters = purgingSub.filters;

    if (!force) {
      const foundAnotherSubWithSameFilters = _.find(
        subMap,
        (sub, key) => key !== subId && _.isEqual(sub.filters, purgingFilters)
      );
      if (foundAnotherSubWithSameFilters) return;
    }

    set((store) => ({
      events: store.events.filter((event) => !matchFilters(purgingFilters, event)),
    }));
  },
  setIsBatching: (isBatching) => set({ isBatching: isBatching }),
  addToQueue: ({ filters, relays }, subId) => {
    set((store) => ({ queue: { ...store.queue, [subId]: { filters, relays } } }));
  },
  clearQueue: () => set({ queue: {} }),
  addEvent: (event) => {
    const events = get().events;
    if (_.find(events, (e) => _.isEqual(e, event))) {
      return;
    }
    set((store) => ({ events: [...store.events, event] }));
  },
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
      get().setEoseBySubIds(subIds, true);
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
    if (options?.invalidate === undefined || options?.invalidate === false) {
      const events = get().events;
      const matchingEvents = events.filter((event) => matchFilters(filters, event));
      if (matchingEvents.length) {
        return;
      }
    }

    get().addToSubList(subId, filters);
    get().purgeEvents(subId, true);
    get().setEoseByFilters(filters, false);
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
