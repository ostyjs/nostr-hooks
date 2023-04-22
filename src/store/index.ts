import { Event, Filter, SimplePool, matchFilters } from 'nostr-tools';
import { create } from 'zustand';

import { mergeFilters } from '../utils';

import { Config } from '../types';
import _ from 'lodash';

type Queue = { config: Config; subId: string }[];
type SubList = { id: string; filters: Filter[]; eose: boolean }[];

interface State {
  pool: SimplePool;
  events: Event[];
  queue: Queue;
  isBatching: boolean;
  subList: SubList;
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
  queue: [],
  subList: [],
  isBatching: false,
  setEose: (subIds) => {
    set((store) => ({
      subList: store.subList.map((sub) => (subIds.includes(sub.id) ? { ...sub, eose: true } : sub)),
    }));
  },
  unSub: (subId) => {
    get().purgeEvents(subId);
    get().removeFromSubList(subId);
  },
  purgeEvents: (subId) => {
    const subList = get().subList;
    const purgingSub = subList.find((sub) => sub.id === subId);
    if (!purgingSub) return;

    const purgingFilters = purgingSub.filters;
    const otherSubsWithSameFilters = subList.filter((otherSub) => {
      if (otherSub.id === subId) return false;

      const otherSubFilters = otherSub.filters;
      return _.isEqual(purgingFilters, otherSubFilters);
    });
    if (otherSubsWithSameFilters.length > 0) return;

    set((store) => ({
      events: store.events.filter((event) => !matchFilters(purgingFilters, event)),
    }));
  },
  setIsBatching: (isBatching) => set({ isBatching: isBatching }),
  addToQueue: ({ filters, relays }, subId) => {
    set((store) => ({
      queue: [...store.queue, { config: { filters, relays }, subId }],
    }));
  },
  clearQueue: () => set({ queue: [] }),
  addEvent: (event) => set((store) => ({ events: [...store.events, event] })),
  addToSubList: (subId, filters) => {
    set((store) => ({ subList: [...store.subList, { id: subId, filters, eose: false }] }));
  },
  removeFromSubList: (subId) => {
    set((store) => ({ subList: store.subList.filter((sub) => sub.id !== subId) }));
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
    if (queue.length > 0) {
      const flattenSub = queue.reduce<{ filters: Filter[]; relays: string[] }>(
        (acc, sub) => ({
          filters: [...acc.filters, ...sub.config.filters],
          relays: [...acc.relays, ...sub.config.relays],
        }),
        { filters: [], relays: [] }
      );

      get().handlePoolSub(
        { filters: flattenSub.filters, relays: flattenSub.relays },
        queue.map((sub) => sub.subId)
      );
      get().clearQueue();
      get().setIsBatching(false);
    }
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
