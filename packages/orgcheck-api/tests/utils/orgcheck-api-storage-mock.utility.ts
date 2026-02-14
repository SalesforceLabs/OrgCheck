import { StorageIntf } from "../../src/api/core/orgcheck-api-storage";

export class StorageMock_BasedOnMap implements StorageIntf {
  _cache = new Map();
  setItem(key: string, value: any) { this._cache.set(key, value); }
  getItem(key: string) { return this._cache.get(key); }
  removeItem(key: string) { this._cache.delete(key); }
  keys() { return Array.from(this._cache.keys()); }
};