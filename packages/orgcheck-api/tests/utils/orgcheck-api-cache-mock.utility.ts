import { DataCacheManagerIntf } from 'src/api/core/cache/orgcheck-api-cachemanager';

export class CacheManagerMock_UsingMap implements DataCacheManagerIntf {
    has(/*key*/) { return false; }
    get(/*key*/) { return ''; }
    set(/*key, value*/) { }
    details() { return []; }
    remove(/*key*/) { }
    clear() {};
}