---
layout: default
title: Diagrams
permalink: /diagrams/
mermaid: true
---

# Org Check classes and diagrams

## Overview

```mermaid
classDiagram
API *-- RecipeManagerIntf : composition
API *-- DatasetManagerIntf : composition
API *-- SalesforceManagerIntf : composition
API *-- DataCacheManagerIntf : composition
API *-- LoggerIntf : composition
DataCacheManager --|> DataCacheManagerIntf : implements
DataCacheManagerIntf --> DataCacheItemIntf : uses
Compressor --|> CompressorIntf : implements
DataCacheManagerIntf --> CompressorIntf : uses
DataCacheManagerIntf --> StorageIntf : uses
DataWithDependencies --|> Data : implements
DataFactory --|> DataFactoryIntf : implements
DataFactoryInstance --|> DataFactoryInstanceIntf : implements
DatasetManager --|> DatasetManagerIntf : implements
Logger --|> LoggerIntf : implements
LoggerIntf --|> BasicLoggerIntf : implements
RecipeManager --|> RecipeManagerIntf : implements
SalesforceManager --|> SalesforceManagerIntf : implements
SalesforceError --|> Error : implements
Storage --|> StorageIntf : implements
```

## Starting point: the API class!

The starting point in the Org Check API is the `API` class (in `packages/orgcheck-api/src/api/orgcheck-api-impl.ts`), 
built and exported as `packages/orgcheck-api/dist/orgcheck.js`.

### Diagram of the API class

```mermaid
classDiagram
    class API {
        +version() string
        +salesforceApiVersion() number
        +removeAllFromCache()
        +getCacheInformation() Array~DataCacheItemIntf~
        +getCacheData(string itemName) any
        +getAllScoreRulesAsDataMatrix() DataMatrixIntf
        +dailyApiRequestLimitInformation() SalesforceUsageInformation
        +runAllTestsAsync() string
        +compileClasses(Array~string~ apexClassIds) Map~string, any~
        +getOrganizationInformation() SfdcOrganization
        +checkUsageTerms() boolean
        +wereUsageTermsAcceptedManually() boolean
        +acceptUsageTermsManually()
        +checkCurrentUserPermissions() boolean
        +getPackages() Array~SfdcPackage~
        +removeAllPackagesFromCache()
        +getPageLayouts(string namespace, string sobjectType, string sobject) Array~SfdcPageLayout~
        +removeAllPageLayoutsFromCache()
        +get...()
        +removeAll...FromCache()
    }

API *-- RecipeManagerIntf : composition
API *-- DatasetManagerIntf : composition
API *-- SalesforceManagerIntf : composition
API *-- DataCacheManagerIntf : composition
API *-- LoggerIntf : composition
```

### Creation of an instance of the API class

To create an instance of the Org Check API you would do:
```
const api = ApiFactory.create({
    salesforce: {
        authenticationOptions: { accessToken: '........' },
        connection: connection  // optional: jsforce Connection instance
    },
    storage: { 
        setItem: (key, value) => { ... },
        getItem: (key) => { ... },
        removeItem: (key) => { ... },
        key: (n) => { ... },
        length: () => { ... }
    },
    logSettings: {
        started: (operationName) => { ... },
        messageLogged: (operationName, message) => { ... },
        endedWithError: (operationName, error) => { ... },
        endedSuccessfully: (operationName, message) => { ... },
        stopped: (operationName) => { ... }
    }
});
```

The `salesforce` setup accepts either `authenticationOptions` (with `accessToken`) or a `connection` 
(jsforce Connection instance) to connect to a Salesforce org.

The `storage` setup provides key-value persistence with `setItem`, `getItem`, `removeItem`, `key`, and 
`length`. The browser app uses `localStorage`; the fflate library is used for compression when storing 
data. Note: it does not encrypt the data!

The `logSettings` setup provides callbacks for progress tracking: `started`, `messageLogged`, 
`endedWithError`, `endedSuccessfully`, and `stopped`. 

Once initialiazed, and before processing further, you should check if the terms of conditions are 
auto-approved (non production environment) or need to be approved manually (production environment) 
by calling api.checkUsageTerms(). If the method returns false, you will have to specifically accept 
the term by calling api.acceptUsageTermsManually().

### Retrieve data from the org via the API class

Multiple methods are accessible to retrieve data from the org that is scored by Org Check. 
This data is a result of the Recipe process discussed later.
All these methods are `async`.

```mermaid
classDiagram
    class API {
        +getOrganizationInformation() SfdcOrganization
        +getPackages() Array~SfdcPackage~
        +getPageLayouts(namespace, sobjectType, sobject) Array~SfdcPageLayout~
        +getObjectTypes() Array~SfdcObjectType~
        +getObjects(namespace, sobjectType) Array~SfdcObject~
        +getObject(sobject) SfdcObject
        +getObjectPermissionsPerParent(namespace) DataMatrixIntf
        +getApplicationPermissionsPerParent(namespace) DataMatrixIntf
        +getKnowledgeArticles() Array~SfdcKnowledgeArticle~
        +getChatterGroups() Array~SfdcCollaborationGroup~
        +getCustomFields(namespace, sobjectType, sobject) Array~SfdcField~
        +getPermissionSets(namespace) Array~SfdcPermissionSet~
        +getPermissionSetLicenses() Array~SfdcPermissionSetLicense~
        +getProfiles(namespace) Array~SfdcProfile~
        +getProfileRestrictions(namespace) Array~SfdcProfileRestrictions~
        +getProfilePasswordPolicies() Array~SfdcProfilePasswordPolicy~
        +getActiveUsers() Array~SfdcUser~
        +getBrowsers() Array~SfdcBrowser~
        +getCustomLabels(namespace) Array~SfdcCustomLabel~
        +getCustomTabs(namespace) Array~SfdcCustomTab~
        +getDocuments(namespace) Array~SfdcDocument~
        +getLightningWebComponents(namespace) Array~SfdcLightningWebComponent~
        +getLightningAuraComponents(namespace) Array~SfdcLightningAuraComponent~
        +getLightningPages(namespace) Array~SfdcLightningPage~
        +getVisualForceComponents(namespace) Array~SfdcVisualForceComponent~
        +getVisualForcePages(namespace) Array~SfdcVisualForcePage~
        +getPublicGroups() Array~SfdcGroup~
        +getQueues() Array~SfdcGroup~
        +getApexClasses(namespace) Array~SfdcApexClass~
        +getApexTests(namespace) Array~SfdcApexClass~
        +getApexUncompiled(namespace) Array~SfdcApexClass~
        +getApexTriggers(namespace) Array~SfdcApexTrigger~
        +getRoles() Array~SfdcUserRole~
        +getRolesTree() SfdcUserRole
        +getStaticResources(namespace) Array~SfdcStaticResource~
        +getWeblinks(namespace, sobjectType, sobject) Array~SfdcWebLink~
        +getWorkflows() Array~SfdcWorkflow~
        +getRecordTypes(namespace, sobjectType, sobject) Array~SfdcRecordType~
        +getFieldPermissionsPerParent(sobject, namespace) DataMatrixIntf
        +getFlows() Array~SfdcFlow~
        +getEmailTemplates(namespace) Array~SfdcEmailTemplate~
        +getHomePageComponents() Array~SfdcHomePageComponent~
        +getProcessBuilders() Array~SfdcFlow~
        +getValidationRules(namespace, sobjectType, sobject) Array~SfdcValidationRule~
        +getDashboards() Array~SfdcDashboard~
        +getReports() Array~SfdcReport~
        +getGlobalView() Array~DataCollectionStatisticsIntf~
        +getHardcodedURLsView() Array~DataCollectionStatisticsIntf~
}
```

## Recipes

A `Recipe` can be defined as a data transformer that needs some input data (from `Dataset`) and then 
transform the data all together into a complexe structure.

Most of the time, the recipe combines multiple objects that are related to each other, like a `User` 
and its `Profile`.

The `Recipe` is not the place to calculate or modify the score of the data, this is done at the 
`Dataset` level.


## Datasets

A `Dataset` can be defined as a data retriever.

Most of the time, the dataset will use the salesforce manager to read information from the org (SOQL, 
SOSL, Tooling, Describe, etc.) and then will map that data into the corresponding `Sfdc*` object.

Data factories are used to create the `Sfdc*` objects and also to compute the objects' scores.

Scores are calculated based on the `SecretSauce` class.

