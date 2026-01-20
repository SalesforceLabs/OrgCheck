import { DataCacheManagerIntf } from "../../../src/api/core/orgcheck-api-cachemanager";
import { DataCacheManager } from "../../../src/api/core/orgcheck-api-cachemanager-impl";
import { CompressorIntf } from "../../../src/api/orgcheck-api-main";
import { StorageIntf } from "../../../src/api/core/orgcheck-api-storage";

class CompressorMock extends CompressorIntf {
  compress(d) { return d; }
  decompress(d) { return d; }
};

class StorageMock extends StorageIntf {
  setItem() {}
  getItem() { return null; }
  removeItem() {}
  keys() { return []; }
};

describe('tests.api.unit.DataCacheManager', () => {
  it('checks if the cache manager implementation runs correctly', async () => {
    const manager = new DataCacheManager(new CompressorMock(), new StorageMock());
    expect(manager).toBeDefined();
    expect(manager).toBeInstanceOf(DataCacheManagerIntf);
  });

});
