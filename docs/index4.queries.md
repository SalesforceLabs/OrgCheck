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
```
### Tooling Composite + Tooling SObjects Record describe
Note: This type of access is performed by the method we call `readMetadataAtScale()`. 
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
**Query on FlowDefinition**
```
SELECT Id, DeveloperName, ApiVersion, Description, ActiveVersionId, 
   LatestVersionId, CreatedDate, LastModifiedDate 
FROM FlowDefinition
```
**Query on Flow**
```
SELECT DefinitionId, COUNT(Id) NbVersions FROM Flow GROUP BY DefinitionId
```
### Tooling Composite + Tooling SObjects Record describe
Note: This type of access is performed by the method we call `readMetadataAtScale()`. 
**Query on Flow**
This query is run with composite using batch size=1000.
Each Record describe is about a unique id (obviously).
Below is an example of such a composite query (version and id in `url` will vary):
```
POST /tooling/composite
[ 
    { method: 'GET', url: '/services/data/v60.0/tooling/sobjects/Flow/xyz000000000001' }, 
    { method: 'GET', url: '/services/data/v60.0/tooling/sobjects/Flow/xyz000000000002' }, 
    { method: 'GET', url: '/services/data/v60.0/tooling/sobjects/Flow/xyz000000000003' }, 
    ...
]
```

## Queries performed by the Public Groups and Queues dataset
Source: build/src/api/dataset/orgcheck-api-dataset-groups.js
### SOQL Queries
**Query on Group**
```
SELECT Id, Name, DeveloperName, DoesIncludeBosses, Type, RelatedId, 
   Related.Name, (SELECT UserOrGroupId From GroupMembers) 
FROM Group
```

## Queries performed by the Homepage Components dataset
Source: build/src/api/dataset/orgcheck-api-dataset-homepagecomponents.js
### Tooling SOQL Queries
**Query on Homepagecomponent**
```
SELECT Id, Name, Body, CreatedDate, LastModifiedDate, NamespacePrefix 
FROM Homepagecomponent 
WHERE ManageableState IN ('installedEditable', 'unmanaged')
```

## Queries performed by the Internal Active Users dataset
Source: build/src/api/dataset/orgcheck-api-dataset-internalactiveusers.js
### SOQL Queries
**Query on User**
```
SELECT Id, Name, ProfileId, LastLoginDate, LastPasswordChangeDate, 
   NumberOfFailedLogins, UserPreferencesLightningExperiencePreferred, 
   UserPreferencesUserDebugModePref 
FROM User 
WHERE IsActive = true 
AND ContactId = NULL 
AND Profile.Id != NULL
```
**Query on PermissionSetAssignment**
```
SELECT Id, AssigneeId, PermissionSetId, PermissionSet.IsOwnedByProfile, 
   PermissionSet.PermissionsModifyAllData, PermissionSet.PermissionsViewAllData, 
   PermissionSet.PermissionsManageUsers, PermissionSet.PermissionsCustomizeApplication, 
   PermissionSet.PermissionsBypassMFAForUiLogins 
FROM PermissionSetAssignment 
WHERE Assignee.IsActive = true 
AND Assignee.ContactId = NULL 
AND Assignee.Profile.Id != NULL
```
**Query on LoginHistory**
```
SELECT UserId, LoginType, AuthMethodReference, Status, COUNT(Id) CntLogin 
FROM LoginHistory 
WHERE (LoginType = 'Application' 
OR LoginType LIKE '%SSO%') 
GROUP BY UserId, LoginType, AuthMethodReference, Status
```

## Queries performed by the Knowledge Articles dataset
Source: build/src/api/dataset/orgcheck-api-dataset-knowledgearticles.js
### SOSL Queries
**Query on KnowledgeArticleVersion**
```
FIND { .salesforce.com OR .force.* } IN ALL FIELDS 
RETURNING KnowledgeArticleVersion (Id, KnowledgeArticleId, ArticleNumber, 
   CreatedDate, LastModifiedDate, PublishStatus, Title, UrlName )
```

## Queries performed by the Aura Components dataset
Source: build/src/api/dataset/orgcheck-api-dataset-lighntingauracomponents.js
### Tooling SOQL Queries
**Query on AuraDefinitionBundle**
```
SELECT Id, MasterLabel, ApiVersion, NamespacePrefix, Description, 
   CreatedDate, LastModifiedDate 
FROM AuraDefinitionBundle 
WHERE ManageableState IN ('installedEditable', 'unmanaged')
```

## Queries performed by the Lightning Pages dataset
Source: build/src/api/dataset/orgcheck-api-dataset-lighntingpages.js
### Tooling SOQL Queries
**Query on FlexiPage**
```
SELECT Id, MasterLabel, EntityDefinition.QualifiedApiName, Type, 
   NamespacePrefix, Description, CreatedDate, LastModifiedDate 
FROM FlexiPage 
WHERE ManageableState IN ('installedEditable', 'unmanaged')
```

## Queries performed by the Lightning Web Components dataset
Source: build/src/api/dataset/orgcheck-api-dataset-lighntingwebcomponents.js
### Tooling SOQL Queries
**Query on LightningComponentBundle**
```
SELECT Id, MasterLabel, ApiVersion, NamespacePrefix, Description, 
   CreatedDate, LastModifiedDate 
FROM LightningComponentBundle 
WHERE ManageableState IN ('installedEditable', 'unmanaged')
```

## Queries performed by the SObject dataset
Source: build/src/api/dataset/orgcheck-api-dataset-object.js
### Tooling SOQL Queries
**Query on EntityDefinition**
```
SELECT Id, DurableId, DeveloperName, Description, NamespacePrefix, 
   ExternalSharingModel, InternalSharingModel, 
   (SELECT Id FROM ApexTriggers), 
   (SELECT Id, MasterLabel, Description FROM FieldSets), 
   (SELECT Id, Name, LayoutType FROM Layouts), 
   (SELECT DurableId, Label, Max, Remaining, Type FROM Limits), 
   (SELECT Id, Active, Description, ErrorDisplayField, ErrorMessage,
      ValidationName, NamespacePrefix, CreatedDate, LastModifiedDate 
      FROM ValidationRules), 
   (SELECT Id, Name, Url, LinkType, OpenType, Description, 
      CreatedDate, LastModifiedDate, NamespacePrefix 
      FROM WebLinks) 
FROM EntityDefinition 
WHERE QualifiedApiName = '<object_api_name>' 
LIMIT 1
```
**Query on FieldDefinition**
```
SELECT DurableId, QualifiedApiName, Description, IsIndexed 
FROM FieldDefinition 
WHERE EntityDefinition.QualifiedApiName = '<object_api_name>'
```

## Queries performed by the SObject permissions dataset
Source: build/src/api/dataset/orgcheck-api-dataset-objectpermissions.js
### SOQL Queries
**Query on ObjectPermissions**
```
SELECT ParentId, Parent.IsOwnedByProfile, Parent.ProfileId, 
   SobjectType, CreatedDate, LastModifiedDate,PermissionsRead, 
   PermissionsCreate, PermissionsEdit, PermissionsDelete, 
   PermissionsViewAllRecords, PermissionsModifyAllRecords 
FROM ObjectPermissions
```

## Queries performed by the SObjects dataset (still under construction)
Source: build/src/api/dataset/orgcheck-api-dataset-objects.js
### Tooling SOQL Queries
- Tooling SOQL Query: `SELECT DurableId, NamespacePrefix, DeveloperName, QualifiedApiName, ExternalSharingModel, InternalSharingModel FROM EntityDefinition WHERE KeyPrefix <> null AND DeveloperName <> null AND (NOT(KeyPrefix IN ('00a', '017', '02c', '0D5', '1CE'))) AND (NOT(QualifiedApiName like '%_hd'))`
- Tooling SOQL Query: `SELECT EntityDefinitionId, COUNT(Id) NbCustomFields FROM CustomField GROUP BY EntityDefinitionId`
- Tooling SOQL Query: `SELECT EntityDefinitionId, COUNT(Id) NbPageLayouts FROM Layout GROUP BY EntityDefinitionId`
- Tooling SOQL Query: `SELECT EntityDefinitionId, COUNT(Id) NbRecordTypes FROM RecordType GROUP BY EntityDefinitionId`
- Tooling SOQL Query: `SELECT TableEnumOrId, COUNT(Id) NbWorkflowRules FROM WorkflowRule GROUP BY TableEnumOrId`
- Tooling SOQL Query: `SELECT EntityDefinitionId, COUNT(Id) NbValidationRules FROM ValidationRule GROUP BY EntityDefinitionId`
- Tooling SOQL Query: `SELECT EntityDefinitionId, COUNT(Id) NbTriggers FROM ApexTrigger GROUP BY EntityDefinitionId`

## Queries performed by the Object Types dataset (still under construction)
Source: build/src/api/dataset/orgcheck-api-dataset-objecttypes.js
### In-memory Data
This dataset does not perform any database query. It returns predefined object types in memory.

## Queries performed by the Organization Information dataset
Source: build/src/api/dataset/orgcheck-api-dataset-organization.js
### SOQL Queries
**Query on Organization**
```
SELECT Id, Name, IsSandbox, OrganizationType, TrialExpirationDate, NamespacePrefix 
FROM Organization 
LIMIT 1
```

## ## Queries performed by the Packages dataset
Source: build/src/api/dataset/orgcheck-api-dataset-packages.js
### Tooling SOQL Queries
**Query on InstalledSubscriberPackage**
```
SELECT Id, SubscriberPackage.NamespacePrefix, SubscriberPackage.Name 
FROM InstalledSubscriberPackage 
```
**Query on Organization**
```
SELECT NamespacePrefix FROM Organization LIMIT 1
```

## ## Queries performed by the Page Layouts dataset
Source: build/src/api/dataset/orgcheck-api-dataset-pagelayouts.js
### Tooling SOQL Queries
**Query on Layout**
```
SELECT Id, Name, NamespacePrefix, LayoutType, EntityDefinition.DurableId, 
   EntityDefinition.QualifiedApiName, CreatedDate, LastModifiedDate 
FROM Layout 
```
**Query on ProfileLayout**
```
SELECT LayoutId, COUNT(ProfileId) CountAssignment 
FROM ProfileLayout 
WHERE Profile.Name != null 
GROUP BY LayoutId 
```

## ## Queries performed by the Permission Set Licenses dataset
Source: build/src/api/dataset/orgcheck-api-dataset-permissionsetlicenses.js
### SOQL Queries
**Query on PermissionSetLicense**
```
SELECT Id, MasterLabel, CreatedDate, LastModifiedDate, TotalLicenses, Status, 
   ExpirationDate, UsedLicenses, IsAvailableForIntegrations 
FROM PermissionSetLicense 
```
**Query on PermissionSet**
```
SELECT Id, LicenseId 
FROM PermissionSet 
WHERE IsOwnedByProfile = false 
AND LicenseId <> NULL 
```
**Query on PermissionSetAssignment**
```
SELECT AssigneeId, PermissionSet.LicenseId 
FROM PermissionSetAssignment 
WHERE Assignee.IsActive = TRUE 
AND PermissionSet.LicenseId <> NULL 
AND PermissionSet.IsOwnedByProfile = FALSE 
ORDER BY PermissionSetId 
```

## Queries performed by the Permission Sets dataset
Source: build/src/api/dataset/orgcheck-api-dataset-permissionsets.js
### SOQL Queries
**Query on PermissionSet**
```
SELECT Id, Name, Description, IsCustom, License.Name, NamespacePrefix, Type, 
   PermissionsApiEnabled, PermissionsViewSetup, PermissionsModifyAllData, 
   PermissionsViewAllData, PermissionsManageUsers, PermissionsCustomizeApplication, 
   CreatedDate, LastModifiedDate 
FROM PermissionSet 
WHERE IsOwnedByProfile = FALSE 
ORDER BY Id
```
**Query on PermissionSet**
```
SELECT Id, PermissionSetGroupId, PermissionSetGroup.Description 
FROM PermissionSet 
WHERE PermissionSetGroupId != null 
ORDER BY Id
```
**Query on ObjectPermissions**
```
SELECT ParentId, COUNT(SobjectType) CountObject 
FROM ObjectPermissions 
WHERE Parent.IsOwnedByProfile = FALSE 
GROUP BY ParentId 
```
**Query on FieldPermissions**
```
SELECT ParentId, COUNT(Field) CountField 
FROM FieldPermissions 
WHERE Parent.IsOwnedByProfile = FALSE 
GROUP BY ParentId 
```
**Query on PermissionSetAssignment**
```
SELECT PermissionSetId, COUNT(Id) CountAssignment 
FROM PermissionSetAssignment 
WHERE PermissionSet.IsOwnedByProfile = FALSE 
AND Assignee.IsActive = TRUE 
GROUP BY PermissionSetId 
```
**Query on PermissionSetGroupComponent**
```
SELECT PermissionSetGroupId, PermissionSetId 
FROM PermissionSetGroupComponent 
WHERE PermissionSet.IsOwnedByProfile = FALSE 
ORDER BY PermissionSetGroupId 
```

## Queries performed by the Profile Password Policies dataset
Source: build/src/api/dataset/orgcheck-api-dataset-profilepasswordpolicies.js
### Metadata API Calls
**Query on ProfilePasswordPolicy**
This dataset uses the Metadata API to retrieve ProfilePasswordPolicy metadata.
```
readMetadata({
    type: 'ProfilePasswordPolicy',
    members: [ '*' ]
})
```
## Queries performed by the Profile Restrictions dataset
Source: build/src/api/dataset/orgcheck-api-dataset-profilerestrictions.js
### SOQL Queries
**Query on Profile**
```
SELECT Id FROM Profile
```
### Tooling Composite + Tooling SObjects Record describe
Note: This type of access is performed by the method we call `readMetadataAtScale()`. 
**Query on Profile**
This query is run with composite using batch size=1000.
Each Record describe is about a unique id (obviously).
Below is an example of such a composite query (version and id in `url` will vary):
```
POST /tooling/composite
[ 
    { method: 'GET', url: '/services/data/v60.0/tooling/sobjects/Profile/xyz000000000001' }, 
    { method: 'GET', url: '/services/data/v60.0/tooling/sobjects/Profile/xyz000000000002' }, 
    { method: 'GET', url: '/services/data/v60.0/tooling/sobjects/Profile/xyz000000000003' }, 
    ...
]
```

## Queries performed by the Profiles dataset
Source: build/src/api/dataset/orgcheck-api-dataset-profiles.js
### SOQL Queries
**Query on PermissionSet**
```
SELECT ProfileId, Profile.Name, Profile.Description, IsCustom, License.Name, NamespacePrefix, 
   PermissionsApiEnabled, PermissionsViewSetup, PermissionsModifyAllData, PermissionsViewAllData, 
   PermissionsManageUsers, PermissionsCustomizeApplication, 
   CreatedDate, LastModifiedDate 
FROM PermissionSet 
WHERE isOwnedByProfile = TRUE 
ORDER BY ProfileId
```
**Query on ObjectPermissions**
```
SELECT Parent.ProfileId, COUNT(SobjectType) CountObject 
FROM ObjectPermissions 
WHERE Parent.IsOwnedByProfile = TRUE 
GROUP BY Parent.ProfileId 
```
**Query on FieldPermissions**
```
SELECT Parent.ProfileId, COUNT(Field) CountField 
FROM FieldPermissions 
WHERE Parent.IsOwnedByProfile = TRUE 
GROUP BY Parent.ProfileId 
```
**Query on PermissionSetAssignment**
```
SELECT PermissionSet.ProfileId, COUNT(Id) CountAssignment 
FROM PermissionSetAssignment 
WHERE PermissionSet.IsOwnedByProfile = TRUE 
AND Assignee.IsActive = TRUE 
GROUP BY PermissionSet.ProfileId 
```
## Queries performed by the Record Types dataset
Source: build/src/api/dataset/orgcheck-api-dataset-recordtypes.js
### SOQL Queries
**Query on RecordType**
```
SELECT DeveloperName, NamespacePrefix, Id, Name, SobjectType, IsActive 
FROM RecordType
```
**Query on Profile**
```
SELECT Id FROM Profile
```
### Tooling Composite + Tooling SObjects Record describe
Note: This type of access is performed by the method we call `readMetadataAtScale()`. 
**Query on Profile**
This query is run with composite using batch size=1000.
Each Record describe is about a unique id (obviously).
Below is an example of such a composite query (version and id in `url` will vary):
```
POST /tooling/composite
[ 
    { method: 'GET', url: '/services/data/v60.0/tooling/sobjects/Profile/xyz000000000001' }, 
    { method: 'GET', url: '/services/data/v60.0/tooling/sobjects/Profile/xyz000000000002' }, 
    { method: 'GET', url: '/services/data/v60.0/tooling/sobjects/Profile/xyz000000000003' }, 
    ...
]
```

## Queries performed by the Reports dataset
Source: build/src/api/dataset/orgcheck-api-dataset-reports.js
### SOQL Queries
**Query on Report**
```
SELECT Id, Description, DeveloperName, FolderName, Format, Name, 
   NamespacePrefix, CreatedDate, LastModifiedDate, LastRunDate, 
   LastViewedDate, LastReferencedDate 
FROM Report
```
## Queries performed by the Static Resources dataset
Source: build/src/api/dataset/orgcheck-api-dataset-staticresources.js
### SOQL Queries
**Query on StaticResource**
```
SELECT Id, Name, ContentType, CreatedDate, LastModifiedDate, 
   Description, NamespacePrefix 
FROM StaticResource
```
### Tooling API Calls
**Query on Dependencies**
This dataset uses the Tooling API to retrieve dependencies for static resources.
```
dependenciesQuery(<resourceIds>)
```
## Queries performed by the User Roles dataset
Source: build/src/api/dataset/orgcheck-api-dataset-userroles.js
### SOQL Queries
**Query on UserRole**
```
SELECT Id, DeveloperName, Name, ParentRoleId, 
   (SELECT Id FROM Users WHERE IsActive = true AND ContactId = NULL AND Profile.Id != NULL) 
FROM UserRole 
WHERE PortalType = 'None'
```

## Queries performed by the Validation Rules dataset
Source: build/src/api/dataset/orgcheck-api-dataset-validationrules.js
### Tooling SOQL Queries
**Query on ValidationRule**
```
SELECT Id, Active, Description, ErrorDisplayField, ErrorMessage, ValidationName, 
   EntityDefinition.QualifiedApiName, NamespacePrefix, CreatedDate, LastModifiedDate 
FROM ValidationRule
```

## Queries performed by the Visualforce Components dataset
Source: build/src/api/dataset/orgcheck-api-dataset-visualforcecomponents.js
### Tooling SOQL Queries
**Query on ApexComponent**
```
SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate 
FROM ApexComponent
```

## Queries performed by the Visualforce Pages dataset
Source: build/src/api/dataset/orgcheck-api-dataset-visualforcepages.js
### Tooling SOQL Queries
**Query on ApexPage**
```
SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate 
FROM ApexPage
```

## Queries performed by the Web Links dataset
Source: build/src/api/dataset/orgcheck-api-dataset-weblinks.js
### Tooling SOQL Queries
**Query on WebLink**
```
SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate 
FROM WebLink
```

## Queries performed by the Workflows dataset
Source: build/src/api/dataset/orgcheck-api-dataset-workflows.js
### Tooling SOQL Queries
**Query on WorkflowRule**
```
SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate 
FROM WorkflowRule
```
