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
    type;
    isAbstract;
    isClass;
    isEnum;
    isInterface;
    isSharingMissing;
    innerClassesCount;
    isSchedulable;
    isScheduled;
    interfaces;
    extends;
    methodsCount;
    annotations;
    specifiedSharing;
    specifiedAccess;
    length;
    sourceCode;
    needsRecompilation;
    coverage;
    relatedTestClassIds;
    relatedTestClassRefs;
    relatedClassIds;
    relatedClassRefs;
    createdDate;
    lastModifiedDate;
}