export class OrgCheckDatasetParameters {

    initData(setup) { 
        // Copy properties from setup to object
        // NB: Please note that ONLY the properties explicitely set in
        //     the class will be copied from setup to object
        Object.keys(this).forEach((p) => { this[p] = setup[p]; });
        Object.seal(this);
    }
}