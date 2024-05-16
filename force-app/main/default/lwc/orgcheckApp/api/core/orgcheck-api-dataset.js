export class OrgCheckDataset {

    run(sfdcManager, dataFactory, localLogger, resolve, reject, parameters) {
        console.error('sfdcManager:', sfdcManager);
        console.error('dataFactory:', dataFactory);
        console.error('localLogger:', localLogger);
        console.error('resolve:', resolve);
        console.error('reject:', reject);
        console.error('parameters:', parameters);
        throw new TypeError('You need to implement the method "run(sfdcManager, dataFactory, localLogger, resolve, reject, parameters)"');
    }
}