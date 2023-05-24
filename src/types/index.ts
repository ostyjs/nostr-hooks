import { Filter } from 'nostr-tools';

export { Event, EventTemplate, Filter, Kind, UnsignedEvent } from 'nostr-tools';

export interface Config {
  filters: Filter[];
  relays: string[];
  options?: Options | undefined;
}

export interface Options {
  batchingInterval?: number | undefined;
  enabled?: boolean | undefined;
  force?: boolean | undefined;
  invalidate?: boolean | undefined;
  closeAfterEose?: boolean | undefined;
  cacheRefresh?: boolean | undefined;
}
