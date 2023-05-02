import _ from 'lodash';
import { Event, Filter, matchFilters, SimplePool } from 'nostr-tools';
import { create } from 'zustand';

import { mergeFilters } from '../utils';

import { Config } from '../types';

type EventMap = Map<Event, Set<string>>;
type SubMap = Map<string, { filters: Filter[]; eose: boolean }>;
type QueueMap = Map<string, Config>;

interface State {
  eventMap: EventMap;
  isBatching: boolean;
  isPurging: boolean;
  pool: SimplePool;
  pubkey: string;
  queueMap: QueueMap;
  subMap: SubMap;
}

interface Actions {
  addEventAndInsertSubIds: (event: Event, subIds: string[]) => void;
  clearQueue: () => void;
  deleteAllEventsBySubId: (subId: string) => void;
  deleteSubIdFromAllEvents: (subId: string) => void;
  deleteSubIdFromSubMap: (subId: string) => void;
  handleNewSub: (config: Config, subId: string) => void;
  handlePoolSub: (queueMap: QueueMap) => void;
  insertIntoQueue: (config: Config, subId: string) => void;
  insertSubIdToAnEvent: (subId: string, event: Event) => void;
  insertToSubMap: (subId: string, filters: Filter[]) => void;
  processQueue: () => void;
  purgeEvents: () => void;
  setEoseByFilters: (filters: Filter[], eose: boolean) => void;
  setEoseBySubIds: (subIds: string[], eose: boolean) => void;
  setPubkey: (pubkey: string) => void;
  setIsBatching: (isBatching: boolean) => void;
  setIsPurging: (isPurging: boolean) => void;
  unSub: (subId: string) => void;
}

export const useNostrStore = create<State & Actions>()((set, get) => ({
  eventMap: new Map(),
  isBatching: false,
  isPurging: false,
  pool: new SimplePool(),
  pubkey: '',
  queueMap: new Map(),
  subMap: new Map(),
  addEventAndInsertSubIds: (event, subIds) =>
    set((store) => {
      const eventRef = store.eventMap.get(event);
      eventRef
        ? subIds.forEach((subId) => eventRef.add(subId))
        : store.eventMap.set(event, new Set(subIds));
      return { eventMap: store.eventMap };
    }),
  clearQueue: () => set({ queueMap: new Map() }),
  deleteAllEventsBySubId: (subId) =>
    set((store) => {
      store.eventMap.forEach((subIds, event) => subIds.has(subId) && store.eventMap.delete(event));
      return { eventMap: store.eventMap };
    }),
  deleteSubIdFromAllEvents: (subId) =>
    set((store) => {
      store.eventMap.forEach((subIds) => subIds.delete(subId));
      return { eventMap: store.eventMap };
    }),
  deleteSubIdFromSubMap: (subId) =>
    set((store) => {
      store.subMap.delete(subId);
      return { subMap: store.subMap };
    }),
  handleNewSub: ({ filters, relays, options }, subId) => {
    get().insertToSubMap(subId, filters);
    if (options?.invalidate) {
      get().deleteAllEventsBySubId(subId);
      get().setEoseByFilters(filters, false);
    } else {
      let alreadyHasEvents = false;
      get().eventMap.forEach((subIds, event) => {
        if (matchFilters(filters, event)) {
          alreadyHasEvents = true;
          let eose = true;
          subIds.forEach((subId) => get().subMap.get(subId)?.eose === false && (eose = false));
          get().insertSubIdToAnEvent(subId, event);
          get().setEoseBySubIds([subId], eose);
        }
      });
      if (alreadyHasEvents) {
        let nextEose = true;
        get().subMap.forEach(({ eose: __eose, filters: __filters }, __subId) => {
          if (__subId === subId) return;

          if (__eose === true) return;

          if (_.isEqual(__filters, filters)) {
            nextEose = false;
            return;
          }
        });
        get().setEoseBySubIds([subId], nextEose);
        return;
      }
    }
    const newQueueMap = new Map() as QueueMap;
    newQueueMap.set(subId, { filters, relays });
    if (options?.force) {
      get().handlePoolSub(newQueueMap);
      return;
    }
    get().insertIntoQueue({ filters, relays }, subId);
    if (get().isBatching === false) {
      setTimeout(get().processQueue, options?.batchingInterval || 500);
      get().setIsBatching(true);
    }
  },
  handlePoolSub: (queueMap) => {
    const filters = [] as Filter[];
    const relays = [] as string[];
    queueMap.forEach((config) => {
      filters.push(...config.filters);
      relays.push(...config.relays);
    });

    const pool = get().pool;
    const sub = pool.sub(_.uniq(relays), mergeFilters(filters));

    sub.on('event', (event: Event) => {
      queueMap.forEach((config, subId) => {
        if (matchFilters(config.filters, event)) {
          get().addEventAndInsertSubIds(event, [subId]);
        }
      });
    });

    sub.on('eose', () => {
      sub.unsub();
      queueMap.forEach((config) => {
        get().setEoseByFilters(config.filters, true);
      });
    });
  },
  insertIntoQueue: ({ filters, relays }, subId) =>
    set((store) => {
      store.queueMap.set(subId, { filters, relays });
      return { queueMap: store.queueMap };
    }),
  insertSubIdToAnEvent: (subId, event) =>
    set((store) => {
      store.eventMap.get(event)?.add(subId);
      return { eventMap: store.eventMap };
    }),
  insertToSubMap: (subId, filters) =>
    set((store) => {
      store.subMap.set(subId, { filters, eose: false });
      return { subMap: store.subMap };
    }),
  processQueue: () => {
    const queueMap = get().queueMap;

    if (queueMap.size === 0) return;

    get().setIsBatching(false);
    get().handlePoolSub(queueMap);
    get().clearQueue();
  },
  purgeEvents: () => {
    set((store) => {
      store.eventMap.forEach((subIds, event) => subIds.size === 0 && store.eventMap.delete(event));

      return { eventMap: store.eventMap };
    });

    get().setIsPurging(false);
  },
  setEoseByFilters: (filters, eose) =>
    set((store) => {
      store.subMap.forEach((sub) => _.isEqual(sub.filters, filters) && (sub.eose = eose));
      return { subMap: store.subMap };
    }),
  setEoseBySubIds: (subIds, eose) =>
    set((store) => {
      store.subMap.forEach((sub, subId) => subIds.includes(subId) && (sub.eose = eose));
      return { subMap: store.subMap };
    }),
  setPubkey: (pubkey) => set({ pubkey }),
  setIsBatching: (isBatching) => set({ isBatching }),
  setIsPurging: (isPurging) => set({ isPurging }),
  unSub: (subId) => {
    get().deleteSubIdFromAllEvents(subId);
    get().deleteSubIdFromSubMap(subId);

    if (get().isPurging === false) {
      setTimeout(get().purgeEvents, 1000 * 10);
      get().setIsPurging(true);
    }
  },
}));
