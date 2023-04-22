import _ from 'lodash';
import { Filter } from 'nostr-tools';

export const generateSubId = () => {
  return Math.random().toString(36).substring(2);
};

export const mergeFilters = (filters: Filter[]): Filter[] => {
  return _.chain(filters)
    .filter((f) => (!f.authors || f.authors.length > 0) && (!f.ids || f.ids.length > 0))
    .groupBy(
      (f) =>
        `${_.keys(f).join(',')},${f.kinds?.join(',') || ''},${f.since || ''},${f.until || ''},${
          f.limit || ''
        },${f.search || ''}`
    )
    .flatMap((groupedFilters) =>
      _.mergeWith({}, ...groupedFilters, (objValue: Filter, srcValue: Filter) =>
        _.isArray(objValue) ? _.uniq(objValue.concat(srcValue)) : undefined
      )
    )
    .value();
};
