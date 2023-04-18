import { Filter } from 'nostr-tools';

export { Event, EventTemplate, Filter, Kind, UnsignedEvent } from 'nostr-tools';

export interface Config {
  filters: Filter[];
  relays: string[];
  options?: Options | undefined;
}

export interface Options {
  enabled?: boolean | undefined;
  batchingInterval?: number | undefined;
  force?: boolean | undefined;
}
