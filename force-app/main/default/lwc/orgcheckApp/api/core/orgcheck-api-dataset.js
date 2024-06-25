export class OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger, parameters) {
        console.error('sfdcManager:', sfdcManager);
        console.error('dataFactory:', dataFactory);
        console.error('localLogger:', localLogger);
        console.error('parameters:', parameters);
        throw new TypeError('You need to implement the method "async run(sfdcManager, dataFactory, localLogger, parameters)"');
    }
}