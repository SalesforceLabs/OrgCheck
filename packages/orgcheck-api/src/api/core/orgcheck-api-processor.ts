
class Processor {

    constructor(private readonly concurrencyLimit: number) {
        if (concurrencyLimit) {
            if (Number.isInteger(concurrencyLimit) === false) throw new TypeError(`Given concurrencyLimit is not a proper integer.`);
            if (concurrencyLimit < 1) throw new TypeError(`Given concurrencyLimit must be positive and not equal to zero.`);
        } else {
            this.concurrencyLimit = Infinity;
        }
    }

    private async runTaskPool<T>(tasks: Array<() => Promise<T>>, settleAll: boolean): Promise<Array<PromiseSettledResult<T>>> {
        if (tasks.length === 0) return [];

        const results: Array<PromiseSettledResult<T>> = new Array(tasks.length);
        let nextIndex = 0;

        const worker = async (): Promise<void> => {
            while (nextIndex < tasks.length) {
                const currentIndex = nextIndex;
                nextIndex += 1;

                try {
                    const value = await tasks[currentIndex]();
                    results[currentIndex] = { status: 'fulfilled', value };
                } catch (reason) {
                    results[currentIndex] = { status: 'rejected', reason };
                    if (!settleAll) {
                        throw reason;
                    }
                }
            }
        };

        const workerCount = Math.min(this.concurrencyLimit, tasks.length);
        await Promise.all(Array.from({ length: workerCount }, async () => worker()));
        return results;
    }

    public async runAll<T>(asyncFunctions: Array<() => Promise<T>>) {
        return (await this.runTaskPool(asyncFunctions, false)).map((result: PromiseSettledResult<T>) => (result as PromiseFulfilledResult<T>).value);
    }

    public async runAllSettled<T>(asyncFunctions: Array<() => Promise<T>>) {
        return await this.runTaskPool(asyncFunctions, true);
    }

    /**
     * @description Runs in parallel a function for each item of a given array or map.
     * @param {T[] | Map<U, T>} iterable - A map to iterate over
     * @param {(item: T, key: U)} iteratee - A function to call on each item in the map. Invoked with (item). Can be sync or async.
     * @public
     * @async
     */
    public async forEach<T>(iterable: T[], iteratee: (item: T, key: number) => Promise<void> | void): Promise<void>;
    public async forEach<T, U>(iterable: Map<U, T>, iteratee: (item: T, key: U) => Promise<void> | void): Promise<void>;
    public async forEach<T, U>(iterable: T[] | Map<U, T>, iteratee: (item: T, key: U | number) => Promise<void> | void): Promise<void> {
        if (!iterable) return;
        if (typeof iteratee !== 'function') throw new TypeError(`Given iteratee is not a proper function.`);
        if (iterable instanceof Map === true) {
            if (iterable.size === 0) return;
            await this.runAll<void>(
                Array.from(iterable.keys()).map(
                    (key: U) => async (): Promise<void> => { 
                        const value = iterable.get(key); 
                        if (value) await iteratee(value, key); 
                    }
                )
            );
        } else if (Array.isArray(iterable) === true) {
            if (iterable.length === 0) return;
            await this.runAll<void>(
                iterable.map(
                    (item: T, index: number) => async (): Promise<void> => { 
                        await iteratee(item, index); 
                    }
                )
            );
        } else {
            throw new TypeError(`Given iterable is not a proper Map or Array.`)
        }
    }

    /**
     * @description Runs in parallel a function for each item of a given iterable (must be an Array), and 
     *   constructs a new array with the same size but with the results of each call to the function.
     * @param {T[]} iterable - An array to iterate over
     * @param {(item: T, index?: number)} iteratee - A function to call on each item in the array. Invoked with (item). Supposed to return a new item based on the original item.
     * @param {(item: T, index?: number)} [filterIteratee] - An optional function to call on each item in the array. Invoked with (item). Returns true or false.
     * @returns {Promise<U[]>} Async operation that returns an array
     * @public
     * @async
     */
    public async map<T, U>(iterable: T[], iteratee: (item: T, index?: number) => Promise<U> | U, filterIteratee?: (item: T, index?: number) => boolean): Promise<U[]> {
        if (!iterable) return [];
        if (Array.isArray(iterable) === false) throw new TypeError(`Given iterable is not a proper Array.`);
        if (iterable.length === 0) return [];
        if (typeof iteratee !== 'function') throw new TypeError(`Given iteratee is not a proper function.`);
        if (filterIteratee) {
            if (typeof filterIteratee !== 'function') throw new TypeError(`Given filterIteratee is not a proper function.`);
            if (filterIteratee.constructor.name === 'AsyncFunction') throw new TypeError(`Given filterIteratee should not be an async function.`);
        }
        return await this.runAll<U>(
            (filterIteratee ? iterable.filter((item: T, index: number) => filterIteratee(item, index)) : iterable)
                .map((item: T, index: number) => async () => await iteratee(item, index))
        );
    }
}

export const SmallProcessor = new Processor(5);
export const MediumProcessor = new Processor(8);
export const LargeProcessor = new Processor(10);
