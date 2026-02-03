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
DataItemInCache --|> ItemInCache : implements
MetadataItemInCache --|> ItemInCache : implements
Compressor --|> CompressorIntf : implements
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

The starting point in the Org Check api is the `API` class (how original!) located in the 
file build/src/api/orgcheck-api.js

### Diagram of the API class

```mermaid
classDiagram
    class API {
        +version() string
        +salesforceApiVersion() number
        +removeAllFromCache()
        +getCacheInformation() Array~DataCacheItem~
        +getCacheData(string itemName) any
        +getAllScoreRulesAsDataMatrix() DataMatrix
        +dailyApiRequestLimitInformation() SalesforceUsageInformation
        +runAllTestsAsync() string
        +compileClasses(Array~string~ apexClassIds) Map~string, any~
        +getOrganizationInformation() SFDC_Organization
        +checkUsageTerms() boolean
        +wereUsageTermsAcceptedManually() boolean
        +acceptUsageTermsManually()
        +checkCurrentUserPermissions() boolean
        +getPackages() Array~SFDC_Package~
        +removeAllPackagesFromCache()
        +getPageLayouts(string namespace, string sobjectType, string sobject) Array~SFDC_PageLayout~
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
const api = new API({
    salesforce: {
        authentication: { accessToken: '........' },
        connection: { useJsForce: true }
    },
    storage: { 
        localImpl: this.localStorage,
        compression: { useFflate: true },
        encoding: { useFflate: true }
    },
    logSettings: {
        isConsoleFallback: () => { return true; },
        log: (section, message) => { ... },
        ended: (section, message) => { ... },
        failed: (section, error) => { ... }
    }
});
```

At this point we get only an access token to connect to a Salesforce org. We are actively working 
on implementing the authentication with a connected app/external app approach.

The api will store as much as it can in a local storage. As of now the implementation that is used 
is the one from the browser. Using the third party fflate help us reducing the size of the data 
being stored. Note: it does not encrypt the data!

Finally, the api will use a set of methods to notify the user about how is the process going. 

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
        +getOrganizationInformation() SFDC_Organization
        +getPackages() Array~SFDC_Package~
        +getPageLayouts(namespace, sobjectType, sobject) Array~SFDC_PageLayout~
        +getObjectTypes() Array~SFDC_ObjectType~
        +getObjects(namespace, sobjectType) Array~SFDC_Object~
        +getObject(sobject) SFDC_Object
        +getObjectPermissionsPerParent(namespace) DataMatrix
        +getApplicationPermissionsPerParent(namespace) DataMatrix
        +getKnowledgeArticles() Array~SFDC_KnowledgeArticle~
        +getChatterGroups() Array~SFDC_CollaborationGroup~
        +getCustomFields(namespace, sobjectType, sobject) Array~SFDC_Fiel~
        +getPermissionSets(namespace) Array~SFDC_PermissionSet~
        +getPermissionSetLicenses() Array~SFDC_PermissionSetLicense~
        +getProfiles(namespace) Array~SFDC_Profile~
        +getProfileRestrictions(namespace) Array~SFDC_ProfileRestrictions~
        +getProfilePasswordPolicies() Array~SFDC_ProfilePasswordPolicy~
        +getActiveUsers() Array~SFDC_User~
        +getBrowsers() Array~SFDC_Browser~
        +getCustomLabels(namespace) Array~SFDC_CustomLabel~
        +getCustomTabs(namespace) Array~SFDC_CustomTab~
        +getDocuments(namespace) Array~SFDC_Document~
        +getLightningWebComponents(namespace) Array~SFDC_LightningWebComponent~
        +getLightningAuraComponents(namespace) Array~SFDC_LightningAuraComponent~
        +getLightningPages(namespace) Array~SFDC_LightningPage~
        +getVisualForceComponents(namespace) Array~SFDC_VisualForceComponent~
        +getVisualForcePages(namespace) Array~SFDC_VisualForcePage~
        +getPublicGroups() Array~SFDC_Group~
        +getQueues() Array~SFDC_Group~
        +getApexClasses(namespace) Array~SFDC_ApexClass~
        +getApexTests(namespace) Array~SFDC_ApexClass~
        +getApexUncompiled(namespace) Array~SFDC_ApexClass~
        +getApexTriggers(namespace) Array~SFDC_ApexTrigger~
        +getRoles() Array~SFDC_UserRole~
        +getRolesTree() SFDC_UserRole
        +getStaticResources(namespace) Array~SFDC_StaticResource~
        +getWeblinks(namespace, sobjectType, sobject) Array~SFDC_WebLink~
        +getWorkflows() Array~SFDC_Workflow~
        +getRecordTypes(namespace, sobjectType, sobject) Array~SFDC_RecordType~
        +getFieldPermissionsPerParent(sobject, namespace) DataMatrix
        +getFlows() Array~SFDC_Flow~
        +getEmailTemplates(namespace) Array~SFDC_EmailTemplate~
        +getHomePageComponents() Array~SFDC_HomePageComponent~
        +getProcessBuilders() Array~SFDC_Flow~
        +getValidationRules(namespace, sobjectType, sobject) Array~SFDC_ValidationRule~
        +getDashboards() Array~SFDC_Dashboard~
        +getReports() Array~SFDC_Report~
        +getGlobalView() Map~string, DataCollectionStatistics~
        +getHardcodedURLsView() Map~string, DataCollectionStatistics~
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
SOSL, Tooling, Describe, etc.) and then will map that data into the corresponding `SFDC_*` object.

Data factories are used to create the `SFDC_*` objects and also to compute the objects' scores.

Scores are calculated based on the `SecretSauce` class.

