---
layout: default
title: Diagrams
permalink: /diagrams/
---

# Diagrams

## Class Diagram

```mermaid
classDiagram
    %% Core classes
    class DatasetManagerIntf {
        <<interface>>
        +run(datasets) Promise~Map~string, any~~
        +clean(datasets)
    }
    
    class DatasetManager {
        +run(datasets) Promise~Map~string, any~~
        +clean(datasets)
    }
    
    class Dataset {
        <<abstract>>
        +run(sfdcManager, dataFactory, logger, parameters) Promise~Map~string, Data | DataWithoutScoring~~
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
        +soqlQuery(queries, logger) Promise~Array~Array~any~~
        +soslQuery(queries, logger) Promise~Array~Array~any~~
        +dependenciesQuery(ids, logger) Promise~{ records: Array~any~, errors: Array~string~ }~
        +readMetadata(metadatas, logger) Promise~Map~string, Array~any~~
        +readMetadataAtScale(type, ids, byPasses, logger) Promise~Array~any~~
        +describeGlobal(logger) Promise~Array~any~~
        +describe(sobjectDevName, logger) Promise~any~~
        +recordCount(sobjectDevName, logger) Promise~number~~
        +runAllTests(logger) Promise~string~~
        +compileClasses(apexClassIds, logger) Promise~Map~string, { isSuccess: boolean, reasons?: Array~string~ }~~
    }
    
    class SalesforceManager {
        +apiVersion() number
        +caseSafeId(id) string
        +setupUrl(id, type, parentId, parentType) string
        +getObjectType(apiName, isCustomSetting) string
        +dailyApiRequestLimitInformation() SalesforceUsageInformation
        +soqlQuery(queries, logger) Promise~Array~Array~any~~
        +soslQuery(queries, logger) Promise~Array~Array~any~~
        +dependenciesQuery(ids, logger) Promise~{ records: Array~any~, errors: Array~string~ }~
        +readMetadata(metadatas, logger) Promise~Map~string, Array~any~~
        +readMetadataAtScale(type, ids, byPasses, logger) Promise~Array~any~~
        +describeGlobal(logger) Promise~Array~any~~
        +describe(sobjectDevName, logger) Promise~any~~
        +recordCount(sobjectDevName, logger) Promise~number~~
        +runAllTests(logger) Promise~string~~
        +compileClasses(apexClassIds, logger) Promise~Map~string, { isSuccess: boolean, reasons?: Array~string~ }~~
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
    
    %% Data classes
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
    
    %% Dataset classes
    class DatasetApexClasses {
        +run(sfdcManager, dataFactory, logger) Promise~Map~string, SFDC_ApexClass~~
    }
    
    %% API class
    class API {
        +version string
        +salesforceApiVersion number
        +removeAllFromCache()
        +getCacheInformation() Array~DataCacheItem~
        +getCacheData(itemName) any
        +getAllScoreRulesAsDataMatrix() DataMatrix
        +dailyApiRequestLimitInformation() SalesforceUsageInformation
        +runAllTestsAsync() Promise~string~
        +compileClasses(apexClassIds) Promise~Map~string, { isSuccess: boolean, reasons?: Array~string~ }~~
        +getOrganizationInformation() Promise~SFDC_Organization~
        +checkUsageTerms() Promise~boolean~
        +wereUsageTermsAcceptedManually() boolean
        +acceptUsageTermsManually()
        +checkCurrentUserPermissions() Promise~boolean~
        +getPackages() Promise~Array~SFDC_Package~~
        +removeAllPackagesFromCache()
        +getPageLayouts(namespace, sobjectType, sobject) Promise~Array~SFDC_PageLayout~~
        +removeAllPageLayoutsFromCache()
        +getObjectTypes() Promise~Array~SFDC_ObjectType~~
        +getObjects(namespace, sobjectType) Promise~Array~SFDC_Object~~
        +removeAllObjectsFromCache()
        +getObject(sobject) Promise~SFDC_Object~
        +removeObjectFromCache(sobject)
        +getObjectPermissionsPerParent(namespace) Promise~DataMatrix~
        +removeAllObjectPermissionsFromCache()
        +getApplicationPermissionsPerParent(namespace) Promise~DataMatrix~
        +removeAllAppPermissionsFromCache()
        +getKnowledgeArticles() Promise~Array~SFDC_KnowledgeArticle~~
        +removeAllKnowledgeArticlesFromCache()
        +getChatterGroups() Promise~Array~SFDC_CollaborationGroup~~
        +removeAllChatterGroupsFromCache()
        +getCustomFields(namespace, sobjectType, sobject) Promise~Array~SFDC_Field~~
        +removeAllCustomFieldsFromCache()
        +getPermissionSets(namespace) Promise~Array~SFDC_PermissionSet~~
        +removeAllPermSetsFromCache()
        +getPermissionSetLicenses() Promise~Array~SFDC_PermissionSetLicense~~
        +removeAllPermSetLicensesFromCache()
        +getProfiles(namespace) Promise~Array~SFDC_Profile~~
        +removeAllProfilesFromCache()
        +getProfileRestrictions(namespace) Promise~Array~SFDC_ProfileRestrictions~~
        +removeAllProfileRestrictionsFromCache()
        +getProfilePasswordPolicies() Promise~Array~SFDC_ProfilePasswordPolicy~~
        +removeAllProfilePasswordPoliciesFromCache()
        +getActiveUsers() Promise~Array~SFDC_User~~
        +removeAllActiveUsersFromCache()
        +getBrowsers() Promise~Array~SFDC_Browser~~
        +removeAllBrowsersFromCache()
        +getCustomLabels(namespace) Promise~Array~SFDC_CustomLabel~~
        +removeAllCustomLabelsFromCache()
        +getCustomTabs(namespace) Promise~Array~SFDC_CustomLabel~~
        +removeAllCustomTabsFromCache()
        +getDocuments(namespace) Promise~Array~SFDC_Document~~
        +removeAllDocumentsFromCache()
        +getLightningWebComponents(namespace) Promise~Array~SFDC_LightningWebComponent~~
        +removeAllLightningWebComponentsFromCache()
        +getLightningAuraComponents(namespace) Promise~Array~SFDC_LightningAuraComponent~~
        +removeAllLightningAuraComponentsFromCache()
        +getLightningPages(namespace) Promise~Array~SFDC_LightningPage~~
        +removeAllLightningPagesFromCache()
        +getVisualForceComponents(namespace) Promise~Array~SFDC_VisualForceComponent~~
        +removeAllVisualForceComponentsFromCache()
        +getVisualForcePages(namespace) Promise~Array~SFDC_VisualForcePage~~
        +removeAllVisualForcePagesFromCache()
        +getPublicGroups() Promise~Array~SFDC_Group~~
        +removeAllPublicGroupsFromCache()
        +getQueues() Promise~Array~SFDC_Group~~
        +removeAllQueuesFromCache()
        +getApexClasses(namespace) Promise~Array~SFDC_ApexClass~~
        +removeAllApexClassesFromCache()
        +getApexTests(namespace) Promise~Array~SFDC_ApexClass~~
        +removeAllApexTestsFromCache()
        +getApexUncompiled(namespace) Promise~Array~SFDC_ApexClass~~
        +removeAllApexUncompiledFromCache()
        +getApexTriggers(namespace) Promise~Array~SFDC_ApexTrigger~~
        +removeAllApexTriggersFromCache()
        +getRoles() Promise~Array~SFDC_UserRole~~
        +removeAllRolesFromCache()
        +getRolesTree() Promise~SFDC_UserRole~
        +getStaticResources(namespace) Promise~Array~SFDC_StaticResource~~
        +removeAllStaticResourcesFromCache()
        +getWeblinks(namespace, sobjectType, sobject) Promise~Array~SFDC_WebLink~~
        +removeAllWeblinksFromCache()
        +getWorkflows() Promise~Array~SFDC_Workflow~~
        +removeAllWorkflowsFromCache()
        +getRecordTypes(namespace, sobjectType, sobject) Promise~Array~SFDC_RecordType~~
        +removeAllRecordTypesFromCache()
        +getFieldPermissionsPerParent(sobject, namespace) Promise~DataMatrix~
        +removeAllFieldPermissionsFromCache()
        +getFlows() Promise~Array~SFDC_Flow~~
        +removeAllFlowsFromCache()
        +getEmailTemplates(namespace) Promise~Array~SFDC_EmailTemplate~~
        +removeAllEmailTemplatesFromCache()
        +getHomePageComponents() Promise~Array~SFDC_HomePageComponent~~
        +removeAllHomePageComponentsFromCache()
        +getProcessBuilders() Promise~Array~SFDC_Flow~~
        +removeAllProcessBuildersFromCache()
        +getValidationRules(namespace, sobjectType, sobject) Promise~Array~SFDC_ValidationRule~~
        +removeAllValidationRulesFromCache()
        +getDashboards() Promise~Array~SFDC_Dashboard~~
        +removeAllDashboardsFromCache()
        +getReports() Promise~Array~SFDC_Report~~
        +removeAllReportsFromCache()
        +getGlobalView() Promise~Map~string, DataCollectionStatistics~~
        +removeGlobalViewFromCache()
        +getHardcodedURLsView() Promise~Map~string, DataCollectionStatistics~~
        +removeHardcodedURLsFromCache()
    }
    
    %% Relationships
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
