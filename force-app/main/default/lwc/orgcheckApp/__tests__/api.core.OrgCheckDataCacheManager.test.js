import { OrgCheckDataCacheManager } from '../api/core/orgcheck-api-datacache';

describe('api.core.OrgCheckDataCacheManager', () => {

  describe('Using a mocked Compressor that does nothing', () => {

    const manager = new OrgCheckDataCacheManager({
      compress:   (data) => { return data; },
      decompress: (data) => { return data; }
    });
    const key1 = 'somekey';

    it('checks how manager behaves when it\'s totally new', () => {
      expect(manager.has('somekey')).toBeFalsy(); // should not contain this key (and any other btw)
      expect(manager.get('somekey')).toBeNull(); // should be null as it did not containg that key previously
      expect(manager.details()).toHaveLength(0); // no keys -> no details!
    });

    it('checks how manager behaves asking to clear one key or all keys', () => {
      expect(manager.has('somekey')).toBeFalsy(); // should not contain this key (and any other btw)
      expect(manager.get('somekey')).toBeNull(); // should be null as it did not containg that key previously
      expect(manager.details()).toHaveLength(0); // no keys -> no details!
      manager.set('1', 'iu');
      manager.set('2', 'ou');
      manager.set('3', 'op');
      expect(manager.details()).toHaveLength(3); // 3 keys -> 3 details!
      manager.remove('3');
      expect(manager.details()).toHaveLength(2); // 2 keys -> 2 details!
      manager.remove('4');
      expect(manager.details()).toHaveLength(2); // 2 keys -> 2 details!
      manager.clear();
      expect(manager.details()).toHaveLength(0); // Should be empty!
    });

    it('checks how manager behaves when adding a new key with a string value', () => {
      const stringValue1 = 'somevalue';
      manager.set(key1, stringValue1);
      expect(manager.has(key1)).toBeTruthy(); // should contain this key
      expect(manager.get(key1)).toBe(stringValue1); // check the exact value cached
      const details = manager.details();
      expect(details).toHaveLength(1); // one key -> one detail!
      expect(details[0]).toHaveProperty('name', key1); // should have a name property and be equald to key1
      expect(details[0]).toHaveProperty('isEmpty', false); // should have a isEmpty property and be equal to false
      expect(details[0]).toHaveProperty('isMap', false); // should have a isMap property and be equal to false
      expect(details[0]).toHaveProperty('created'); // should have a created property
    });

    it('checks how manager behaves when adding a new key with an object value', () => {
      const objectValue2 = { name: 'Name', createdBy: Date.now(), ageOfOwner: 35 };
      manager.set(key1, objectValue2);
      expect(manager.has(key1)).toBeTruthy(); // should contain this key
      expect(manager.get(key1)).toStrictEqual(objectValue2); // check the exact value cached
      const details = manager.details();
      expect(details).toHaveLength(1); // one key -> one detail!
      expect(details[0]).toHaveProperty('name', key1); // should have a name property and be equald to key1
      expect(details[0]).toHaveProperty('isEmpty', false); // should have a isEmpty property and be equal to false
      expect(details[0]).toHaveProperty('isMap', false); // should have a isMap property and be equal to false
      expect(details[0]).toHaveProperty('created'); // should have a created property
    });

    it('checks how manager behaves when adding a new key with an array', () => {
      const arrayValue3 = [
        { name: 'Name', createdBy: Date.now(), ageOfOwner: 35 },
        { name: 'Name2', createdBy: Date.now()-100, ageOfOwner: 45 },
        { name: 'Name3', createdBy: Date.now()-35564, ageOfOwner: 56 }
      ];
      manager.set(key1, arrayValue3);
      expect(manager.has(key1)).toBeTruthy(); // should contain this key
      expect(manager.get(key1)).toStrictEqual(arrayValue3); // check the exact value cached
      const details = manager.details();
      expect(details).toHaveLength(1); // one key -> one detail!
      expect(details[0]).toHaveProperty('name', key1); // should have a name property and be equald to key1
      expect(details[0]).toHaveProperty('isEmpty', false); // should have a isEmpty property and be equal to false
      expect(details[0]).toHaveProperty('isMap', false); // should have a isMap property and be equal to false
      expect(details[0]).toHaveProperty('created'); // should have a created property
    });

    it('checks how manager behaves when adding a new key with a map', () => {
      const mapValue4 = new Map();
      mapValue4.set('k', { name: 'Name', createdBy: Date.now(), ageOfOwner: 35 });
      mapValue4.set('i', { name: 'Name2', createdBy: Date.now()-100, ageOfOwner: 45 });
      mapValue4.set('t', { name: 'Name3', createdBy: Date.now()-35564, ageOfOwner: 56 });

      manager.set(key1, mapValue4);
      expect(manager.has(key1)).toBeTruthy(); // should contain this key
      expect(manager.get(key1)).toStrictEqual(mapValue4); // check the exact value cached
      const details = manager.details();
      expect(details).toHaveLength(1); // one key -> one detail!
      expect(details[0]).toHaveProperty('name', key1); // should have a name property and be equald to key1
      expect(details[0]).toHaveProperty('isEmpty', false); // should have a isEmpty property and be equal to false
      expect(details[0]).toHaveProperty('isMap', true); // should have a isMap property and be equal to false
      expect(details[0]).toHaveProperty('created'); // should have a created property
      expect(details[0]).toHaveProperty('length', 3); // should have a length property set to three
    });
  });
});