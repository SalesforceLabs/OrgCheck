import { StorageIntf } from 'src/api/core/orgcheck-api-storage';
import { StorageSetup } from 'src/api/core/orgcheck-api-setup-storage';

export class StorageMock_BasedOnMap implements StorageIntf {
  _cache = new Map<string, any>();
  setItem(key: string, value: any) { this._cache.set(key, value); }
  getItem(key: string) { return this._cache.get(key); }
  removeItem(key: string) { this._cache.delete(key); }
  keys() { return Array.from(this._cache.keys()); }
};

export class StorageSetupMock_BasedOnMap implements StorageSetup {
  _cache = new Map<string, any>();
  setItem(key: string, value: any) { this._cache.set(key, value); }
  getItem(key: string) { return this._cache.get(key); }
  removeItem(key: string) { this._cache.delete(key); }
  key(index: number): string { return Array.from(this._cache.keys())[index]; }
  length(): number { return this._cache.size; }
}