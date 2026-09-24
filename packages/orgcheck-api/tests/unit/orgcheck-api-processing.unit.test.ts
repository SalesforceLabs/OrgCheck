import { describe, it, expect } from '@jest/globals';
import { SmallProcessor, MediumProcessor, LargeProcessor, InfiniteProcessor } from 'src/api/core/orgcheck-api-processor';

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

describe('tests.api.unit.Processor', () => {

  const PROCESSORS = [
    { processorName: 'SmallProcessor',    processor: SmallProcessor },
    { processorName: 'MediumProcessor',   processor: MediumProcessor },
    { processorName: 'LargeProcessor',    processor: LargeProcessor },
    { processorName: 'InfiniteProcessor', processor: InfiniteProcessor }
  ] as const;

  const MIN = (n: number, m: number): number => n < m ? n : m;
  const DELAYS = [40, 5, 25, 1, 15];

  const ARRAYS = [
    { arrayName: 'JustBelowTheLimit',       expectedLength: (limit: number): number => MIN(limit, 50) - 1 },
    { arrayName: 'ExactlyTheLimit',         expectedLength: (limit: number): number => MIN(limit, 50) },
    { arrayName: 'JustAboveTheLimit',       expectedLength: (limit: number): number => MIN(limit, 50) + 1 },
    { arrayName: 'AboveTwiceTheLimit',      expectedLength: (limit: number): number => MIN(limit, 50) * 2 },
    { arrayName: 'JustAboveTwiceTheLimit',  expectedLength: (limit: number): number => MIN(limit, 50) * 2 + 1 },
    { arrayName: 'JustBelowTwiceTheLimit',  expectedLength: (limit: number): number => MIN(limit, 50) * 2 - 1 }
  ];
  
  PROCESSORS.forEach(({ processorName, processor }) => {
    ARRAYS.forEach(({ arrayName, expectedLength }) => {
      
      // Create the array with the expected length
      const length: number = expectedLength(processor.concurrencyLimit);
      const array: string[] = [];
      for (let i = 0; i < length; i++) array.push(`Item ${i}`);

      // Test the processor with the array
      describe(`Test processor '${processorName}' (limit=${processor.concurrencyLimit}) with array '${arrayName}' (length=${array.length})`, () => {

        it('checks if the array is processed when calling forEach with a sync iteratee', async () => {
          const results: string[] = [];
          await processor.forEach(array, (item: string) => { results.push(item); });
          expect(results).toBeDefined();
          expect(results.every((result) => result.includes('Item '))).toBeTruthy();
        });

        it('checks if the array is processed when calling forEach with a sync iteratee', async () => {
          const results: string[] = [];
          await processor.forEach(array, async (item: string, key: number) => { 
            await wait(DELAYS[key % DELAYS.length]);
            results.push(item); 
          });
          expect(results).toBeDefined();
          expect(results.length).toBe(array.length);
          expect(results.every((result) => result.includes('Item '))).toBeTruthy();
        });
      });
    });
  });

  describe('MediumProcessor order with a list of 5 elements', () => {
    const array = ['alpha', 'bravo', 'charlie', 'delta', 'echo'];

    it('maps five elements and keeps the original array order despite different completion times', async () => {
      const results = await MediumProcessor.map(array, async (item: string, index?: number) => {
        await wait(DELAYS[index ?? 0 % DELAYS.length]);
        return item.toUpperCase();
      });
      expect(results).toEqual(['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO']);
    });

    it('calls forEach on five elements with the original items and indexes', async () => {
      const delays = [40, 5, 25, 1, 15];
      const visited: Array<{ item: string, index: number } | undefined> = new Array(array.length);

      await MediumProcessor.forEach(array, async (item: string, index: number) => {
        await wait(delays[index]);
        visited[index] = { item, index };
      });

      expect(visited).toEqual([
        { item: 'alpha', index: 0 },
        { item: 'bravo', index: 1 },
        { item: 'charlie', index: 2 },
        { item: 'delta', index: 3 },
        { item: 'echo', index: 4 }
      ]);
    });
  });
});