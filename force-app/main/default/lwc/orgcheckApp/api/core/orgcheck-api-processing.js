export const METHOD_PARALLEL = 1;
export const METHOD_MIX = 2;
export const METHOD_CLASSIC = 3;

export const ArrayMapProcessor = async (method, array, callback) => {
    if (!array || Array.isArray(array) === false) throw new TypeError(`Given array is null or not an array.`);
    switch (method) { 
        case METHOD_PARALLEL: {
            return Promise.all(array.map(async (item) => callback(item) )); 
        }
        case METHOD_MIX: {
            const CHUNK_SIZE = array.length*0.1;
            const chunks = [];
            for (let i = 0; i < array.length; i += CHUNK_SIZE) {
                chunks.push(array.slice(i, i + CHUNK_SIZE));
            }
            return Promise.all(chunks.map(async (chunk) => chunk.map(callback) )).then((results) => results.flat(1)); 
        }
        case METHOD_CLASSIC:
        default: {
            return array.map(callback);  
        }
    }
}