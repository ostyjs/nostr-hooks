// import { act, fireEvent, render } from '@testing-library/react';
// import { jest } from '@jest/globals';
import { afterEach, describe, expect, it, jest, beforeAll } from '@jest/globals';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { Filter } from 'nostr-tools';
import { mergeFilters } from '../utils';
import { useNostrSubscribe } from '..';

describe('mergeFilters', () => {
  it('merge filters when they have the same properties', () => {
    const filters: Filter[] = [{ authors: ['author1'] }, { authors: ['author2'] }];
    const mergedFilters = mergeFilters(filters);
    expect(mergedFilters).toEqual([{ authors: ['author1', 'author2'] }]);
  });

  it('does not merge filters when they have different properties', () => {
    const filters: Filter[] = [{ authors: ['author1'] }, { ids: ['id1'] }];
    const mergedFilters = mergeFilters(filters);
    expect(mergedFilters).toEqual(filters);
  });

  it('does not merge filters when they have search property', () => {
    const filters: Filter[] = [{ authors: ['author1'] }, { search: 'search1' }];
    const mergedFilters = mergeFilters(filters);
    expect(mergedFilters).toEqual(filters);
  });

  it('merge filters when they have same kinds', () => {
    const filters: Filter[] = [
      { authors: ['author1'], kinds: [0, 1] },
      { authors: ['author2'], kinds: [0, 1] },
    ];
    const mergedFilters = mergeFilters(filters);
    expect(mergedFilters).toEqual([{ authors: ['author1', 'author2'], kinds: [0, 1] }]);
  });

  it('does not merge filters when they have different kinds', () => {
    const filters: Filter[] = [
      { authors: ['author1'], kinds: [0] },
      { authors: ['author2'], kinds: [1] },
    ];
    const mergedFilters = mergeFilters(filters);
    expect(mergedFilters).toEqual(filters);
  });

  it('merge filters when they have same limit', () => {
    const filters: Filter[] = [
      { authors: ['author1'], limit: 10 },
      { authors: ['author2'], limit: 10 },
    ];
    const mergedFilters = mergeFilters(filters);
    expect(mergedFilters).toEqual([{ authors: ['author1', 'author2'], limit: 10 }]);
  });

  it('does not merge filters when they have different limit', () => {
    const filters: Filter[] = [
      { authors: ['author1'], limit: 10 },
      { authors: ['author2'], limit: 20 },
    ];
    const mergedFilters = mergeFilters(filters);
    expect(mergedFilters).toEqual(filters);
  });

  it('merge filters when they have same until', () => {
    const filters: Filter[] = [
      { authors: ['author1'], until: 10 },
      { authors: ['author2'], until: 10 },
    ];
    const mergedFilters = mergeFilters(filters);
    expect(mergedFilters).toEqual([{ authors: ['author1', 'author2'], until: 10 }]);
  });

  it('does not merge filters when they have different until', () => {
    const filters: Filter[] = [
      { authors: ['author1'], until: 10 },
      { authors: ['author2'], until: 20 },
    ];
    const mergedFilters = mergeFilters(filters);
    expect(mergedFilters).toEqual(filters);
  });

  it('merge filters when they have same since', () => {
    const filters: Filter[] = [
      { authors: ['author1'], since: 10 },
      { authors: ['author2'], since: 10 },
    ];
    const mergedFilters = mergeFilters(filters);
    expect(mergedFilters).toEqual([{ authors: ['author1', 'author2'], since: 10 }]);
  });

  it('does not merge filters when they have different since', () => {
    const filters: Filter[] = [
      { authors: ['author1'], since: 10 },
      { authors: ['author2'], since: 20 },
    ];
    const mergedFilters = mergeFilters(filters);
    expect(mergedFilters).toEqual(filters);
  });

  it('remove duplicates when merging filters', () => {
    const filters: Filter[] = [
      { authors: ['author1', 'author2'] },
      { authors: ['author2', 'author3'] },
    ];
    const mergedFilters = mergeFilters(filters);
    expect(mergedFilters).toEqual([{ authors: ['author1', 'author2', 'author3'] }]);
  });

  it('remove filters if they have empty properties', () => {
    const filters: Filter[] = [{ authors: [] }, { authors: ['author2'] }];
    const mergedFilters = mergeFilters(filters);
    expect(mergedFilters).toEqual([{ authors: ['author2'] }]);
  });

  it('handle complex filters', () => {
    const filters: Filter[] = [
      { authors: ['author1'], kinds: [0], since: 10 },
      { authors: ['author2'], kinds: [3] },
      { authors: ['author3'], kinds: [3] },
      { authors: ['author3'], kinds: [1], limit: 10 },
      { authors: ['author4'], kinds: [1], limit: 10 },
      { authors: ['author5'], kinds: [0, 1, 3] },
      { ids: ['id1', 'id2', 'id3'], kinds: [9731] },
      { ids: ['id3', 'id4'], kinds: [9731] },
      { ids: ['id4', 'id5'], kinds: [7] },
      { '#p': ['p1'], since: 10 },
      { '#p': ['p2'], since: 10 },
      { '#p': ['p3'], since: 10 },
      { '#p': ['p4'], since: 20 },
    ];
    const mergedFilters = mergeFilters(filters);
    expect(mergedFilters).toEqual([
      { authors: ['author1'], kinds: [0], since: 10 },
      { authors: ['author2', 'author3'], kinds: [3] },
      { authors: ['author3', 'author4'], kinds: [1], limit: 10 },
      { authors: ['author5'], kinds: [0, 1, 3] },
      { ids: ['id1', 'id2', 'id3', 'id4'], kinds: [9731] },
      { ids: ['id4', 'id5'], kinds: [7] },
      { '#p': ['p1', 'p2', 'p3'], since: 10 },
      { '#p': ['p4'], since: 20 },
    ]);
  });
});

describe('useNostrSubscribe', () => {});
