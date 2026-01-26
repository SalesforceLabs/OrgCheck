import { DataCacheManagerIntf } from "../../../src/api/core/orgcheck-api-cachemanager";
import { CompressorIntf } from "../../../src/api/core/orgcheck-api-compressor";
import { StorageIntf } from "../../../src/api/core/orgcheck-api-storage";
import { DataCacheManager } from "../../../src/api/core/orgcheck-api-cachemanager-impl";
import { Compressor } from "../../../src/api/core/orgcheck-api-compressor-impl";
import { Storage } from "../../../src/api/core/orgcheck-api-storage-impl";
import fflate from "fflate";

class CompressorMock extends CompressorIntf {
  compress(/** @type {string} */ d) { return `[${d}]`; }
  decompress(/** @type {string} */ d) { return d.substring(1, d.length - 1); }
};

class StorageMock extends StorageIntf {
  _cache = new Map();
  setItem(key, value) { this._cache.set(key, value); }
  getItem(key) { return this._cache.get(key); }
  removeItem(key) { this._cache.delete(key); }
  keys() { return Array.from(this._cache.keys()); }
};

describe('tests.api.unit.DataCacheManager', () => {
  it('checks if the cache manager implementation runs correctly', async () => {
    const manager = new DataCacheManager(new CompressorMock(), new StorageMock());
    expect(manager).toBeDefined();
    expect(manager).toBeInstanceOf(DataCacheManagerIntf);
    expect(manager.get('nonexistingkey')).toBeNull();
    manager.set('keyAA', 'valueAA');
    expect(manager.get('keyAA')).toBe('valueAA');
    manager.set('keyAA', 'valueBB');
    expect(manager.get('keyAA')).toBe('valueBB');
    manager.remove('keyAA');
    expect(manager.get('keyAA')).toBeNull();
    manager.set('string', 'valueAA1');
    manager.set('map', new Map([['key1', 'value1'], ['key2', 'value2']]));
    manager.set('array', [ 'a', 'b', 'c' ]);
    manager.set('null', null);
    manager.set('undefined', undefined);
    manager.set('emptyMap', new Map());
    manager.set('emptyArray', [ ]);
    manager.details().forEach((item) => {
      expect(item).toBeDefined();
      expect(item.name).toBeDefined();
      switch (item.name) {
        case 'string':
          expect(item.isEmpty).toBe(false);
          expect(item.isMap).toBe(false);
          expect(item.length).toBe(8);
          expect(item.created).toBeDefined();
          break;
        case 'map':
          expect(item.isEmpty).toBe(false);
          expect(item.isMap).toBe(true);
          expect(item.length).toBe(2);
          expect(item.created).toBeDefined();
          break;
        case 'array':
          expect(item.isEmpty).toBe(false);
          expect(item.isMap).toBe(false);
          expect(item.length).toBe(3);
          expect(item.created).toBeDefined();
          break;
        case 'null':
          expect(item.isEmpty).toBe(false);
          expect(item.isMap).toBe(false);
          expect(item.length).toBe(0);
          expect(item.created).toBe(0);
          break;
        case 'undefined':
          expect(item.isEmpty).toBe(false);
          expect(item.isMap).toBe(false);
          expect(item.length).toBe(0);
          expect(item.created).toBe(0);
          break;
        default:
      }
    });
  });

  it('checks if the compression implementation runs correctly', async () => {
    globalThis.fflate = fflate;
    const compressor = new Compressor();
    const compressed = compressor.compress('This is a test string');
    expect(compressed).toBe('78DA0BC9C82C5600A2448592D4E21285E292A2CCBC7400514907AD');
    const decompressed = compressor.decompress(compressed);
    expect(decompressed).toBe('This is a test string');
  });

  it('checks if the storage implementation runs correctly', async () => {
    const map = new Map();
    const storage = new Storage({
        setItem: (key, value) => map.set(key, value),
        getItem: (key) => map.get(key),
        removeItem: (key) => map.delete(key),
        key: (index) => Array.from(map.keys())[index],
        length: () => map.size
    });
    expect(storage).toBeDefined();
    storage.setItem('key1', 'value1');
    expect(storage.getItem('key1')).toBe('value1');
  });

});
