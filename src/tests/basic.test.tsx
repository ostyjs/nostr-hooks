// import { act, fireEvent, render } from '@testing-library/react';
// import { jest } from '@jest/globals';
import { afterEach, describe, expect, it, jest, beforeAll } from '@jest/globals';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { Filter } from 'nostr-tools';
import { mergeFilters } from '../utils';

describe('mergeFilters', () => {
  it('merges filters when they have the same properties', () => {
    const filters: Filter[] = [{ authors: ['author1'] }, { authors: ['author2'] }];
    const mergedFilters = mergeFilters(filters);
    expect(mergedFilters).toEqual([{ authors: ['author1', 'author2'] }]);
  });

  it('does not merge filters when they have different properties', () => {
    const filters: Filter[] = [{ authors: ['author1'] }, { ids: ['id1'] }];
    const mergedFilters = mergeFilters(filters);
    expect(mergedFilters).toEqual(filters);
  });

  it('does not merge filters when they have just search property and their values are different', () => {
    const filters: Filter[] = [{ search: 'search1' }, { search: 'search2' }];
    const mergedFilters = mergeFilters(filters);
    expect(mergedFilters).toEqual(filters);
  });

  it('merges filters when they have just search property and their values are the same', () => {
    const filters: Filter[] = [{ search: 'search1' }, { search: 'search1' }];
    const mergedFilters = mergeFilters(filters);
    expect(mergedFilters).toEqual([{ search: 'search1' }]);
  });

  it('does not merge filters when they have search property besides others', () => {
    const filters: Filter[] = [
      { authors: ['author1'], search: 'search1' },
      { authors: ['author2'], search: 'search1' },
    ];
    const mergedFilters = mergeFilters(filters);
    expect(mergedFilters).toEqual(filters);
  });

  it('does not merge filters when they have limit property and others are different', () => {
    const filters: Filter[] = [
      { authors: ['author1'], limit: 10 },
      { authors: ['author2'], limit: 10 },
    ];
    const mergedFilters = mergeFilters(filters);
    expect(mergedFilters).toEqual(filters);
  });

  it('merges filters when they have limit property but others are the same', () => {
    const filters: Filter[] = [
      { authors: ['author1'], limit: 10 },
      { authors: ['author1'], limit: 10 },
    ];
    const mergedFilters = mergeFilters(filters);
    expect(mergedFilters).toEqual([{ authors: ['author1'], limit: 10 }]);
  });

  it('merges filters when they have same kinds', () => {
    const filters: Filter[] = [
      { authors: ['author1'], kinds: [0, 1] },
      { authors: ['author2'], kinds: [0, 1] },
    ];
    const mergedFilters = mergeFilters(filters);
    expect(mergedFilters).toEqual([{ authors: ['author1', 'author2'], kinds: [0, 1] }]);
  });

  // [TODO]
  // it('merges filters when they have different kinds but same authors and ids and tags', () => {
  //   const filters: Filter[] = [
  //     { authors: ['author1'], kinds: [0] },
  //     { authors: ['author1'], kinds: [1] },
  //   ];
  //   const mergedFilters = mergeFilters(filters);
  //   expect(mergedFilters).toEqual([{ authors: ['author1'], kinds: [0, 1] }]);
  // });

  it('does not merge filters when they have different kinds and different authors or ids or tags', () => {
    const filters: Filter[] = [
      { authors: ['author1'], kinds: [0] },
      { authors: ['author2'], kinds: [1] },
    ];
    const mergedFilters = mergeFilters(filters);
    expect(mergedFilters).toEqual(filters);
  });

  it('merges filters when they have same until', () => {
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

  it('merges filters when they have same since', () => {
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

  it('removes duplicates when merging filters', () => {
    const filters: Filter[] = [
      { authors: ['author1', 'author2'] },
      { authors: ['author2', 'author3'] },
    ];
    const mergedFilters = mergeFilters(filters);
    expect(mergedFilters).toEqual([{ authors: ['author1', 'author2', 'author3'] }]);
  });

  it('removes filters if they have empty properties', () => {
    const filters: Filter[] = [
      { '#p': [] },
      { '#p': ['author1'] },
      { authors: [''] },
      { authors: ['', 'author2'] },
    ];
    const mergedFilters = mergeFilters(filters);
    expect(mergedFilters).toEqual([{ '#p': ['author1'] }]);
  });

  it('handles complex filters', () => {
    const filters: Filter[] = [
      { authors: ['author1'], kinds: [0], since: 10 },
      { authors: ['author2'], kinds: [3] },
      { authors: ['author3'], kinds: [3] },
      { authors: ['author3'], kinds: [1], limit: 10 },
      { authors: ['author4'], kinds: [1], limit: 10 },
      { authors: ['author5'], kinds: [0, 1, 3] },
      { ids: ['id1', 'id2', 'id3'], kinds: [9731 as number] },
      { ids: ['id3', 'id4'], kinds: [9731 as number] },
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
      { authors: ['author3'], kinds: [1], limit: 10 },
      { authors: ['author4'], kinds: [1], limit: 10 },
      { authors: ['author5'], kinds: [0, 1, 3] },
      { ids: ['id1', 'id2', 'id3', 'id4'], kinds: [9731] },
      { ids: ['id4', 'id5'], kinds: [7] },
      { '#p': ['p1', 'p2', 'p3'], since: 10 },
      { '#p': ['p4'], since: 20 },
    ]);
  });
});

describe('useSubscribe', () => {});

describe('usePublish', () => {});
