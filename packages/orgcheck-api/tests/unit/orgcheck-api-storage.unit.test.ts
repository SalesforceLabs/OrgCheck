import { describe, it, expect } from "@jest/globals";
import { Storage } from "../../src/api/core/orgcheck-api-storage-impl";

describe('tests.api.unit.Storage', () => {
    it('checks if the storage implementation runs correctly', async () => {
        const map = new Map();
        const storage = new Storage({
            setItem: (key: string, value: any) => map.set(key, value),
            getItem: (key: string) => map.get(key),
            removeItem: (key: string) => map.delete(key),
            key: (index: number) => Array.from(map.keys())[index],
            length: map.size
        });
        expect(storage).toBeDefined();
        storage.setItem('key1', 'value1');
        expect(storage.getItem('key1')).toBe('value1');
    });
});