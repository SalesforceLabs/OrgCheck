const IS_ASYNC = (f) => f?.constructor.name === 'AsyncFunction';
const IS_FUNCTION = (f) => typeof f === 'function';
const IS_ARRAY = (a) => Array.isArray(a);
const IS_MAP = (m) => m instanceof Map;

export class Processor {

    /**
     * @description Runs in parallel a function for each item of a given array or map.
     * @param {Array | Map} iterable  An array or a map to iterate over
     * @param {Function} iteratee  A function to call on each item in the array. Invoked with (item). Not supposed to return anything.
     * @returns Promise<void>
     */
    static async forEach(iterable, iteratee) {
        if (!iterable) return Promise.resolve();
        if (IS_FUNCTION(iteratee) === false) throw new TypeError(`Given iteratee is not a proper function.`);
        if (IS_ARRAY(iterable) === true) {
            return Promise.all(iterable.map(async (item) => { await iteratee(item); return null; } ));
        }
        if (IS_MAP(iterable) === true) {
            const keys = Array.from(iterable.keys());
            return Promise.all(keys.map(async (key) => { await iteratee(iterable.get(key), key); return null; } ));
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
        if (IS_ARRAY(iterable) === false) throw new TypeError(`Given iterable is not a proper Array.`);
        if (IS_FUNCTION(iteratee) === false) throw new TypeError(`Given iteratee is not a proper function.`);
        if (filterIteratee) {
            if (IS_FUNCTION(filterIteratee) === false) throw new TypeError(`Given filterIteratee is not a proper function.`);
            if (IS_ASYNC(filterIteratee) === true) throw new TypeError(`Given filterIteratee should not be an async function.`);
        }
        const iterable2 = filterIteratee ? iterable.filter((item) => filterIteratee(item)) : iterable;
        return Promise.all(iterable2.map(async (item) => await iteratee(item)));
    }
}