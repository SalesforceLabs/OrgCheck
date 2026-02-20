export class Processor {

    /**
     * @description Runs in parallel a function for each item of a given array or map.
     * @param {Array<any> | Map<string, any>} iterable - An array or a map to iterate over
     * @param {(item: any, key?: string)} iteratee - A function to call on each item in the array. Invoked with (item). Not supposed to return anything.
     * @public
     * @async
     */
    static forEach(iterable: Array<any> | Map<string, any>, iteratee: (item: any, key?: string) => Promise<void>): Promise<void> {
        if (!iterable) return Promise.resolve();
        if (typeof iteratee !== 'function') throw new TypeError(`Given iteratee is not a proper function.`);
        if (Array.isArray(iterable) === true) {
            return Promise.all(iterable.map(
                /** 
                 * @description Launch the iteratee function for each item in the array asynchronously
                 * @param {any} item - The item
                 * @returns {Promise<null>} Nothing in particular
                 * @async
                 */
                async (item: any): Promise<null> => { 
                    await iteratee(item); 
                    return null; 
                }
            )).then(() => {});
        }
        if (iterable instanceof Map) {
            const keys = Array.from(iterable.keys());
            return Promise.all(keys.map(
                /** 
                 * @description Launch the iteratee function for each item in the array asynchronously
                 * @param {string} key - The key
                 * @returns {Promise<null>} Nothing in particular
                 * @async
                 */
                async (key: string): Promise<null> => { 
                    await iteratee(iterable.get(key), key); 
                    return null; 
                }
            )).then(() => {});
        }
        return Promise.reject(new TypeError(`Given iterable is not a proper Array nor Map.`));
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
    static map(iterable: Array<any>, iteratee: Function, filterIteratee?: Function): Promise<Array<any>> {
        if (!iterable) return Promise.resolve([]);
        if (Array.isArray(iterable) === false) throw new TypeError(`Given iterable is not a proper Array.`);
        if (typeof iteratee !== 'function') throw new TypeError(`Given iteratee is not a proper function.`);
        if (filterIteratee) {
            if (typeof filterIteratee !== 'function') throw new TypeError(`Given filterIteratee is not a proper function.`);
            if (filterIteratee.constructor.name === 'AsyncFunction') throw new TypeError(`Given filterIteratee should not be an async function.`);
        }
        const iterable2 = filterIteratee ? iterable.filter((item) => filterIteratee(item)) : iterable;
        return Promise.all(iterable2.map(async (item) => await iteratee(item)));
    }
}