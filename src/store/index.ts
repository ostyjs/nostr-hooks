import _ from 'lodash';
import { Event, Filter, matchFilters, SimplePool } from 'nostr-tools';
import { create } from 'zustand';

import { mergeFilters } from '../utils';

import { Config } from '../types';

type EventMap = Map<Event, Set<string>>;
type SubMap = Map<string, { config: Config; eose: boolean }>;
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
  deleteSubIdFromAllEvents: (subId: string) => void;
  deleteSubIdFromSubMap: (subId: string) => void;
  handleCacheRefresh: (subId: string, config: Config) => void;
  handleInvalidate: (subId: string, config: Config) => void;
  handleNewSub: (config: Config, subId: string) => void;
  handlePoolSub: (queueMap: QueueMap) => void;
  insertIntoQueue: (config: Config, subId: string) => void;
  insertSubIdToAnEvent: (subId: string, event: Event) => void;
  insertToSubMap: (subId: string, config: Config) => void;
  loadMore: (subId: string) => void;
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
  addEventAndInsertSubIds: (newEvent, newSubIds) =>
    set((store) => {
      let found = false;
      store.eventMap.forEach((_subIds, _event) => {
        if (_event.id === newEvent.id) {
          found = true;
          newSubIds.forEach((newSubId) => _subIds.add(newSubId));
          return;
        }
      });
      if (found === false) store.eventMap.set(newEvent, new Set(newSubIds));
      return { eventMap: store.eventMap };
    }),
  clearQueue: () => set({ queueMap: new Map() }),
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
  handleCacheRefresh: (subId, config) => {
    get().insertIntoQueue(config, subId);

    set((store) => {
      store.subMap.forEach((sub, subId) => {
        if (_.isEqual(sub.config.filters, config.filters)) {
          sub.eose = false;

          get().insertIntoQueue(sub.config, subId);
        }
      });

      return { subMap: store.subMap };
    });

    if (get().isBatching === false) {
      setTimeout(get().processQueue, config.options?.batchingInterval || 500);
      get().setIsBatching(true);
    }
  },
  handleInvalidate: (subId, config) => {
    get().insertIntoQueue(config, subId);

    set((store) => {
      store.eventMap.forEach((__, event) => {
        if (matchFilters(config.filters, event)) {
          store.eventMap.delete(event);
        }
      });

      store.subMap.forEach((sub, subId) => {
        if (_.isEqual(sub.config.filters, config.filters)) {
          sub.eose = false;
          get().insertIntoQueue(sub.config, subId);
        }
      });

      return { eventMap: store.eventMap, subMap: store.subMap };
    });

    if (get().isBatching === false) {
      setTimeout(get().processQueue, config.options?.batchingInterval || 500);
      get().setIsBatching(true);
    }
  },
  handleNewSub: ({ filters, relays, options }, subId) => {
    get().insertToSubMap(subId, { filters, relays, options });
    if (options?.invalidate) {
      get().handleInvalidate(subId, { filters, relays, options });
      return;
    }
    let alreadyHasEvents = false;
    get().eventMap.forEach((__, event) => {
      if (matchFilters(filters, event)) {
        alreadyHasEvents = true;
        get().insertSubIdToAnEvent(subId, event);
      }
    });
    if (alreadyHasEvents) {
      if (options?.cacheRefresh) {
        get().handleCacheRefresh(subId, { filters, relays, options });
        return;
      }

      let nextEose = true;
      get().subMap.forEach(({ eose: __eose, config: { filters: __filters } }, __subId) => {
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
    if (options?.force) {
      const newQueueMap = new Map() as QueueMap;
      newQueueMap.set(subId, { filters, relays, options });
      get().handlePoolSub(newQueueMap);
      return;
    }
    get().insertIntoQueue({ filters, relays, options }, subId);
    if (get().isBatching === false) {
      setTimeout(get().processQueue, options?.batchingInterval || 500);
      get().setIsBatching(true);
    }
  },
  handlePoolSub: (queueMap) => {
    let closeAfterEose = true;
    const filters = [] as Filter[];
    const relays = [] as string[];
    queueMap.forEach((config) => {
      filters.push(...config.filters);
      relays.push(...config.relays);
      if (config.options?.closeAfterEose === false) {
        closeAfterEose = false;
      }
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
      if (closeAfterEose) {
        sub.unsub();
      }
      queueMap.forEach((config) => {
        get().setEoseByFilters(config.filters, true);
      });
    });
  },
  insertIntoQueue: (config, subId) =>
    set((store) => {
      store.queueMap.set(subId, config);
      return { queueMap: store.queueMap };
    }),
  insertSubIdToAnEvent: (newSubId, event) =>
    set((store) => {
      store.eventMap.forEach((_subIds, _event) => {
        if (_event.id === event.id) {
          _subIds.add(newSubId);
          return;
        }
      });
      return { eventMap: store.eventMap };
    }),
  insertToSubMap: (subId, config) =>
    set((store) => {
      store.subMap.set(subId, { config, eose: false });
      return { subMap: store.subMap };
    }),
  loadMore: (subId) => {
    const config = get().subMap.get(subId)?.config;
    if (!config) return;

    const eventsOfThisSubId = [] as Event[];
    get().eventMap.forEach((subIds, event) => subIds.has(subId) && eventsOfThisSubId.push(event));
    const oldestEventTimestamp = _.min(eventsOfThisSubId.map((event) => event.created_at));
    if (oldestEventTimestamp) {
      config.filters = config.filters.map((filter) => ({
        ...filter,
        until: oldestEventTimestamp - 1,
      }));
    }

    get().insertIntoQueue(config, subId);
    if (get().isBatching === false) {
      setTimeout(get().processQueue, config.options?.batchingInterval || 500);
      get().setIsBatching(true);
    }
  },
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
      store.subMap.forEach((sub) => _.isEqual(sub.config.filters, filters) && (sub.eose = eose));
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
