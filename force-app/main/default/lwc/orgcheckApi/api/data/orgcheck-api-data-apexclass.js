import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_ApexClass extends OrgCheckData {
    id;
    name;
    url;
    apiVersion;
    package;
    isTest;
    isTestSeeAllData;
    nbSystemAsserts;
    isAbstract;
    isClass;
    isEnum;
    isInterface;
    isSharingMissing;
    innerClassesCount;
    isScheduled;
    interfaces;
    methodsCount;
    annotations;
    specifiedSharing;
    length;
    needsRecompilation;
    coverage;
    relatedTestClasses;
    createdDate;
    lastModifiedDate;

    constructor(setup) {
        super();
        super.initData(setup);
    }
}