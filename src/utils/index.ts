import { Filter } from 'nostr-tools';

export const sortObjectByKeys = (obj: any) => {
  const keys = Object.keys(obj).sort();
  const newObj: any = {};
  keys.forEach((key) => {
    newObj[key] = obj[key];
  });
  return newObj;
};

export const sortFilter = (filter: Filter) => {
  const sortedByKeys: Filter = sortObjectByKeys(filter);
  const sortedFilter = Object.entries(sortedByKeys).reduce<Filter>((acc, [key, value]) => {
    if (typeof value === 'number' || typeof value === 'string') {
      return { ...acc, [key]: value };
    }

    return { ...acc, [key]: value.sort() };
  }, {});

  return sortedFilter;
};

export const areFiltersEqual = (a: Filter, b: Filter) => {
  return JSON.stringify(sortFilter(a)) === JSON.stringify(sortFilter(b));
};

export const removeEmptyFilterItems = (filters: Filter[]) => {
  const validatedFilters = filters.reduce<Filter[]>((acc, curr) => {
    const validatedFilter = Object.entries(curr).reduce<Filter>((acc, [key, value]) => {
      if (typeof value === 'number' || typeof value === 'string') {
        if (value === '' || value === undefined || value === null) {
          return acc;
        }

        return { ...acc, [key]: value };
      }

      if (value.length === 0) {
        return acc;
      }

      const filtered = [...value].filter((v) => v !== '' && v !== undefined && v !== null);

      if (filtered.length === 0) {
        return acc;
      }

      return { ...acc, [key]: value };
    }, {});

    return [...acc, validatedFilter];
  }, []);

  return validatedFilters;
};

export const filterUniqueFilters = (filters: Filter[]) => {
  const validatedFilters = removeEmptyFilterItems(filters);
  const uniqueFilters = validatedFilters.reduce<Filter[]>((acc, curr) => {
    if (acc.length === 0) {
      return [curr];
    }

    const found = acc.find((f) => areFiltersEqual(f, curr));
    if (found) {
      return acc;
    }

    return [...acc, curr];
  }, []);

  return uniqueFilters;
};

export const filterUniqueRelays = (relays: string[]) => {
  return relays.filter((v, i, a) => v !== '' && a.indexOf(v) === i);
};
