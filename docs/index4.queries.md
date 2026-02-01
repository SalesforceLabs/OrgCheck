---
layout: default
title: Queries
permalink: /queries/
---

# Queries Per Dataset

This section provides a detailed breakdown of all queries performed by each dataset, 
including SOQL queries, Metadata API calls, Tooling API calls, SOSL queries, and other 
database access methods with their characteristics.

## Queries performed by the Apex Classes dataset
Source: build/src/api/dataset/orgcheck-api-dataset-apexclasses.js
### Tooling SOQL Queries
**Query on ApexClass**
```
SELECT Id, Name, ApiVersion, NamespacePrefix, Body, LengthWithoutComments, 
   SymbolTable, CreatedDate, LastModifiedDate
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
SELECT ApexClassId, MethodName, ApexTestRunResult.CreatedDate, RunTime, 
   Outcome, StackTrace, (SELECT Cpu, AsyncCalls, Sosl, Soql, QueryRows, 
   DmlRows, Dml FROM ApexTestResults LIMIT 1)
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
Below is an example of such a composite query (version and ids in `url` will vary):
```
POST /tooling/composite
[ 
   { 
      method: 'GET', 
      url: '/services/data/v60.0/tooling/query?q=SELECT+MetadataComponentId,
            +MetadataComponentName,+MetadataComponentType,+RefMetadataComponentId,
            +RefMetadataComponentName,+RefMetadataComponentType+FROM
            +MetadataComponentDependency+WHERE+RefMetadataComponentId+IN
            +('xyz000000000001','xyz000000000002',...)+OR+MetadataComponentId+IN
            +('xyz000000000001','xyz000000000002',...)' 
   }, 
   { 
      method: 'GET', 
      url: '/services/data/v60.0/tooling/query?q=SELECT+MetadataComponentId,
            +MetadataComponentName,+MetadataComponentType,+RefMetadataComponentId,
            +RefMetadataComponentName,+RefMetadataComponentType+FROM
            +MetadataComponentDependency+WHERE+RefMetadataComponentId+IN
            +('xyz000000000101','xyz000000000102',...)+OR+MetadataComponentId+IN
            +('xyz000000000101','xyz000000000102',...)' 
   }, 
   ...
]
```

## Queries performed by the Apex Triggers dataset
Source: build/src/api/dataset/orgcheck-api-dataset-apextriggers.js
### Tooling SOQL Queries
**Query on ApexTrigger**
```
SELECT Id, Name, ApiVersion, Status, NamespacePrefix, Body, UsageBeforeInsert,
   UsageAfterInsert, UsageBeforeUpdate, UsageAfterUpdate, UsageBeforeDelete, 
   UsageAfterDelete, UsageAfterUndelete, UsageIsBulk, LengthWithoutComments, 
   EntityDefinition.QualifiedApiName, CreatedDate, LastModifiedDate 
FROM ApexTrigger 
WHERE ManageableState IN ('installedEditable', 'unmanaged')
```
### Tooling Composite + Tooling SOQL
**Query on MetadataComponentDependency**
This query is run with composite using batch size=500.
Each SOQL query can max maximum 100 ids.
Below is an example of such a composite query (version and ids in `url` will vary):
```
POST /tooling/composite
[ 
   { 
      method: 'GET', 
      url: '/services/data/v60.0/tooling/query?q=SELECT+MetadataComponentId,
            +MetadataComponentName,+MetadataComponentType,+RefMetadataComponentId,
            +RefMetadataComponentName,+RefMetadataComponentType+FROM
            +MetadataComponentDependency+WHERE+RefMetadataComponentId+IN
            +('xyz000000000001','xyz000000000002',...)+OR+MetadataComponentId+IN
            +('xyz000000000001','xyz000000000002',...)' 
   }, 
   { 
      method: 'GET', 
      url: '/services/data/v60.0/tooling/query?q=SELECT+MetadataComponentId,
            +MetadataComponentName,+MetadataComponentType,+RefMetadataComponentId,
            +RefMetadataComponentName,+RefMetadataComponentType+FROM
            +MetadataComponentDependency+WHERE+RefMetadataComponentId+IN
            +('xyz000000000101','xyz000000000102',...)+OR+MetadataComponentId+IN
            +('xyz000000000101','xyz000000000102',...)' 
   }, 
   ...
]
```
## Queries performed by the Applications dataset
Source: build/src/api/dataset/orgcheck-api-dataset-applications.js
### SOQL Queries
**Query on AppMenuItem**
```
SELECT ApplicationId, Name, Label, NamespacePrefix
FROM AppMenuItem
WHERE Type = 'TabSet'
```

## Queries performed by the Application Permissions dataset
Source: build/src/api/dataset/orgcheck-api-dataset-apppermissions.js
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

## Queries performed by the Browsers dataset
Source: build/src/api/dataset/orgcheck-api-dataset-browsers.js
### SOQL Queries
**Query on LoginHistory**
```
SELECT Browser, COUNT(Id) CntBrowser
FROM LoginHistory
WHERE LoginType = 'Application'
GROUP BY Browser
```

## Queries performed by the Chatter Groups dataset
Source: build/src/api/dataset/orgcheck-api-dataset-collaborationgroups.js
### SOQL Queries
**Query on CollaborationGroup**
if Chatter is not enabled in the Org, you will get an `INVALID_TYPE` error (which is logical).
```
SELECT Id, InformationBody, Description, Name, CreatedDate, LastModifiedDate
FROM CollaborationGroup
```

## Queries performed by the Current User Permissions dataset
Source: build/src/api/dataset/orgcheck-api-dataset-currentuserpermissions.js
### SOQL Queries
**Queries on UserPermissionAccess**
We perform an SOQL by permission we are interested in (see `field`). In some case, if
 the permission is not available in the org, we assume `false`and it does not block 
 us from getting the other permissions.
```
SELECT Permissions<field> FROM UserPermissionAccess
```

## Queries performed by the Custom Fields dataset
Source: build/src/api/dataset/orgcheck-api-dataset-customfields.js
### Tooling SOQL Queries
**Query on CustomField**
```
SELECT Id, EntityDefinition.QualifiedApiName, EntityDefinition.IsCustomSetting,
   EntityDefinition.KeyPrefix 
FROM CustomField 
WHERE ManageableState IN ('installedEditable', 'unmanaged')`
```
### Tooling Composite + Tooling SOQL
**Query on MetadataComponentDependency**
This query is run with composite using batch size=500.
Each SOQL query can max maximum 100 ids.
Below is an example of such a composite query (version and ids in `url` will vary):
```
POST /tooling/composite
[ 
   { 
      method: 'GET', 
      url: '/services/data/v60.0/tooling/query?q=SELECT+MetadataComponentId,
            +MetadataComponentName,+MetadataComponentType,+RefMetadataComponentId,
            +RefMetadataComponentName,+RefMetadataComponentType+FROM
            +MetadataComponentDependency+WHERE+RefMetadataComponentId+IN
            +('xyz000000000001','xyz000000000002',...)+OR+MetadataComponentId+IN
            +('xyz000000000001','xyz000000000002',...)' 
   }, 
   { 
      method: 'GET', 
      url: '/services/data/v60.0/tooling/query?q=SELECT+MetadataComponentId,
            +MetadataComponentName,+MetadataComponentType,+RefMetadataComponentId,
            +RefMetadataComponentName,+RefMetadataComponentType+FROM
            +MetadataComponentDependency+WHERE+RefMetadataComponentId+IN
            +('xyz000000000101','xyz000000000102',...)+OR+MetadataComponentId+IN
            +('xyz000000000101','xyz000000000102',...)' 
   }, 
   ...
]
```### Tooling Composite + Tooling SObjects Record describe
**Query on CustomField**
This query is run with composite using batch size=1000.
Each Record describe is about a unique id (obviously).
Below is an example of such a composite query (version and id in `url` will vary):
```
POST /tooling/composite
[ 
    { method: 'GET', url: '/services/data/v60.0/tooling/sobjects/CustomField/xyz000000000001' }, 
    { method: 'GET', url: '/services/data/v60.0/tooling/sobjects/CustomField/xyz000000000002' }, 
    { method: 'GET', url: '/services/data/v60.0/tooling/sobjects/CustomField/xyz000000000003' }, 
    ...
]
```

## Queries performed by the Custom Labels dataset
Source: build/src/api/dataset/orgcheck-api-dataset-customlabels.js
### Tooling SOQL Queries
**Query on ExternalString**
```
SELECT Id, Name, NamespacePrefix, Category, IsProtected, Language, MasterLabel, 
   Value, CreatedDate, LastModifiedDate
FROM ExternalString
WHERE ManageableState IN ('installedEditable', 'unmanaged')
```
### Tooling Composite + Tooling SOQL
**Query on MetadataComponentDependency**
This query is executed via the Tooling composite API to retrieve dependencies of 
all custom labels returned by the initial query. The composite batches ids (up to 
500 per batch) and may split into multiple SOQL calls (up to 100 ids per call).
Below is an example of such a composite query (version and ids in `url` will vary):
```
POST /tooling/composite
[ 
   { 
      method: 'GET', 
      url: '/services/data/v60.0/tooling/query?q=SELECT+MetadataComponentId,
            +MetadataComponentName,+MetadataComponentType,+RefMetadataComponentId,
            +RefMetadataComponentName,+RefMetadataComponentType+FROM
            +MetadataComponentDependency+WHERE+RefMetadataComponentId+IN
            +('xyz000000000001','xyz000000000002',...)+OR+MetadataComponentId+IN
            +('xyz000000000001','xyz000000000002',...)' 
   }, 
   { 
      method: 'GET', 
      url: '/services/data/v60.0/tooling/query?q=SELECT+MetadataComponentId,
            +MetadataComponentName,+MetadataComponentType,+RefMetadataComponentId,
            +RefMetadataComponentName,+RefMetadataComponentType+FROM
            +MetadataComponentDependency+WHERE+RefMetadataComponentId+IN
            +('xyz000000000101','xyz000000000102',...)+OR+MetadataComponentId+IN
            +('xyz000000000101','xyz000000000102',...)' 
   }, 
   ...
]
```

## Queries performed by the Custom Tabs dataset
Source: build/src/api/dataset/orgcheck-api-dataset-customtabs.js
### Tooling SOQL Queries
**Query on CustomTab**
```
SELECT Id, DeveloperName, Type, Url, CreatedDate, Description, 
       LastModifiedDate, NamespacePrefix
FROM CustomTab
WHERE ManageableState IN ('installedEditable', 'unmanaged')
```
### Tooling Composite + Tooling SOQL
**Query on MetadataComponentDependency**
Dependencies for custom tabs are retrieved via the Tooling composite API using the 
Ids from the CustomTab query. Batches up to 500 ids, with up to 100 ids per SOQL 
call in each composite request.
Below is an example of such a composite query (version and ids in `url` will vary):
```
POST /tooling/composite
[ 
   { 
      method: 'GET', 
      url: '/services/data/v60.0/tooling/query?q=SELECT+MetadataComponentId,
            +MetadataComponentName,+MetadataComponentType,+RefMetadataComponentId,
            +RefMetadataComponentName,+RefMetadataComponentType+FROM
            +MetadataComponentDependency+WHERE+RefMetadataComponentId+IN
            +('xyz000000000001','xyz000000000002',...)+OR+MetadataComponentId+IN
            +('xyz000000000001','xyz000000000002',...)' 
   }, 
   { 
      method: 'GET', 
      url: '/services/data/v60.0/tooling/query?q=SELECT+MetadataComponentId,
            +MetadataComponentName,+MetadataComponentType,+RefMetadataComponentId,
            +RefMetadataComponentName,+RefMetadataComponentType+FROM
            +MetadataComponentDependency+WHERE+RefMetadataComponentId+IN
            +('xyz000000000101','xyz000000000102',...)+OR+MetadataComponentId+IN
            +('xyz000000000101','xyz000000000102',...)' 
   }, 
   ...
]
```

## Queries performed by the Dashboards dataset
Source: build/src/api/dataset/orgcheck-api-dataset-dashboards.js
### SOQL Queries
**Query on Dashboard**
```
SELECT Id, FolderName, FolderId, Title, DeveloperName, NamespacePrefix, 
       Description, CreatedDate, LastModifiedDate, 
       Type, LastViewedDate, LastReferencedDate, 
       DashboardResultRefreshedDate
FROM Dashboard
```

## Queries performed by the Documents dataset
Source: build/src/api/dataset/orgcheck-api-dataset-documents.js
### SOQL Queries
**Query on Document**
```
SELECT Id, Name, Url, BodyLength, ContentType, CreatedDate, Description,
   DeveloperName, Folder.Name, Folder.Id, LastModifiedDate, NamespacePrefix
FROM Document
```

## Queries performed by the Email Templates dataset
Source: build/src/api/dataset/orgcheck-api-dataset-emailtemplates.js
### SOQL Queries
**Query on EmailTemplate**
```
SELECT Id, Name, ApiVersion, IsActive, HtmlValue, Body, Markup, CreatedDate, 
       LastModifiedDate, FolderId, FolderName, Description, LastUsedDate, 
       TimesUsed, UiType, TemplateType, NamespacePrefix
FROM EmailTemplate
```

## Queries performed by the Field Permissions dataset
Source: build/src/api/dataset/orgcheck-api-dataset-fieldpermissions.js
### Tooling SOQL Queries
**Query on FieldPermissions**
```
SELECT Id, ParentId, SobjectType, Field, PermissionsEdit, PermissionsRead, 
   CreatedDate, LastModifiedDate
FROM FieldPermissions
```

## Queries performed by the Flow and Process Builder dataset
Source: build/src/api/dataset/orgcheck-api-dataset-flows.js
### Tooling SOQL Queries
- Tooling SOQL Query: `SELECT Id, DeveloperName, ApiVersion, Description, ActiveVersionId, LatestVersionId, CreatedDate, LastModifiedDate FROM FlowDefinition`
- Tooling SOQL Query: `SELECT DefinitionId, COUNT(Id) NbVersions FROM Flow GROUP BY DefinitionId`
- Metadata API Call: `readMetadataAtScale('Flow', <flowIds>, ['UNKNOWN_EXCEPTION'])`

## Queries performed by the Public Groups and Queues dataset
Source: build/src/api/dataset/orgcheck-api-dataset-publicgroupsandqueues.js
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Group`

## Queries performed by the Homepage Components dataset
Source: build/src/api/dataset/orgcheck-api-dataset-homepagecomponents.js
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Homepagecomponent` (Tooling API)

## Queries performed by the Internal Active Users dataset
Source: build/src/api/dataset/orgcheck-api-dataset-internalactiveusers.js
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM User`

## Queries performed by the Knowledge Articles dataset
Source: build/src/api/dataset/orgcheck-api-dataset-knowledgearticles.js
### Tooling SOQL Queries
- SOSL Query: `FIND { .salesforce.com OR .force.* } IN ALL FIELDS RETURNING KnowledgeArticleVersion (Id, KnowledgeArticleId, ArticleNumber, CreatedDate, LastModifiedDate, PublishStatus, Title, UrlName )`

## Queries performed by the Aura Components dataset
Source: build/src/api/dataset/orgcheck-api-dataset-lightningauracomponents.js
### Tooling SOQL Queries
- Tooling SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM AuraDefinitionBundle`

## Queries performed by the Lightning Pages dataset
Source: build/src/api/dataset/orgcheck-api-dataset-lightningpages.js
### Tooling SOQL Queries
- Tooling SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM FlexiPage`

## Queries performed by the LWCs dataset
Source: build/src/api/dataset/orgcheck-api-dataset-lightningwebcomponents.js
### Tooling SOQL Queries
- Tooling SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM LightningComponentBundle`

## Queries performed by the SObject dataset
Source: build/src/api/dataset/orgcheck-api-dataset-object.js
### Tooling SOQL Queries
- Tooling SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM EntityDefinition`
- Tooling SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM FieldDefinition`

## Queries performed by the SObject permissions dataset
Source: build/src/api/dataset/orgcheck-api-dataset-objectpermissions.js
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM ObjectPermissions`

## Queries performed by the SObjects dataset
Source: build/src/api/dataset/orgcheck-api-dataset-objects.js
### Tooling SOQL Queries
- Tooling SOQL Query: `SELECT DurableId, NamespacePrefix, DeveloperName, QualifiedApiName, ExternalSharingModel, InternalSharingModel FROM EntityDefinition WHERE KeyPrefix <> null AND DeveloperName <> null AND (NOT(KeyPrefix IN ('00a', '017', '02c', '0D5', '1CE'))) AND (NOT(QualifiedApiName like '%_hd'))`
- Tooling SOQL Query: `SELECT EntityDefinitionId, COUNT(Id) NbCustomFields FROM CustomField GROUP BY EntityDefinitionId`
- Tooling SOQL Query: `SELECT EntityDefinitionId, COUNT(Id) NbPageLayouts FROM Layout GROUP BY EntityDefinitionId`
- Tooling SOQL Query: `SELECT EntityDefinitionId, COUNT(Id) NbRecordTypes FROM RecordType GROUP BY EntityDefinitionId`
- Tooling SOQL Query: `SELECT TableEnumOrId, COUNT(Id) NbWorkflowRules FROM WorkflowRule GROUP BY TableEnumOrId`
- Tooling SOQL Query: `SELECT EntityDefinitionId, COUNT(Id) NbValidationRules FROM ValidationRule GROUP BY EntityDefinitionId`
- Tooling SOQL Query: `SELECT EntityDefinitionId, COUNT(Id) NbTriggers FROM ApexTrigger GROUP BY EntityDefinitionId`

## Queries performed by the Object Types dataset
Source: build/src/api/dataset/orgcheck-api-dataset-objecttypes.js
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM ObjectType`

## Queries performed by the Organization Information dataset
Source: build/src/api/dataset/orgcheck-api-dataset-organization.js
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Organization`

## Queries performed by the Packages dataset
Source: build/src/api/dataset/orgcheck-api-dataset-packages.js
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM InstalledSubscriberPackage`
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Organization`

## Queries performed by the Page Layouts dataset
Source: build/src/api/dataset/orgcheck-api-dataset-pagelayouts.js
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Layout` (Tooling API)
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM ProfileLayout` (Tooling API)

## Queries performed by the Permission Set Licenses dataset
Source: build/src/api/dataset/orgcheck-api-dataset-permissionsetlicenses.js
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM PermissionSetLicense`
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM PermissionSet`
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM PermissionSetAssignment`

## Queries performed by the Permission Sets dataset
Source: build/src/api/dataset/orgcheck-api-dataset-permissionsets.js
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, Description, IsCustom, License.Name, NamespacePrefix, Type, PermissionsApiEnabled, PermissionsViewSetup, PermissionsModifyAllData, PermissionsViewAllData, PermissionsManageUsers, PermissionsCustomizeApplication, CreatedDate, LastModifiedDate FROM PermissionSet WHERE IsOwnedByProfile = FALSE`
- SOQL Query: `SELECT Id, PermissionSetGroupId, PermissionSetGroup.Description FROM PermissionSet WHERE PermissionSetGroupId != null`
- SOQL Query: `SELECT ParentId, COUNT(SobjectType) CountObject FROM ObjectPermissions WHERE Parent.IsOwnedByProfile = FALSE GROUP BY ParentId`
- SOQL Query: `SELECT ParentId, COUNT(Field) CountField FROM FieldPermissions WHERE Parent.IsOwnedByProfile = FALSE GROUP BY ParentId`
- SOQL Query: `SELECT PermissionSetId, COUNT(Id) CountAssignment FROM PermissionSetAssignment WHERE PermissionSet.IsOwnedByProfile = FALSE AND Assignee.IsActive = TRUE GROUP BY PermissionSetId`
- SOQL Query: `SELECT PermissionSetGroupId, PermissionSetId FROM PermissionSetGroupComponent WHERE PermissionSet.IsOwnedByProfile = FALSE`

## Queries performed by the Profile Password Policies dataset
Source: build/src/api/dataset/orgcheck-api-dataset-profilepasswordpolicies.js
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM ProfilePasswordPolicy`

## Queries performed by the Profile Restrictions dataset
Source: build/src/api/dataset/orgcheck-api-dataset-profilerestrictions.js
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Profile`

## Queries performed by the Profiles dataset
Source: build/src/api/dataset/orgcheck-api-dataset-profiles.js
### Tooling SOQL Queries
- SOQL Query: `SELECT ProfileId, Profile.Name, Profile.Description, IsCustom, License.Name, NamespacePrefix, PermissionsApiEnabled, PermissionsViewSetup, PermissionsModifyAllData, PermissionsViewAllData, PermissionsManageUsers, PermissionsCustomizeApplication, CreatedDate, LastModifiedDate FROM PermissionSet WHERE isOwnedByProfile = TRUE ORDER BY ProfileId`
- SOQL Query: `SELECT Parent.ProfileId, COUNT(SobjectType) CountObject FROM ObjectPermissions WHERE Parent.IsOwnedByProfile = TRUE GROUP BY Parent.ProfileId`
- SOQL Query: `SELECT Parent.ProfileId, COUNT(Field) CountField FROM FieldPermissions WHERE Parent.IsOwnedByProfile = TRUE GROUP BY Parent.ProfileId`
- SOQL Query: `SELECT PermissionSet.ProfileId, COUNT(Id) CountAssignment FROM PermissionSetAssignment WHERE PermissionSet.IsOwnedByProfile = TRUE AND Assignee.IsActive = TRUE GROUP BY PermissionSet.ProfileId`

## Queries performed by the Record Types dataset
Source: build/src/api/dataset/orgcheck-api-dataset-recordtypes.js
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM RecordType`
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Profile`

## Queries performed by the Reports dataset
Source: build/src/api/dataset/orgcheck-api-dataset-reports.js
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, DeveloperName, Description, Format, FolderName, NamespacePrefix, CreatedDate, LastModifiedDate, LastRunDate, LastViewedDate, LastReferencedDate FROM Report`

## Queries performed by the Static Resources dataset
Source: build/src/api/dataset/orgcheck-api-dataset-staticresources.js
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM StaticResource`

## Queries performed by the User Roles dataset
Source: build/src/api/dataset/orgcheck-api-dataset-userroles.js
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM UserRole`

## Queries performed by the Validation Rules dataset
Source: build/src/api/dataset/orgcheck-api-dataset-validationrules.js
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Active, Description, ErrorDisplayField, ErrorMessage, ValidationName, EntityDefinition.QualifiedApiName, NamespacePrefix, CreatedDate, LastModifiedDate FROM ValidationRule`

## Queries performed by the Visualforce Components dataset
Source: build/src/api/dataset/orgcheck-api-dataset-visualforcecomponents.js
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM ApexComponent` (Tooling API)

## Queries performed by the Visualforce Pages dataset
Source: build/src/api/dataset/orgcheck-api-dataset-visualforcepages.js
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM ApexPage` (Tooling API)

## Queries performed by the Web Links dataset
Source: build/src/api/dataset/orgcheck-api-dataset-weblinks.js
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM WebLink` (Tooling API)

## Queries performed by the Workflows dataset
Source: build/src/api/dataset/orgcheck-api-dataset-workflows.js
### Tooling SOQL Queries
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM WorkflowRule` (Tooling API)
