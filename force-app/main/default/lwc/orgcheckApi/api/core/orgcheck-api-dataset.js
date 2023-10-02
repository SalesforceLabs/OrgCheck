export class OrgCheckDataset {

    #name;

    constructor(name) {
        this.#name = name;
    }

    getName() { 
        return this.#name; 
    }

    run(resolve, reject, parameters) {
        console.error('resolve:', resolve);
        console.error('reject:', reject);
        console.error('parameters:', parameters);
        throw new Error('You need to implement the method "retrieve(resolve, reject, parameters)"');
    } 
}