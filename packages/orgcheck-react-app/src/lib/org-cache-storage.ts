const DATA_PREFIX = 'OrgCheck.';
const META_PREFIX = 'OrgCheck_';

function scopedOrgId(orgId: string): string {
  const safe = orgId.replace(/[^a-zA-Z0-9]/g, '');
  if (!safe) {
    throw new Error('A Salesforce organization Id is required to isolate the Org Check cache.');
  }
  return safe;
}

function orgKeys(orgId: string): string[] {
  const dataNs = `${DATA_PREFIX}${orgId}.`;
  const metaNs = `${META_PREFIX}${orgId}_`;
  const mapped: string[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const physical = window.localStorage.key(index);
    if (!physical) continue;
    if (physical.startsWith(dataNs)) {
      mapped.push(DATA_PREFIX + physical.slice(dataNs.length));
    } else if (physical.startsWith(metaNs)) {
      mapped.push(META_PREFIX + physical.slice(metaNs.length));
    }
  }
  return mapped;
}

function toPhysicalKey(orgId: string, key: string): string {
  if (key.startsWith(DATA_PREFIX)) {
    return `${DATA_PREFIX}${orgId}.${key.slice(DATA_PREFIX.length)}`;
  }
  if (key.startsWith(META_PREFIX)) {
    return `${META_PREFIX}${orgId}_${key.slice(META_PREFIX.length)}`;
  }
  return `${orgId}:${key}`;
}

export function createOrgScopedStorage(orgId: string): {
  setItem(key: string, value: string): void;
  getItem(key: string): string;
  removeItem(key: string): void;
  key(n: number): string;
  length(): number;
} {
  const id = scopedOrgId(orgId);
  return {
    setItem: (key, value) => window.localStorage.setItem(toPhysicalKey(id, key), value),
    getItem: key => window.localStorage.getItem(toPhysicalKey(id, key)) ?? '',
    removeItem: key => window.localStorage.removeItem(toPhysicalKey(id, key)),
    key: n => orgKeys(id)[n] ?? '',
    length: () => orgKeys(id).length,
  };
}
