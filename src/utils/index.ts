import _ from 'lodash';
import { Filter } from 'nostr-tools';

export const generateSubId = () => {
  return Math.random().toString(36).substring(2);
};

export const isFilterCorrupted = (filter: Filter) => {
  return _.find(filter, (value) => {
    if (typeof value === 'number') {
      return false;
    }

    if (typeof value === 'object') {
      return value.length === 0 || value.some((v) => typeof v === 'string' && v.length === 0);
    }

    return typeof value === 'string' && value.length === 0;
  });
};

export const mergeFilters = (filters: Filter[]): Filter[] => {
  return _.chain(filters)
    .filter((f) => !isFilterCorrupted(f))
    .groupBy((f) => {
      const joinedKeys = _.keys(f).join(',');
      const joinedValues = _.values(f).join(',');
      return `${joinedKeys},${f.kinds ? f.kinds.join(',') : ''},${f.since || ''},${f.until || ''},${
        f.limit ? joinedValues : ''
      },${f.search ? joinedValues : ''}`;
    })
    .flatMap((groupedFilters) =>
      _.mergeWith({}, ...groupedFilters, (objValue: Filter, srcValue: Filter) =>
        _.isArray(objValue) ? _.uniq(objValue.concat(srcValue)) : undefined
      )
    )
    .value();
};
