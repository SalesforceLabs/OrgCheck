const CACHE_PREFIX = 'OrgCheck.';

const generatePhysicalKey = (key) => {
    return key.startsWith(CACHE_PREFIX) ? key : CACHE_PREFIX + key;
}

const generateLogicalKey = (key) => {
    return key.startsWith(CACHE_PREFIX) ? key.substring(CACHE_PREFIX.length) : key;
}

const NB_MILLISEC_IN_ONE_DAY = 1000*60*60*24;

const getEntryFromCache = (key) => {
    const entryFromStorage = localStorage.getItem(key);
    if (!entryFromStorage) return null
    const entry = JSON.parse(entryFromStorage);
    if (Date.now() - entry.created > NB_MILLISEC_IN_ONE_DAY) return null;
    return entry;
}

const isItOneOfOurKeys = (key) => {
    return key && key.startsWith(CACHE_PREFIX);
}

export class OrgCheckDataCacheManager {
    has(key) {
        return getEntryFromCache(generatePhysicalKey(key)) !== null;
    }
    get(key) {
        const entry = getEntryFromCache(generatePhysicalKey(key));
        if (!entry) return null;
        if (entry.type === 'map') return new Map(entry.data);
        return entry.data;
    }
    set(key, value) {
        try {
            if (value === null) {
                localStorage.remove(generatePhysicalKey(key));
            } else if (value instanceof Map) {
                localStorage.setItem(
                    generatePhysicalKey(key), 
                    JSON.stringify(
                        { 
                            type: 'map', 
                            length: value.size,
                            data: Array.from(value.entries().filter(([k, v]) => k.endsWith('Ref') === false)),
                            created: Date.now()
                        }
                    )
                );
            } else {
                localStorage.setItem(
                    generatePhysicalKey(key), 
                    JSON.stringify({ data : value, created: Date.now() })
                );
            }
        } catch(error) {
            console.warn('Not able to store in local store that amount of data.')
        }
    }
    details() {
        const info = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (isItOneOfOurKeys(key)) {
                const entry = getEntryFromCache(key);
                info.push({
                    name: generateLogicalKey(key),
                    isEmpty: entry === null,
                    isMap: entry?.type === 'map',
                    length: entry?.length,
                    created: entry?.created
                });
            }
        }
        return info;
    }
    remove(key) {
        localStorage.removeItem(generatePhysicalKey(key));
    }
    clear() {
        localStorage.clear();
    }
}