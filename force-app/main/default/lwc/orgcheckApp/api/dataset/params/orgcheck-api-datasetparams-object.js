import { OrgCheckDatasetParameters } from '../../core/orgcheck-api-datasetparams';

export class OrgCheckDatasetObjectParameters extends OrgCheckDatasetParameters {
    object;
    constructor(setup) {
        super();
        super.initData(setup);
    }
}