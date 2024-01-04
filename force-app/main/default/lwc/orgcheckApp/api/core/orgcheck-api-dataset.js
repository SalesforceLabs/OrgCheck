export class OrgCheckDataset {

    run(resolve, reject, parameters) {
        console.error('resolve:', resolve);
        console.error('reject:', reject);
        console.error('parameters:', parameters);
        throw new Error('You need to implement the method "run(resolve, reject, parameters)"');
    } 
}