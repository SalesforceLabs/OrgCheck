import { DataCacheManager } from "../../../src/api/core/orgcheck-api-cachemanager-impl";

describe('tests.api.unit.DataCacheManager', () => {
  it('checks if the cache manager implementation runs correctly', async () => {
    const manager = new DataCacheManager({ 
      compress: (d) => d,
      decompress: (d) => d,
      encode: (d) => d,
      decode: (d) => d,
      storage: {}
    });
  });

  it('checks if the cache manager implementation behaves normally when storage is full', async () => {
    const mockCache = new Map();
    const manager = new DataCacheManager({ 
      compress: (buffer) => buffer,
      decompress: (buffer) => buffer,
      encode: (/** @type {string} */ stringData) => new Uint8Array(stringData.length),
      decode: (/** @type {Uint8Array} */ buffer) => `{"data": "${'value'.padStart(buffer.length, '*')}"}`,
      storage: {
        setItem: (key, value) => { 
          if (value.length > 200) { 
            throw new Error(`Simulation of a LocalStorage limitation to 200 characters for key: ${key}`); 
          } else { 
            mockCache.set(key, value); 
        }},
        getItem: (key) => { return mockCache.get(key); },
        removeItem: (key) => { mockCache.delete(key); },
        key: (index) => { return Array.from(mockCache.keys())[index]; },
        keys: () => { return Array.from(mockCache.keys()); },
        length: () => { return mockCache.size; }
      }
    });   
    manager.set('key0', 'test'); // 4 characters ;)
    manager.set('key1', 'value small enough to fit the storage limiation---'); // 50 charcaters --> data will fit the storage limitation
    manager.set('key2', 'value too big to fit the storage limitation ------------------------------------'); // 80 characters --> data will exceed the storage limitation
    expect(mockCache.size).toBe(4); // only the metadata data and data for key0 and key1 (and not key2 because the data extends the storage limitation)
    expect(manager.has('key0')).toBeTruthy();
    expect(manager.has('key1')).toBeTruthy();
    expect(manager.has('key2')).toBeFalsy();
    manager.remove('key0');
    expect(mockCache.size).toBe(2);
    manager.clear();
    expect(mockCache.size).toBe(0);
  });
});
