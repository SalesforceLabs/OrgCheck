import { Processor } from "../../src/api/core/orgcheck-api-processor";

describe('tests.api.unit.Processor', () => {

  describe('Test forEach() with an array', () => {
    const array = [
      1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5,
      1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5,
      1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5,
      1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5
    ];

    it ('checks if the array is processed when calling forEach with a sync iteratee', async () => {
      const results: string[] = [];
      await Processor.forEach(array, async (i: number) => { results.push(`Processing ${i}...`); });
      expect(results).toBeDefined();
      expect(results?.length).toBe(array?.length);
      results.forEach((result) => expect(result.includes('Processing')).toBeTruthy());
    });

    it ('checks if the array is processed when calling forEach with an async iteratee', async () => {
      const results: string[] = [];
      await Processor.forEach(array, async (i: number) => { results.push(`Processing ${i}...`); });
      expect(results).toBeDefined();
      expect(results?.length).toBe(array?.length);
      results.forEach((result) => expect(result.includes('Processing')).toBeTruthy());
    });
  });

  describe('Test forEach() with maps', () => {
    const map: Map<string, string> = new Map([
      ['1', 'un'], ['2', 'deux'], ['3', 'trois'], ['4', 'quatre'], ['5', 'cinq'],
      ['1', 'un'], ['2', 'deux'], ['3', 'trois'], ['4', 'quatre'], ['5', 'cinq'],
      ['1', 'un'], ['2', 'deux'], ['3', 'trois'], ['4', 'quatre'], ['5', 'cinq'],
      ['1', 'un'], ['2', 'deux'], ['3', 'trois'], ['4', 'quatre'], ['5', 'cinq']
    ]);

    it ('checks if the map is processed when calling forEach() with a sync iteratee', async () => {
      const results: string[] = [];
      await Processor.forEach(map, async (v: string, k: string) => { results.push(`Processing ${k}: ${v}...`); });
      expect(results).toBeDefined();
      expect(results?.length).toBe(map.size);
      results.forEach((result) => expect(result.includes('Processing')).toBeTruthy());
    });

    it ('checks if the map is processed when calling forEach() with an async iteratee', async () => {
      const results: string[] = [];
      await Processor.forEach(map, async (v: string, k: string) => { results.push(`Processing ${k}: ${v}...`); });
      expect(results).toBeDefined();
      expect(results?.length).toBe(map.size);
      results.forEach((result) => expect(result.includes('Processing')).toBeTruthy());
    });
  });

  describe('Test map() with an array', () => {
    const array = [
      1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5,
      1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5,
      1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5,
      1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5
    ];

    it ('checks if the array is processed when calling map() with a sync iteratee and no filter', async () => {
      const results: string[] = await Processor.map(array, (i: number) => `Processing ${i}...`);
      expect(results).toBeDefined();
      expect(results?.length).toBe(array?.length);
      results.forEach((result) => expect(result.includes('Processing')).toBeTruthy());
    });

    it ('checks if the array is processed when calling map() with a sync iteratee and filter', async () => {
      const filterFunc = (i: number) => i > 3;
      const arrayFiltered = array.filter(filterFunc);
      const results: string[] = await Processor.map(array, (i: number) => `Processing ${i}...`, filterFunc);
      expect(results).toBeDefined();
      expect(results?.length).toBe(arrayFiltered?.length);
      results.forEach((result) => expect(result.includes('Processing')).toBeTruthy());
    });
  });
});