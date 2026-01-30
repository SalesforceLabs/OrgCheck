---
layout: default
title: List of queries by datasets
permalink: /queries/
---

# Queries Per Dataset

This section provides a detailed breakdown of all queries performed by each dataset, including SOQL queries, Metadata API calls, Tooling API calls, SOSL queries, and other database access methods with their characteristics.

## Apex Classes
### Tooling SOQL Queries
**Query on ApexClass**
```
SELECT Id, Name, ApiVersion, NamespacePrefix, Body, LengthWithoutComments, SymbolTable, CreatedDate, LastModifiedDate
FROM ApexClass
WHERE ManageableState IN ('installedEditable', 'unmanaged') 
ORDER BY Id
```
**Query on AsyncApexJob**
```
SELECT ApexClassId
FROM AsyncApexJob
WHERE JobType = 'ScheduledApex'
AND ApexClass.ManageableState IN ('installedEditable', 'unmanaged')
```
**Query on ApexTestResult**
```
SELECT ApexClassId, MethodName, ApexTestRunResult.CreatedDate, RunTime, Outcome, StackTrace, (SELECT Cpu, AsyncCalls, Sosl, Soql, QueryRows, DmlRows, Dml FROM ApexTestResults LIMIT 1)
FROM ApexTestResult
WHERE (Outcome != 'Pass' OR RunTime > 20000)
AND ApexTestRunResult.Status = 'Completed'
AND ApexClass.ManageableState IN ('installedEditable', 'unmanaged')
ORDER BY ApexClassId, ApexTestRunResult.CreatedDate desc, MethodName
```
**Query on ApexCodeCoverage**
This query is run in batches with 500 apex class ids max (see `subsetIds`).
```
SELECT ApexClassOrTriggerId, ApexTestClassId 
FROM ApexCodeCoverage 
WHERE ApexClassOrTriggerId IN (<subsetIds>)
AND ApexTestClass.ManageableState IN ('installedEditable', 'unmanaged')
GROUP BY ApexClassOrTriggerId, ApexTestClassId 
```
**Query on ApexCodeCoverageAggregate**
This query is run in batches with 500 apex class ids max (see `subsetIds`).
```
SELECT ApexClassOrTriggerId, NumLinesCovered, NumLinesUncovered, Coverage
FROM ApexCodeCoverageAggregate 
WHERE ApexClassOrTriggerId IN (<subsetIds>)
```
**Query on MetadataComponentDependency**
This query is run in batches with 100 apex class ids max (see `subsetIds`).
```
SELECT MetadataComponentId, MetadataComponentName, MetadataComponentType, RefMetadataComponentId, RefMetadataComponentName, RefMetadataComponentType
FROM MetadataComponentDependency
WHERE RefMetadataComponentId IN (<subsetIds>)
OR MetadataComponentId IN (<subsetIds>)
```

## Apex Triggers
### Tooling SOQL Queries
**Query on ApexTrigger**
```
SELECT Id, Name, ApiVersion, Status, NamespacePrefix, Body, UsageBeforeInsert, UsageAfterInsert, UsageBeforeUpdate, UsageAfterUpdate, UsageBeforeDelete, UsageAfterDelete, UsageAfterUndelete, UsageIsBulk, LengthWithoutComments, EntityDefinition.QualifiedApiName, CreatedDate, LastModifiedDate 
FROM ApexTrigger 
WHERE ManageableState IN ('installedEditable', 'unmanaged')
```
**Query on MetadataComponentDependency**
This query is run in batches with 100 apex trigger ids max (see `subsetIds`).
```
SELECT MetadataComponentId, MetadataComponentName, MetadataComponentType, RefMetadataComponentId, RefMetadataComponentName, RefMetadataComponentType
FROM MetadataComponentDependency
WHERE RefMetadataComponentId IN (<subsetIds>)
OR MetadataComponentId IN (<subsetIds>)
```


--- 


### Applications
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM AppMenuItem`

### Application Permissions
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM AppMenuItem`
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM SetupEntityAccess`

### Browsers
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Browser`

### Chatter Groups
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM CollaborationGroup`

### Current User Permissions
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM UserPermissionAccess`

### Custom Fields
- Tooling SOQL Query: `SELECT Id, EntityDefinition.QualifiedApiName, EntityDefinition.IsCustomSetting, EntityDefinition.KeyPrefix FROM CustomField WHERE ManageableState IN ('installedEditable', 'unmanaged')`
- Metadata API Call: `readMetadataAtScale('CustomField', <customFieldIds>, ['INVALID_CROSS_REFERENCE_KEY'])`

### Custom Labels
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Category, IsProtected, Language, MasterLabel, Value, CreatedDate, LastModifiedDate FROM ExternalString WHERE ManageableState IN ('installedEditable', 'unmanaged')` (Tooling API)

### Custom Tabs
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM CustomTab` (Tooling API)

### Dashboards
- SOQL Query: `SELECT Id, FolderName, FolderId, Title, DeveloperName, NamespacePrefix, Description, CreatedDate, LastModifiedDate, Type, LastViewedDate, LastReferencedDate, DashboardResultRefreshedDate FROM Dashboard`

### Documents
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Document`

### Email Templates
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM EmailTemplate`

### Field Permissions
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM FieldPermissions`

### Flow and Process Builder
- Tooling SOQL Query: `SELECT Id, DeveloperName, ApiVersion, Description, ActiveVersionId, LatestVersionId, CreatedDate, LastModifiedDate FROM FlowDefinition`
- Tooling SOQL Query: `SELECT DefinitionId, COUNT(Id) NbVersions FROM Flow GROUP BY DefinitionId`
- Metadata API Call: `readMetadataAtScale('Flow', <flowIds>, ['UNKNOWN_EXCEPTION'])`

### Public Groups and Queues
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Group`

### Homepage Components
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Homepagecomponent` (Tooling API)

### Internal Active Users
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM User`

### Knowledge Articles
- SOSL Query: `FIND { .salesforce.com OR .force.* } IN ALL FIELDS RETURNING KnowledgeArticleVersion (Id, KnowledgeArticleId, ArticleNumber, CreatedDate, LastModifiedDate, PublishStatus, Title, UrlName )`

### Aura Components
- Tooling SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM AuraDefinitionBundle`

### Lightning Pages
- Tooling SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM FlexiPage`

### LWCs
- Tooling SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM LightningComponentBundle`

### SObject
- Tooling SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM EntityDefinition`
- Tooling SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM FieldDefinition`

### SObject permissions
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM ObjectPermissions`

### SObjects
- Tooling SOQL Query: `SELECT DurableId, NamespacePrefix, DeveloperName, QualifiedApiName, ExternalSharingModel, InternalSharingModel FROM EntityDefinition WHERE KeyPrefix <> null AND DeveloperName <> null AND (NOT(KeyPrefix IN ('00a', '017', '02c', '0D5', '1CE'))) AND (NOT(QualifiedApiName like '%_hd'))`
- Tooling SOQL Query: `SELECT EntityDefinitionId, COUNT(Id) NbCustomFields FROM CustomField GROUP BY EntityDefinitionId`
- Tooling SOQL Query: `SELECT EntityDefinitionId, COUNT(Id) NbPageLayouts FROM Layout GROUP BY EntityDefinitionId`
- Tooling SOQL Query: `SELECT EntityDefinitionId, COUNT(Id) NbRecordTypes FROM RecordType GROUP BY EntityDefinitionId`
- Tooling SOQL Query: `SELECT TableEnumOrId, COUNT(Id) NbWorkflowRules FROM WorkflowRule GROUP BY TableEnumOrId`
- Tooling SOQL Query: `SELECT EntityDefinitionId, COUNT(Id) NbValidationRules FROM ValidationRule GROUP BY EntityDefinitionId`
- Tooling SOQL Query: `SELECT EntityDefinitionId, COUNT(Id) NbTriggers FROM ApexTrigger GROUP BY EntityDefinitionId`

### Object Types
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM ObjectType`

### Organization Information
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Organization`

### Packages
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM InstalledSubscriberPackage`
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Organization`

### Page Layouts
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Layout` (Tooling API)
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM ProfileLayout` (Tooling API)

### Permission Set Licenses
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM PermissionSetLicense`
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM PermissionSet`
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM PermissionSetAssignment`

### Permission Sets
- SOQL Query: `SELECT Id, Name, Description, IsCustom, License.Name, NamespacePrefix, Type, PermissionsApiEnabled, PermissionsViewSetup, PermissionsModifyAllData, PermissionsViewAllData, PermissionsManageUsers, PermissionsCustomizeApplication, CreatedDate, LastModifiedDate FROM PermissionSet WHERE IsOwnedByProfile = FALSE`
- SOQL Query: `SELECT Id, PermissionSetGroupId, PermissionSetGroup.Description FROM PermissionSet WHERE PermissionSetGroupId != null`
- SOQL Query: `SELECT ParentId, COUNT(SobjectType) CountObject FROM ObjectPermissions WHERE Parent.IsOwnedByProfile = FALSE GROUP BY ParentId`
- SOQL Query: `SELECT ParentId, COUNT(Field) CountField FROM FieldPermissions WHERE Parent.IsOwnedByProfile = FALSE GROUP BY ParentId`
- SOQL Query: `SELECT PermissionSetId, COUNT(Id) CountAssignment FROM PermissionSetAssignment WHERE PermissionSet.IsOwnedByProfile = FALSE AND Assignee.IsActive = TRUE GROUP BY PermissionSetId`
- SOQL Query: `SELECT PermissionSetGroupId, PermissionSetId FROM PermissionSetGroupComponent WHERE PermissionSet.IsOwnedByProfile = FALSE`

### Profile Password Policies
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM ProfilePasswordPolicy`

### Profile Restrictions
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Profile`

### Profiles
- SOQL Query: `SELECT ProfileId, Profile.Name, Profile.Description, IsCustom, License.Name, NamespacePrefix, PermissionsApiEnabled, PermissionsViewSetup, PermissionsModifyAllData, PermissionsViewAllData, PermissionsManageUsers, PermissionsCustomizeApplication, CreatedDate, LastModifiedDate FROM PermissionSet WHERE isOwnedByProfile = TRUE ORDER BY ProfileId`
- SOQL Query: `SELECT Parent.ProfileId, COUNT(SobjectType) CountObject FROM ObjectPermissions WHERE Parent.IsOwnedByProfile = TRUE GROUP BY Parent.ProfileId`
- SOQL Query: `SELECT Parent.ProfileId, COUNT(Field) CountField FROM FieldPermissions WHERE Parent.IsOwnedByProfile = TRUE GROUP BY Parent.ProfileId`
- SOQL Query: `SELECT PermissionSet.ProfileId, COUNT(Id) CountAssignment FROM PermissionSetAssignment WHERE PermissionSet.IsOwnedByProfile = TRUE AND Assignee.IsActive = TRUE GROUP BY PermissionSet.ProfileId`

### Record Types
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM RecordType`
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Profile`

### Reports
- SOQL Query: `SELECT Id, Name, DeveloperName, Description, Format, FolderName, NamespacePrefix, CreatedDate, LastModifiedDate, LastRunDate, LastViewedDate, LastReferencedDate FROM Report`

### Static Resources
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM StaticResource`

### User Roles
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM UserRole`

### Validation Rules
- SOQL Query: `SELECT Id, Active, Description, ErrorDisplayField, ErrorMessage, ValidationName, EntityDefinition.QualifiedApiName, NamespacePrefix, CreatedDate, LastModifiedDate FROM ValidationRule`

### Visualforce Components
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM ApexComponent` (Tooling API)

### Visualforce Pages
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM ApexPage` (Tooling API)

### Web Links
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM WebLink` (Tooling API)

### Workflows
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM WorkflowRule` (Tooling API)
