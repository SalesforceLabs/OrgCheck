 /*
 export class OrgCheckMap extends Map {
 
   
   

    #keyIndexes = {};
    #keys = [];
    #values = [];
    #createdDate = new Date();
    #lastModificationDate = this.#createdDate;

    keys() {
        return Object.keys(this.#keyIndexes);
    }

    _check_keyDefined(key, method) {
        if (key === undefined) {
            throw new Error(`OrgCheckMap.${method}: the given key is undefined.`);
        }
    }

    _check_keyExists(key, method) {
        const index = this.#keyIndexes[key];
        if (index === undefined) {
            throw new Error(`OrgCheckMap.${method}: the given key [${key}] is not found in the map.`);
        }
        return index;
    }

    hasKey(key) {
        this._check_keyDefined(key, 'hasKey');
        return this.#keys.includes(key) === true;
    }

    get(key) {
        this._check_keyDefined(key, 'get');
        return this.#values[this._check_keyExists(key, 'get')];
    }

    remove(key) {
        this._check_keyDefined(key, 'remove');
        const index = this._check_keyExists(key, 'remove');
        this.#keys.splice(index, 1);
        this.#values.splice(index, 1);
        delete this.#keyIndexes[key];
        for (let i = index; i < this.#keys.length; i++) {
            this.#keyIndexes[this.#keys[i]]--;
        }
        this.#lastModificationDate = new Date();
    }

    removeAll() {
        this.#keyIndexes = {};
        this.#keys = [];
        this.#values = [];
        this.#lastModificationDate = new Date();
    }

    set(key, value) {
        this._check_keyDefined(key, 'set');
        if (this.#keys.includes(key) === true) {
            this.#values[this.#keyIndexes[key]] = value;
        } else {
            this.#keyIndexes[key] = this.#values.length;
            this.#keys.push(key);
            this.#values.push(value);
        }
        this.#lastModificationDate = new Date();
    }

    size() {
        return this.#values.length;
    }

    createdDate() {
        return this.#createdDate;
    }

    lastModificationDate() {
        return this.#lastModificationDate;
    }

    filterValues(callback) {
        return this.#values.filter(callback);
    }

    mapValues(callback) {
        return this.#values.map(callback);
    }

    forEachValue(callback) {
        return this.#values.forEach(callback);
    }

    allValues() {
        return this.#values.slice();
    }
}

*/