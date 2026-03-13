import { Storage } from 'src/api/core/orgcheck-api-storage-impl';

describe('tests.api.unit.Storage', () => {
    it('checks if the storage implementation runs correctly', async () => {
        const map: Map<string, string> = new Map();
        const storage = new Storage({
            setItem: (key: string, value: string): void => { map.set(key, value); },
            getItem: (key: string): string => map.get(key) ?? '',
            removeItem: (key: string): void => { map.delete(key); },
            key: (n: number): string => Array.from(map.keys())[n],
            length: (): number => { return map.size; }
        });
        expect(storage).toBeDefined();
        storage.setItem('key1', 'value1');
        expect(storage.getItem('key1')).toBe('value1');
    });
});