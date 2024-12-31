export class OrgCheckProcessor {

    /**
     * @description Runs in parallel a function for each item of a given array or map.
     * @param {Array | Map} iterable  An array or a map to iterate over
     * @param {Function} iteratee  A function to call on each item in the array. Invoked with (item). Not supposed to return anything.
     * @returns Promise<void>
     */
    static async forEach(iterable, iteratee) {
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
     * @description Runs in parallel a function for each item of a given iterable (must be an Array), and 
     *   constructs a new array with the same size but with the results of each call to the function.
     * @param {Array} iterable  An array to iterate over
     * @param {Function} iteratee  A function to call on each item in the array. Invoked with (item). Supposed to return a new item based on the original item.
     * @param {Function} [filterIteratee]  An optional function to call on each item in the array. Invoked with (item). Returns true or false.
     * @returns Promise<Array>  
     */
    static async map(iterable, iteratee, filterIteratee) {
        if (!iterable) return Promise.resolve([]);
        if (Array.isArray(iterable) === false) throw new TypeError(`Given iterable is not a proper Array.`);
        if (typeof iteratee !== 'function') throw new TypeError(`Given iteratee is not a proper Function.`);
        if (filterIteratee && typeof filterIteratee !== 'function') throw new TypeError(`Given filterIteratee is not a proper Function.`);
        return Promise.all((filterIteratee ? iterable.filter((item) => filterIteratee(item)) : iterable).map(async (item) => iteratee(item)));
    }
}