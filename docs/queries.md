---
layout: default
title: List of queries by datasets
permalink: /queries/
---

# Queries Per Dataset

This section provides a detailed breakdown of all queries performed by each dataset, including SOQL queries, Metadata API calls, Tooling API calls, SOSL queries, and other database access methods with their characteristics.

## Queries permformed by the Apex Classes dataset
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
### Tooling Composite + Tooling SOQL
**Query on MetadataComponentDependency**
This query is run with composite using batch size=500.
Each SOQL query can max maximum 100 ids.
Below is an example of such a composite query:
```
POST /tooling/composite
[ 
    { method: 'GET', url: '/services/data/v<version>/tooling/query?q=SELECT MetadataComponentId, MetadataComponentName, MetadataComponentType, RefMetadataComponentId, RefMetadataComponentName, RefMetadataComponentType FROM MetadataComponentDependency WHERE RefMetadataComponentId IN (<subsetIds1>) OR MetadataComponentId IN (<subsetIds1>)' }, 
    { method: 'GET', url: '/services/data/v<version>/tooling/query?q=SELECT MetadataComponentId, MetadataComponentName, MetadataComponentType, RefMetadataComponentId, RefMetadataComponentName, RefMetadataComponentType FROM MetadataComponentDependency WHERE RefMetadataComponentId IN (<subsetIds2>) OR MetadataComponentId IN (<subsetIds2>)' }, 
    ...
]
```

## Queries permformed by the Apex Triggers dataset
### Tooling SOQL Queries
**Query on ApexTrigger**
```
SELECT Id, Name, ApiVersion, Status, NamespacePrefix, Body, UsageBeforeInsert, UsageAfterInsert, UsageBeforeUpdate, UsageAfterUpdate, UsageBeforeDelete, UsageAfterDelete, UsageAfterUndelete, UsageIsBulk, LengthWithoutComments, EntityDefinition.QualifiedApiName, CreatedDate, LastModifiedDate 
FROM ApexTrigger 
WHERE ManageableState IN ('installedEditable', 'unmanaged')
```
### Tooling Composite + Tooling SOQL
**Query on MetadataComponentDependency**
This query is run with composite using batch size=500.
Each SOQL query can max maximum 100 ids.
Below is an example of such a composite query:
```
POST /tooling/composite
[ 
    { method: 'GET', url: '/services/data/v<version>/tooling/query?q=SELECT MetadataComponentId, MetadataComponentName, MetadataComponentType, RefMetadataComponentId, RefMetadataComponentName, RefMetadataComponentType FROM MetadataComponentDependency WHERE RefMetadataComponentId IN (<subsetIds1>) OR MetadataComponentId IN (<subsetIds1>)' }, 
    { method: 'GET', url: '/services/data/v<version>/tooling/query?q=SELECT MetadataComponentId, MetadataComponentName, MetadataComponentType, RefMetadataComponentId, RefMetadataComponentName, RefMetadataComponentType FROM MetadataComponentDependency WHERE RefMetadataComponentId IN (<subsetIds2>) OR MetadataComponentId IN (<subsetIds2>)' }, 
    ...
]
```

## Queries permformed by the Applications dataset
### SOQL Queries
**Query on AppMenuItem**
```
SELECT ApplicationId, Name, Label, NamespacePrefix
FROM AppMenuItem
WHERE Type = 'TabSet'
```

## Queries permformed by the Application Permissions dataset
### SOQL Queries
**Query on AppMenuItem**
```
SELECT ApplicationId, IsAccessible, IsVisible
FROM AppMenuItem
WHERE Type = 'TabSet'
```
**Query on SetupEntityAccess**
```
SELECT SetupEntityId, ParentId, Parent.IsOwnedByProfile, Parent.ProfileId
FROM SetupEntityAccess
WHERE SetupEntityType = 'TabSet'
```

## Queries permformed by the Browsers dataset
### SOQL Queries
**Query on LoginHistory**
```
SELECT Browser, COUNT(Id) CntBrowser
FROM LoginHistory
WHERE LoginType = 'Application'
GROUP BY Browser
```

## Queries permformed by the Chatter Groups dataset
### SOQL Queries
**Query on CollaborationGroup**
if Chatter is not enabled in the Org, you will get an `INVALID_TYPE` error (which is logical).
```
SELECT Id, InformationBody, Description, Name, CreatedDate, LastModifiedDate
FROM CollaborationGroup
```

## Queries permformed by the Current User Permissions dataset
### SOQL Queries
**Queries on UserPermissionAccess**
We perform an SOQL by permission we are interested in (see `field`). In some case, if the permission is not available in the org, we assume `false`and it does not block us from getting the other permissions.
```
SELECT Permissions<field> FROM UserPermissionAccess
```

## Queries permformed by the Custom Fields dataset
### Tooling SOQL Queries
**Query on CustomField**
```
SELECT Id, EntityDefinition.QualifiedApiName, EntityDefinition.IsCustomSetting, EntityDefinition.KeyPrefix 
FROM CustomField 
WHERE ManageableState IN ('installedEditable', 'unmanaged')`
```
### Tooling Composite + Tooling SOQL
**Query on MetadataComponentDependency**
This query is run with composite using batch size=500.
Each SOQL query can max maximum 100 ids.
Below is an example of such a composite query:
```
POST /tooling/composite
[ 
    { method: 'GET', url: '/services/data/v<version>/tooling/query?q=SELECT MetadataComponentId, MetadataComponentName, MetadataComponentType, RefMetadataComponentId, RefMetadataComponentName, RefMetadataComponentType FROM MetadataComponentDependency WHERE RefMetadataComponentId IN (<subsetIds1>) OR MetadataComponentId IN (<subsetIds1>)' }, 
    { method: 'GET', url: '/services/data/v<version>/tooling/query?q=SELECT MetadataComponentId, MetadataComponentName, MetadataComponentType, RefMetadataComponentId, RefMetadataComponentName, RefMetadataComponentType FROM MetadataComponentDependency WHERE RefMetadataComponentId IN (<subsetIds2>) OR MetadataComponentId IN (<subsetIds2>)' }, 
    ...
]
```
### Tooling Composite + Tooling SObjects Record describe
**Query on CustomField**
This query is run with composite using batch size=1000.
Each Record describe is about a unique id (obviously).
Below is an example of such a composite query:
```
POST /tooling/composite
[ 
    { method: 'GET', url: '/services/data/v<version>/tooling/sobjects/CustomField/<id1>' }, 
    { method: 'GET', url: '/services/data/v<version>/tooling/sobjects/CustomField/<id2>' }, 
    { method: 'GET', url: '/services/data/v<version>/tooling/sobjects/CustomField/<id3>' }, 
    ...
]
```

-----



## Queries permformed by the Custom Labels dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Category, IsProtected, Language, MasterLabel, Value, CreatedDate, LastModifiedDate FROM ExternalString WHERE ManageableState IN ('installedEditable', 'unmanaged')` (Tooling API)

## Queries permformed by the Custom Tabs dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM CustomTab` (Tooling API)

## Queries permformed by the Dashboards dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, FolderName, FolderId, Title, DeveloperName, NamespacePrefix, Description, CreatedDate, LastModifiedDate, Type, LastViewedDate, LastReferencedDate, DashboardResultRefreshedDate FROM Dashboard`

## Queries permformed by the Documents dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Document`

## Queries permformed by the Email Templates dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM EmailTemplate`

## Queries permformed by the Field Permissions dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM FieldPermissions`

## Queries permformed by the Flow and Process Builder dataset
### Tooling SOQL Queries
- Tooling SOQL Query: `SELECT Id, DeveloperName, ApiVersion, Description, ActiveVersionId, LatestVersionId, CreatedDate, LastModifiedDate FROM FlowDefinition`
- Tooling SOQL Query: `SELECT DefinitionId, COUNT(Id) NbVersions FROM Flow GROUP BY DefinitionId`
- Metadata API Call: `readMetadataAtScale('Flow', <flowIds>, ['UNKNOWN_EXCEPTION'])`

## Queries permformed by the Public Groups and Queues dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Group`

## Queries permformed by the Homepage Components dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Homepagecomponent` (Tooling API)

## Queries permformed by the Internal Active Users dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM User`

## Queries permformed by the Knowledge Articles dataset
### Tooling SOQL Queries
- SOSL Query: `FIND { .salesforce.com OR .force.* } IN ALL FIELDS RETURNING KnowledgeArticleVersion (Id, KnowledgeArticleId, ArticleNumber, CreatedDate, LastModifiedDate, PublishStatus, Title, UrlName )`

## Queries permformed by the Aura Components dataset
### Tooling SOQL Queries
- Tooling SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM AuraDefinitionBundle`

## Queries permformed by the Lightning Pages dataset
### Tooling SOQL Queries
- Tooling SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM FlexiPage`

## Queries permformed by the LWCs dataset
### Tooling SOQL Queries
- Tooling SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM LightningComponentBundle`

## Queries permformed by the SObject dataset
### Tooling SOQL Queries
- Tooling SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM EntityDefinition`
- Tooling SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM FieldDefinition`

## Queries permformed by the SObject permissions dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM ObjectPermissions`

## Queries permformed by the SObjects dataset
### Tooling SOQL Queries
- Tooling SOQL Query: `SELECT DurableId, NamespacePrefix, DeveloperName, QualifiedApiName, ExternalSharingModel, InternalSharingModel FROM EntityDefinition WHERE KeyPrefix <> null AND DeveloperName <> null AND (NOT(KeyPrefix IN ('00a', '017', '02c', '0D5', '1CE'))) AND (NOT(QualifiedApiName like '%_hd'))`
- Tooling SOQL Query: `SELECT EntityDefinitionId, COUNT(Id) NbCustomFields FROM CustomField GROUP BY EntityDefinitionId`
- Tooling SOQL Query: `SELECT EntityDefinitionId, COUNT(Id) NbPageLayouts FROM Layout GROUP BY EntityDefinitionId`
- Tooling SOQL Query: `SELECT EntityDefinitionId, COUNT(Id) NbRecordTypes FROM RecordType GROUP BY EntityDefinitionId`
- Tooling SOQL Query: `SELECT TableEnumOrId, COUNT(Id) NbWorkflowRules FROM WorkflowRule GROUP BY TableEnumOrId`
- Tooling SOQL Query: `SELECT EntityDefinitionId, COUNT(Id) NbValidationRules FROM ValidationRule GROUP BY EntityDefinitionId`
- Tooling SOQL Query: `SELECT EntityDefinitionId, COUNT(Id) NbTriggers FROM ApexTrigger GROUP BY EntityDefinitionId`

## Queries permformed by the Object Types dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM ObjectType`

## Queries permformed by the Organization Information dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Organization`

## Queries permformed by the Packages dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM InstalledSubscriberPackage`
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Organization`

## Queries permformed by the Page Layouts dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Layout` (Tooling API)
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM ProfileLayout` (Tooling API)

## Queries permformed by the Permission Set Licenses dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM PermissionSetLicense`
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM PermissionSet`
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM PermissionSetAssignment`

## Queries permformed by the Permission Sets dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, Description, IsCustom, License.Name, NamespacePrefix, Type, PermissionsApiEnabled, PermissionsViewSetup, PermissionsModifyAllData, PermissionsViewAllData, PermissionsManageUsers, PermissionsCustomizeApplication, CreatedDate, LastModifiedDate FROM PermissionSet WHERE IsOwnedByProfile = FALSE`
- SOQL Query: `SELECT Id, PermissionSetGroupId, PermissionSetGroup.Description FROM PermissionSet WHERE PermissionSetGroupId != null`
- SOQL Query: `SELECT ParentId, COUNT(SobjectType) CountObject FROM ObjectPermissions WHERE Parent.IsOwnedByProfile = FALSE GROUP BY ParentId`
- SOQL Query: `SELECT ParentId, COUNT(Field) CountField FROM FieldPermissions WHERE Parent.IsOwnedByProfile = FALSE GROUP BY ParentId`
- SOQL Query: `SELECT PermissionSetId, COUNT(Id) CountAssignment FROM PermissionSetAssignment WHERE PermissionSet.IsOwnedByProfile = FALSE AND Assignee.IsActive = TRUE GROUP BY PermissionSetId`
- SOQL Query: `SELECT PermissionSetGroupId, PermissionSetId FROM PermissionSetGroupComponent WHERE PermissionSet.IsOwnedByProfile = FALSE`

## Queries permformed by the Profile Password Policies dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM ProfilePasswordPolicy`

## Queries permformed by the Profile Restrictions dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Profile`

## Queries permformed by the Profiles dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT ProfileId, Profile.Name, Profile.Description, IsCustom, License.Name, NamespacePrefix, PermissionsApiEnabled, PermissionsViewSetup, PermissionsModifyAllData, PermissionsViewAllData, PermissionsManageUsers, PermissionsCustomizeApplication, CreatedDate, LastModifiedDate FROM PermissionSet WHERE isOwnedByProfile = TRUE ORDER BY ProfileId`
- SOQL Query: `SELECT Parent.ProfileId, COUNT(SobjectType) CountObject FROM ObjectPermissions WHERE Parent.IsOwnedByProfile = TRUE GROUP BY Parent.ProfileId`
- SOQL Query: `SELECT Parent.ProfileId, COUNT(Field) CountField FROM FieldPermissions WHERE Parent.IsOwnedByProfile = TRUE GROUP BY Parent.ProfileId`
- SOQL Query: `SELECT PermissionSet.ProfileId, COUNT(Id) CountAssignment FROM PermissionSetAssignment WHERE PermissionSet.IsOwnedByProfile = TRUE AND Assignee.IsActive = TRUE GROUP BY PermissionSet.ProfileId`

## Queries permformed by the Record Types dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM RecordType`
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Profile`

## Queries permformed by the Reports dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, DeveloperName, Description, Format, FolderName, NamespacePrefix, CreatedDate, LastModifiedDate, LastRunDate, LastViewedDate, LastReferencedDate FROM Report`

## Queries permformed by the Static Resources dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM StaticResource`

## Queries permformed by the User Roles dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM UserRole`

## Queries permformed by the Validation Rules dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Active, Description, ErrorDisplayField, ErrorMessage, ValidationName, EntityDefinition.QualifiedApiName, NamespacePrefix, CreatedDate, LastModifiedDate FROM ValidationRule`

## Queries permformed by the Visualforce Components dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM ApexComponent` (Tooling API)

## Queries permformed by the Visualforce Pages dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM ApexPage` (Tooling API)

## Queries permformed by the Web Links dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM WebLink` (Tooling API)

## Queries permformed by the Workflows dataset
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM WorkflowRule` (Tooling API)
