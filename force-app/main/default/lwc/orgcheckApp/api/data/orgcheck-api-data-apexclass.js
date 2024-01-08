import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_ApexClass extends OrgCheckData {
    id;
    name;
    url;
    apiVersion;
    package;
    isTest;
    nbSystemAsserts;
    type;
    isAbstract;
    isClass;
    isEnum;
    isInterface;
    isSharingMissing;
    innerClassesCount;
    isScheduled;
    interfaces;
    extends;
    methodsCount;
    annotations;
    specifiedSharing;
    specifiedAccess;
    length;
    needsRecompilation;
    coverage;
    relatedTestClasses;
    relatedClasses;
    createdDate;
    lastModifiedDate;

    constructor(setup) {
        super();
        super.initData(setup);
    }
}