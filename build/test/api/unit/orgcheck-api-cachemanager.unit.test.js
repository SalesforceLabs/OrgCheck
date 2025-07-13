import { DataCacheManagerIntf } from "../../../src/api/core/orgcheck-api-cachemanager";
import { DataCacheManager } from "../../../src/api/core/orgcheck-api-cachemanager-impl";

describe('tests.api.unit.DataCacheManager', () => {
  it('checks if the cache manager implementation runs correctly', async () => {
    const manager = new DataCacheManager({ 
      compression: {
        compress: (d) => d,
        decompress: (d) => d
      },
      encoding: {
        encode: (d) => d,
        decode: (d) => d
      },
      storage: {}
    });
    expect(manager).toBeDefined();
    expect(manager).toBeInstanceOf(DataCacheManagerIntf);
  });

  it('checks if the cache manager implementation behaves normally when storage is full', async () => {
    const mockCache = new Map();
    const manager = new DataCacheManager({ 
      compression: {
        compress: (buffer) => buffer,
        decompress: (buffer) => buffer
      },
      encoding: {
        encode: (/** @type {string} */ stringData) => new Uint8Array(stringData.length),
        decode: (/** @type {Uint8Array} */ buffer) => `{"data": "${'value'.padStart(buffer.length, '*')}"}`
      },
      storage: {
        setItem: (key, value) => { 
          console.error('setItem', key, value.length);
          if (value.length > 200) { 
            throw new Error(`Simulation of a LocalStorage limitation`); 
          } else { 
            mockCache.set(key, value); 
          }
        },
        getItem: (key) => { return mockCache.get(key); },
        removeItem: (key) => { mockCache.delete(key); },
        key: (index) => { return Array.from(mockCache.keys())[index]; },
        keys: () => { return Array.from(mockCache.keys()); },
        length: () => { return mockCache.size; }
      }
    });   
    manager.set('key0', 'test'); // 4 characters ;)
    expect(manager.details().length).toBe(1); // key0 
    manager.set('key1', 'value small enough to fit the storage limiation---'); // 50 charcaters --> data will fit the storage limitation
    expect(manager.details().length).toBe(2); // key0+key1 
    manager.set('key2', 'value too big to fit the storage limitation ------------------------------------'); // 80 characters --> data will exceed the storage limitation
    expect(manager.details().length).toBe(2); // key0+key1 ... not key2!
    expect(manager.get('key2')).toBeNull();
    manager.remove('key0');
    expect(manager.details().length).toBe(1);
    manager.clear();
    expect(manager.details().length).toBe(0);
  });
});
