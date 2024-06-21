export class OrgCheckProcessor {

    /**
     * Runs in parallel a function for each item of a given array or map.
     * 
     * @param {Array | Map} iterable  An array or a map to iterate over
     * @param {Function} iteratee  A function to call on each item in the array. Invoked with (item). Not supposed to return anything.
     * 
     * @return Promise<void>
     */
    static async chaque(iterable, iteratee) {
        if (!iterable) return Promise.resolve();
        if (typeof iteratee !== 'function') throw new TypeError(`Given iteratee is not a proper Function.`);
        if (Array.isArray(iterable) === true) return Promise.all(iterable.map(async (item) => { await iteratee(item); return null; } ));
        if (iterable instanceof Map === true) {
            const promises = [];
            iterable.forEach((item, key) => promises.push(new Promise((resolve) => { iteratee(item, key); resolve(); })));
            return Promise.all(promises);
        }
        throw new TypeError(`Given iterable is not a proper Array nor Map.`);        
    }

    /**
     * Runs in parallel a function for each item of a given iterable (must be an Array), and 
     * constructs a new array with only the items where the function returned true.
     * 
     * @param {Array} iterable  An array to iterate over
     * @param {Function} iteratee  A function to apply to each item in the iterable. Invoked with (item). Returns true or false.
     * 
     * @return Promise<Array>
     */
    static async filtre(iterable, iteratee) {
        if (!iterable) return Promise.resolve([]);
        if (Array.isArray(iterable) === false) throw new TypeError(`Given iterable is not a proper Array.`);
        if (typeof iteratee !== 'function') throw new TypeError(`Given iteratee is not a proper Function.`);
        return Promise.all(iterable.map(async (item, index) => { return iteratee(item) === true ? index : null }))
            .then((indexes) => indexes.filter((index) => index !== null).map((index) => iterable[index]));
    }

    /**
     * Runs in parallel a function for each item of a given iterable (must be an Array), and 
     * constructs a new array with the same size but with the results of each call to the function.
     * 
     * @param {Array} iterable  An array to iterate over
     * @param {Function} iteratee  A function to call on each item in the array. Invoked with (item). Supposed to return a new item based on the original item.
     * 
     * @return Promise<Array>  
     */
    static async carte(iterable, iteratee) {
        if (!iterable) return Promise.resolve([]);
        if (Array.isArray(iterable) === false) throw new TypeError(`Given iterable is not a proper Array.`);
        if (typeof iteratee !== 'function') throw new TypeError(`Given iteratee is not a proper Function.`);
        return Promise.all(iterable.map(async (item) => iteratee(item)));
    }
}