---
layout: default
title: Diagrams
permalink: /diagrams/
---

# Diagrams

## Class Diagram

```mermaid
classDiagram
namespace Core {
    class DatasetManagerIntf {
        <<interface>>
        +run(datasets) Map~string, any~
        +clean(datasets)
    }
    
    class DatasetManager {
        +run(datasets) Map~string, any~
        +clean(datasets)
    }
    
    class Dataset {
        <<abstract>>
        +run(sfdcManager, dataFactory, logger, parameters) Map~string, Data | DataWithoutScoring~
    }
    
    class DataFactoryIntf {
        <<interface>>
        +getInstance(dataClass) DataFactoryInstanceIntf
    }
    
    class DataFactory {
        +getInstance(dataClass) DataFactoryInstanceIntf
    }
    
    class DataFactoryInstanceIntf {
        <<interface>>
        +create(setup) any
        +computeScore(row) any
        +createWithScore(setup) any
    }
    
    class DataFactoryInstance {
        +create(setup) any
        +computeScore(row) any
        +createWithScore(setup) any
    }
    
    class DataCacheManagerIntf {
        <<interface>>
        +get(key) any
        +set(key, value) 
        +remove(key)
        +clear()
        +details() Array~DataCacheItem~
    }
    
    class DataCacheManager {
        +get(key) any
        +set(key, value) 
        +remove(key)
        +clear()
        +details() Array~DataCacheItem~
    }
    
    class LoggerIntf {
        <<interface>>
        +toSimpleLogger(operationName) SimpleLoggerIntf
        +enableFailed(flag)
    }
    
    class BasicLoggerIntf {
        <<interface>>
        +isConsoleFallback() boolean
        +log(operationName, message)
        +ended(operationName, message)
        +failed(operationName, error)
    }
    
    class SimpleLoggerIntf {
        <<interface>>
        +log(message)
        +debug(message)
    }
    
    class Logger {
        +enableFailed(flag)
        +toSimpleLogger(operationName) SimpleLoggerIntf
    }
    
    class SalesforceManagerIntf {
        <<interface>>
        +apiVersion() number
        +caseSafeId(id) string
        +setupUrl(id, type, parentId, parentType) string
        +getObjectType(apiName, isCustomSetting) string
        +dailyApiRequestLimitInformation() SalesforceUsageInformation
        +soqlQuery(queries, logger) Array~Array~any~
        +soslQuery(queries, logger) Array~Array~any~
        +dependenciesQuery(ids, logger) { records: Array~any~, errors: Array~string~ }~
        +readMetadata(metadatas, logger) Map~string, Array~any~
        +readMetadataAtScale(type, ids, byPasses, logger) Array~any~
        +describeGlobal(logger) Array~any~
        +describe(sobjectDevName, logger) any~
        +recordCount(sobjectDevName, logger) number~
        +runAllTests(logger) string~
        +compileClasses(apexClassIds, logger) Map~string, { isSuccess: boolean, reasons?: Array~string~ }~
    }
    
    class SalesforceManager {
        +apiVersion() number
        +caseSafeId(id) string
        +setupUrl(id, type, parentId, parentType) string
        +getObjectType(apiName, isCustomSetting) string
        +dailyApiRequestLimitInformation() SalesforceUsageInformation
        +soqlQuery(queries, logger) Array~Array~any~
        +soslQuery(queries, logger) Array~Array~any~
        +dependenciesQuery(ids, logger) { records: Array~any~, errors: Array~string~ }~
        +readMetadata(metadatas, logger) Map~string, Array~any~
        +readMetadataAtScale(type, ids, byPasses, logger) Array~any~
        +describeGlobal(logger) Array~any~
        +describe(sobjectDevName, logger) any~
        +recordCount(sobjectDevName, logger) number~
        +runAllTests(logger) string~
        +compileClasses(apexClassIds, logger) Map~string, { isSuccess: boolean, reasons?: Array~string~ }~
    }
    
    class Data {
        <<abstract>>
        +label() string
        +score number
        +badFields Array~string~
        +badReasonIds Array~number~
    }
    
    class DataWithDependencies {
        <<abstract>>
        +dependencies DataDependenciesForOneItem
    }
    
    class DataWithoutScoring {
        <<abstract>>
    }
}

namespace Data {
    class SFDC_ApexClass {
        +id string
        +name string
        +url string
        +apiVersion number
        +package string
        +isTest boolean
        +isTestSeeAllData boolean
        +nbSystemAsserts number
        +isAbstract boolean
        +isClass boolean
        +isEnum boolean
        +isInterface boolean
        +innerClassesCount number
        +isSchedulable boolean
        +isScheduled boolean
        +interfaces Array~string~
        +extends Array~string~
        +methodsCount number
        +testPassedButLongMethods Array~SFDC_ApexTestMethodResult~
        +testFailedMethods Array~SFDC_ApexTestMethodResult~
        +lastTestRunDate number
        +testMethodsRunTime number
        +annotations Array~string~
        +specifiedSharing string
        +specifiedAccess string
        +length number
        +hardCodedURLs Array~string~
        +hardCodedIDs Array~string~
        +needsRecompilation boolean
        +coverage number
        +relatedTestClassIds Array~string~
        +relatedTestClassRefs Array~SFDC_ApexClass~
        +relatedClassIds Array~string~
        +relatedClassRefs Array~SFDC_ApexClass~
        +createdDate number
        +lastModifiedDate number
    }
    
    class SFDC_ApexTestMethodResult {
        +methodName string
        +isSuccessful boolean
        +runtime number
        +stacktrace string
        +cpuConsumption number
        +asyncCallsConsumption number
        +soslConsumption number
        +soqlConsumption number
        +queryRowsConsumption number
        +dmlRowsConsumption number
        +dmlConsumption number
    }    
}

namespace Dataset {
    class DatasetApexClasses {
        +run(sfdcManager, dataFactory, logger) Map~string, SFDC_ApexClass~
    }
}

namespace OrgCheck {
    class API {
        +version string
        +salesforceApiVersion number
        +removeAllFromCache()
        +getCacheInformation() Array~DataCacheItem~
        +getCacheData(itemName) any
        +getAllScoreRulesAsDataMatrix() DataMatrix
        +dailyApiRequestLimitInformation() SalesforceUsageInformation
        +runAllTestsAsync() string~
        +compileClasses(apexClassIds) Map~string, { isSuccess: boolean, reasons?: Array~string~ }~
        +getOrganizationInformation() SFDC_Organization~
        +checkUsageTerms() boolean~
        +wereUsageTermsAcceptedManually() boolean
        +acceptUsageTermsManually()
        +checkCurrentUserPermissions() boolean~
        +getActiveUsers() Array~SFDC_User~
        +getApexClasses(namespace) Array~SFDC_ApexClass~
        +getApexTests(namespace) Array~SFDC_ApexClass~
        +getApexTriggers(namespace) Array~SFDC_ApexTrigger~
        +getApexUncompiled(namespace) Array~SFDC_ApexClass~
        +getApplicationPermissionsPerParent(namespace) DataMatrix~
        +getBrowsers() Array~SFDC_Browser~
        +getChatterGroups() Array~SFDC_CollaborationGroup~
        +getCustomFields(namespace, sobjectType, sobject) Array~SFDC_Field~
        +getCustomLabels(namespace) Array~SFDC_CustomLabel~
        +getCustomTabs(namespace) Array~SFDC_CustomLabel~
        +getDashboards() Array~SFDC_Dashboard~
        +getDocuments(namespace) Array~SFDC_Document~
        +getEmailTemplates(namespace) Array~SFDC_EmailTemplate~
        +getFieldPermissionsPerParent(sobject, namespace) DataMatrix~
        +getFlows() Array~SFDC_Flow~
        +getGlobalView() Map~string, DataCollectionStatistics~
        +getHardcodedURLsView() Map~string, DataCollectionStatistics~
        +getHomePageComponents() Array~SFDC_HomePageComponent~
        +getKnowledgeArticles() Array~SFDC_KnowledgeArticle~
        +getLightningAuraComponents(namespace) Array~SFDC_LightningAuraComponent~
        +getLightningPages(namespace) Array~SFDC_LightningPage~
        +getLightningWebComponents(namespace) Array~SFDC_LightningWebComponent~
        +getObject(sobject) SFDC_Object~
        +getObjectPermissionsPerParent(namespace) DataMatrix~
        +getObjects(namespace, sobjectType) Array~SFDC_Object~
        +getObjectTypes() Array~SFDC_ObjectType~
        +getPackages() Array~SFDC_Package~
        +getPageLayouts(namespace, sobjectType, sobject) Array~SFDC_PageLayout~
        +getPermissionSetLicenses() Array~SFDC_PermissionSetLicense~
        +getPermissionSets(namespace) Array~SFDC_PermissionSet~
        +getProcessBuilders() Array~SFDC_Flow~
        +getProfilePasswordPolicies() Array~SFDC_ProfilePasswordPolicy~
        +getProfileRestrictions(namespace) Array~SFDC_ProfileRestrictions~
        +getProfiles(namespace) Array~SFDC_Profile~
        +getPublicGroups() Array~SFDC_Group~
        +getQueues() Array~SFDC_Group~
        +getRecordTypes(namespace, sobjectType, sobject) Array~SFDC_RecordType~
        +getReports() Array~SFDC_Report~
        +getRoles() Array~SFDC_UserRole~
        +getRolesTree() SFDC_UserRole~
        +getStaticResources(namespace) Array~SFDC_StaticResource~
        +getValidationRules(namespace, sobjectType, sobject) Array~SFDC_ValidationRule~
        +getVisualForceComponents(namespace) Array~SFDC_VisualForceComponent~
        +getVisualForcePages(namespace) Array~SFDC_VisualForcePage~
        +getWeblinks(namespace, sobjectType, sobject) Array~SFDC_WebLink~
        +getWorkflows() Array~SFDC_Workflow~
        +removeAllActiveUsersFromCache()
        +removeAllApexClassesFromCache()
        +removeAllApexTestsFromCache()
        +removeAllApexTriggersFromCache()
        +removeAllApexUncompiledFromCache()
        +removeAllAppPermissionsFromCache()
        +removeAllBrowsersFromCache()
        +removeAllChatterGroupsFromCache()
        +removeAllCustomFieldsFromCache()
        +removeAllCustomLabelsFromCache()
        +removeAllCustomTabsFromCache()
        +removeAllDashboardsFromCache()
        +removeAllDocumentsFromCache()
        +removeAllEmailTemplatesFromCache()
        +removeAllFieldPermissionsFromCache()
        +removeAllFlowsFromCache()
        +removeAllHomePageComponentsFromCache()
        +removeAllKnowledgeArticlesFromCache()
        +removeAllLightningAuraComponentsFromCache()
        +removeAllLightningPagesFromCache()
        +removeAllLightningWebComponentsFromCache()
        +removeAllObjectPermissionsFromCache()
        +removeAllObjectsFromCache()
        +removeAllPackagesFromCache()
        +removeAllPageLayoutsFromCache()
        +removeAllPermSetLicensesFromCache()
        +removeAllPermSetsFromCache()
        +removeAllProcessBuildersFromCache()
        +removeAllProfilePasswordPoliciesFromCache()
        +removeAllProfileRestrictionsFromCache()
        +removeAllProfilesFromCache()
        +removeAllPublicGroupsFromCache()
        +removeAllQueuesFromCache()
        +removeAllRecordTypesFromCache()
        +removeAllReportsFromCache()
        +removeAllRolesFromCache()
        +removeAllStaticResourcesFromCache()
        +removeAllValidationRulesFromCache()
        +removeAllVisualForceComponentsFromCache()
        +removeAllVisualForcePagesFromCache()
        +removeAllWeblinksFromCache()
        +removeAllWorkflowsFromCache()
        +removeGlobalViewFromCache()
        +removeHardcodedURLsFromCache()
        +removeObjectFromCache(sobject)
    }
    
    DatasetManager --> DatasetManagerIntf : implements
    Dataset --> DatasetManagerIntf : extends
    DataFactory --> DataFactoryIntf : implements
    DataFactoryInstance --> DataFactoryInstanceIntf : implements
    DataCacheManager --> DataCacheManagerIntf : implements
    Logger --> LoggerIntf : implements
    Logger --> BasicLoggerIntf : implements
    SalesforceManager --> SalesforceManagerIntf : implements
    DataWithDependencies --> Data : extends
    DataWithoutScoring --> Data : extends
    SFDC_ApexClass --> DataWithDependencies : extends
    SFDC_ApexTestMethodResult --> DataWithoutScoring : extends
    DatasetApexClasses --> Dataset : extends
    API --> DatasetManagerIntf : uses
    API --> DataFactoryIntf : uses
    API --> SalesforceManagerIntf : uses
    API --> LoggerIntf : uses
}
```

