import { DataCacheManagerIntf } from "../../src/api/core/orgcheck-api-cachemanager";

export class CacheManagerMock_DoNothing implements DataCacheManagerIntf {
    has(/*key*/) { return false; }
    get(/*key*/) { return ''; }
    set(/*key, value*/) { }
    details() { return []; }
    remove(/*key*/) { }
    clear() {};
}

export class CacheManagerMock_UsingMap implements DataCacheManagerIntf {
    has(/*key*/) { return false; }
    get(/*key*/) { return ''; }
    set(/*key, value*/) { }
    details() { return []; }
    remove(/*key*/) { }
    clear() {};
}