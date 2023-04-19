import { Filter } from 'nostr-tools';

export const generateSubId = () => {
  return Math.random().toString(36).substring(2);
};

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

export const areAllFiltersEqual = (a: Filter[], b: Filter[]) => {
  if (a.length !== b.length) {
    return false;
  }

  const sortedA = a.map((f) => sortFilter(f));
  const sortedB = b.map((f) => sortFilter(f));

  return sortedA.every((f, i) => JSON.stringify(f) === JSON.stringify(sortedB[i]));
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
  const uniqueFilters = filters.reduce<Filter[]>((acc, curr) => {
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
