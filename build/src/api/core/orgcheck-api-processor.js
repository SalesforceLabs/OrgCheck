const IS_ASYNC = (/** @type {any} */ f) => f?.constructor.name === 'AsyncFunction';
const IS_FUNCTION = (/** @type {any} */ f) => typeof f === 'function';
const IS_ARRAY = (/** @type {any} */ a) => Array.isArray(a);
const IS_MAP = (/** @type {any} */ m) => m instanceof Map;

export class Processor {

    /**
     * @description Runs in parallel a function for each item of a given array or map.
     * @param {Array<any> | Map<string, any>} iterable - An array or a map to iterate over
     * @param {Function} iteratee - A function to call on each item in the array. Invoked with (item). Not supposed to return anything.
     * @public
     * @async
     */
    static async forEach(iterable, iteratee) {
        if (!iterable) return;
        if (IS_FUNCTION(iteratee) === false) throw new TypeError(`Given iteratee is not a proper function.`);
        if (IS_ARRAY(iterable) === true) {
            await Promise.all(iterable.map(
                /** 
                 * @description Launch the iteratee function for each item in the array asynchronously
                 * @param {any} item - The item
                 * @returns {Promise<null>} Nothing in particular
                 * @async
                 */
                async (item) => { 
                    await iteratee(item); 
                    return null; 
                }
            ));
            return;
        }
        if (IS_MAP(iterable) === true) {
            const keys = Array.from(iterable.keys());
            await Promise.all(keys.map(
                /** 
                 * @description Launch the iteratee function for each item in the array asynchronously
                 * @param {string} key - The key
                 * @returns {Promise<null>} Nothing in particular
                 * @async
                 */
                async (key) => { 
                    await iteratee(iterable.get(key), key); 
                    return null; 
                }
            ));
            return;
        }
        throw new TypeError(`Given iterable is not a proper Array nor Map.`);
    }

    /**
     * @description Runs in parallel a function for each item of a given iterable (must be an Array), and 
     *   constructs a new array with the same size but with the results of each call to the function.
     * @param {Array<any>} iterable - An array to iterate over
     * @param {Function} iteratee - A function to call on each item in the array. Invoked with (item). Supposed to return a new item based on the original item.
     * @param {Function} [filterIteratee] - An optional function to call on each item in the array. Invoked with (item). Returns true or false.
     * @returns {Promise<Array<any>>} Async operation that returns an array
     * @public
     * @async
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