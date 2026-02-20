import { DataCacheManager } from "../../src/api/core/orgcheck-api-cachemanager-impl";
import { StorageMock_BasedOnMap } from "../utils/orgcheck-api-storage-mock.utility";
import { CompressorMock_IdemPotent } from "../utils/orgcheck-api-compressor-mock.utility";

describe('tests.api.unit.DataCacheManager', () => {
  it('checks if the cache manager implementation runs correctly', async () => {
    const manager = new DataCacheManager(new CompressorMock_IdemPotent(), new StorageMock_BasedOnMap());
    expect(manager).toBeDefined();
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
          expect(item?.length).toBe(8);
          expect(item.created).toBeDefined();
          break;
        case 'map':
          expect(item.isEmpty).toBe(false);
          expect(item.isMap).toBe(true);
          expect(item?.length).toBe(2);
          expect(item.created).toBeDefined();
          break;
        case 'array':
          expect(item.isEmpty).toBe(false);
          expect(item.isMap).toBe(false);
          expect(item?.length).toBe(3);
          expect(item.created).toBeDefined();
          break;
        case 'null':
          expect(item.isEmpty).toBe(false);
          expect(item.isMap).toBe(false);
          expect(item?.length).toBe(0);
          expect(item.created).toBe(0);
          break;
        case 'undefined':
          expect(item.isEmpty).toBe(false);
          expect(item.isMap).toBe(false);
          expect(item?.length).toBe(0);
          expect(item.created).toBe(0);
          break;
        default:
      }
    });
  });
});
