---
layout: default
title: List of queries by datasets
permalink: /queries/
---

## Dataset database access matrix


| Dataset | /tooling/query  | /query | /search | /tooling/sobjects | /metadata | /limits/recordCount | /sobjects | Source code |
| ---     | ---          | ---  | ---  | ---               | ---      | ---    | ---      | ---         |
| Apex Classes  | ApexClass <br /> AsyncApexJob <br /> ApexTestResult <br />  ApexCodeCoverage <br /> ApexCodeCoverageAggregate <br /> MetadataComponentDependency&nbsp;<sup>1</sup> | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-apexclasses.js) |
| Apex Triggers | ApexTrigger <br /> MetadataComponentDependency&nbsp;<sup>1</sup> | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-apextriggers.js) | 
| Applications  | | AppMenuItem | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-applications.js) |
| Application Permissions | | AppMenuItem <br /> SetupEntityAccess | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-apppermissions.js) | 
| Browsers | | Browser | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-browsers.js) |
| Chatter Groups | | CollaborationGroup | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-collaborationgroups.js) |
| Current User Permissions | | UserPermissionAccess | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-currentuserpermissions.js) |
| Custom Fields | CustomField <br /> MetadataComponentDependency&nbsp;<sup>1</sup> | | | CustomField&nbsp;<sup>1</sup> | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-customfields.js) |
| Custom Labels | ExternalString <br /> MetadataComponentDependency&nbsp;<sup>1</sup> | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-customlabels.js) |
| Custom Tabs | CustomTab <br /> MetadataComponentDependency&nbsp;<sup>1</sup> | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-customtabs.js) |
| Dashboards | | Dashboard | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-dashboards.js) |
| Documents | | Document | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-documents.js) |
| Email Templates | | EmailTemplate | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-emailtemplates.js) |
| Field Permissions | | FieldPermissions | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-fieldpermissions.js) |
| Flow and Process Builder | FlowDefinition <br /> Flow <br /> MetadataComponentDependency&nbsp;<sup>1</sup> | | | Flow&nbsp;<sup>1</sup> | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-flows.js) |
| Public Groups and Queues | | Group | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-groups.js) |
| Homepage Components | Homepagecomponent <br /> MetadataComponentDependency&nbsp;<sup>1</sup> | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-homepagecomponents.js) |
| Internal Active Users | | User | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-internalactiveusers.js) |
| Knowledge Articles | | | KnowledgeArticleVersion | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-knowledgearticles.js) |
| Aura Components  | AuraDefinitionBundle <br /> MetadataComponentDependency&nbsp;<sup>1</sup> | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-lighntingauracomponents.js) |
| Lightning Pages  | FlexiPage <br /> MetadataComponentDependency&nbsp;<sup>1</sup> | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-lighntingpages.js) |
| LWCs | LightningComponentBundle <br /> MetadataComponentDependency&nbsp;<sup>1</sup> | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-lighntingwebcomponents.js) |
| SObject | EntityDefinition <br /> FieldDefinition | | | | | Specific SObject | Specific SObject | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-object.js) |
| SObject permissions | | ObjectPermissions | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-objectpermissions.js) |
| SObjects | EntityDefinition | | | | | | All SObjects | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-objects.js) |
| Object Types | | ObjectType | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-objecttypes.js) |
| Organization Information | | Organization | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-organization.js) |
| Packages | InstalledSubscriberPackage | Organization | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-packages.js) |
| Page Layouts | Layout <br /> ProfileLayout | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-pagelayouts.js) |
| Permission Set Licenses | | PermissionSetLicense <br /> PermissionSet <br /> PermissionSetAssignment | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-permissionsetlicenses.js) |
| Permission Sets | | PermissionSet <br /> ObjectPermissions <br /> FieldPermissions <br /> PermissionSetAssignment <br /> PermissionSetGroupComponent | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-permissionsets.js) |
| Profile Password Policies | | | | | ProfilePasswordPolicy | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-profilepasswordpolicies.js) |
| Profile Restrictions | | Profile | | | Profile | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-profilerestrictions.js) |
| Profiles | | PermissionSet <br /> ObjectPermissions <br /> FieldPermissions <br /> PermissionSetAssignment | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-profiles.js) |
| Record Types | | RecordType <br /> Profile | | | Profile | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-recordtypes.js) |
| Reports | | Report | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-reports.js) |
| Static Resources | MetadataComponentDependency&nbsp;<sup>1</sup> | StaticResource | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-staticresources.js) |
| User Roles | | UserRole | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-userroles.js) |
| Validation Rules | ValidationRule | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-validationrules.js) |
| Visualforce Components | ApexComponent <br /> MetadataComponentDependency&nbsp;<sup>1</sup> | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-visualforcecomponents.js) |
| Visualforce Pages | ApexPage <br /> MetadataComponentDependency&nbsp;<sup>1</sup> | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-visualforcepages.js) |
| Web Links | WebLink <br /> MetadataComponentDependency&nbsp;<sup>1</sup> | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-weblinks.js) |
| Workflows | WorkflowRule | | | WorkflowRule&nbsp;<sup>1</sup> | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-workflows.js) |

---
1: Combined with /tooling/composite

## Detailed Queries Per Dataset

This section provides a detailed breakdown of all queries performed by each dataset, including SOQL queries, Metadata API calls, Tooling API calls, SOSL queries, and other database access methods with their characteristics.

### Apex Classes
- Tooling SOQL Query: `SELECT Id, Name, ApiVersion, NamespacePrefix, Body, LengthWithoutComments, SymbolTable, CreatedDate, LastModifiedDate FROM ApexClass WHERE ManageableState IN ('installedEditable', 'unmanaged') ORDER BY Id`
- Tooling SOQL Query: `SELECT ApexClassId FROM AsyncApexJob WHERE JobType = 'ScheduledApex' AND ApexClass.ManageableState IN ('installedEditable', 'unmanaged')`
- Tooling SOQL Query: `SELECT ApexClassId, MethodName, ApexTestRunResult.CreatedDate, RunTime, Outcome, StackTrace, (SELECT Cpu, AsyncCalls, Sosl, Soql, QueryRows, DmlRows, Dml FROM ApexTestResults LIMIT 1) FROM ApexTestResult WHERE (Outcome != 'Pass' OR RunTime > 20000) AND ApexTestRunResult.Status = 'Completed' AND ApexClass.ManageableState IN ('installedEditable', 'unmanaged') ORDER BY ApexClassId, ApexTestRunResult.CreatedDate desc, MethodName`
- SOQL Query Batch: `SELECT ApexClassOrTriggerId, ApexTestClassId FROM ApexCodeCoverage WHERE ApexClassOrTriggerId IN (<subsetIds>) AND ApexTestClass.ManageableState IN ('installedEditable', 'unmanaged') GROUP BY ApexClassOrTriggerId, ApexTestClassId`
- SOQL Query Batch: `SELECT ApexClassOrTriggerId, NumLinesCovered, NumLinesUncovered, Coverage FROM ApexCodeCoverageAggregate WHERE ApexClassOrTriggerId IN (<subsetIds>)`

### Apex Triggers
- Tooling SOQL Query: `SELECT Id, Name, ApiVersion, Status, NamespacePrefix, Body, UsageBeforeInsert, UsageAfterInsert, UsageBeforeUpdate, UsageAfterUpdate, UsageBeforeDelete, UsageAfterDelete, UsageAfterUndelete, UsageIsBulk, LengthWithoutComments, EntityDefinition.QualifiedApiName, CreatedDate, LastModifiedDate FROM ApexTrigger WHERE ManageableState IN ('installedEditable', 'unmanaged')`

### Applications
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM AppMenuItem` (REST API)

### Application Permissions
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM AppMenuItem` (REST API)
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM SetupEntityAccess` (REST API)

### Browsers
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Browser` (REST API)

### Chatter Groups
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM CollaborationGroup` (REST API)

### Current User Permissions
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM UserPermissionAccess` (REST API)

### Custom Fields
- Tooling SOQL Query: `SELECT Id, EntityDefinition.QualifiedApiName, EntityDefinition.IsCustomSetting, EntityDefinition.KeyPrefix FROM CustomField WHERE ManageableState IN ('installedEditable', 'unmanaged')`
- Metadata API Call: `readMetadataAtScale('CustomField', <customFieldIds>, ['INVALID_CROSS_REFERENCE_KEY'])`

### Custom Labels
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Category, IsProtected, Language, MasterLabel, Value, CreatedDate, LastModifiedDate FROM ExternalString WHERE ManageableState IN ('installedEditable', 'unmanaged')` (Tooling API)

### Custom Tabs
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM CustomTab` (Tooling API)

### Dashboards
- SOQL Query: `SELECT Id, FolderName, FolderId, Title, DeveloperName, NamespacePrefix, Description, CreatedDate, LastModifiedDate, Type, LastViewedDate, LastReferencedDate, DashboardResultRefreshedDate FROM Dashboard` (REST API)

### Documents
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Document` (REST API)

### Email Templates
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM EmailTemplate` (REST API)

### Field Permissions
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM FieldPermissions` (REST API)

### Flow and Process Builder
- Tooling SOQL Query: `SELECT Id, DeveloperName, ApiVersion, Description, ActiveVersionId, LatestVersionId, CreatedDate, LastModifiedDate FROM FlowDefinition`
- Tooling SOQL Query: `SELECT DefinitionId, COUNT(Id) NbVersions FROM Flow GROUP BY DefinitionId`
- Metadata API Call: `readMetadataAtScale('Flow', <flowIds>, ['UNKNOWN_EXCEPTION'])`

### Public Groups and Queues
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Group` (REST API)

### Homepage Components
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Homepagecomponent` (Tooling API)

### Internal Active Users
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM User` (REST API)

### Knowledge Articles
- SOSL Query: `FIND { .salesforce.com OR .force.* } IN ALL FIELDS RETURNING KnowledgeArticleVersion (Id, KnowledgeArticleId, ArticleNumber, CreatedDate, LastModifiedDate, PublishStatus, Title, UrlName )` (REST API)

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
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM ObjectPermissions` (REST API)

### SObjects
- Tooling SOQL Query: `SELECT DurableId, NamespacePrefix, DeveloperName, QualifiedApiName, ExternalSharingModel, InternalSharingModel FROM EntityDefinition WHERE KeyPrefix <> null AND DeveloperName <> null AND (NOT(KeyPrefix IN ('00a', '017', '02c', '0D5', '1CE'))) AND (NOT(QualifiedApiName like '%_hd'))`
- Tooling SOQL Query: `SELECT EntityDefinitionId, COUNT(Id) NbCustomFields FROM CustomField GROUP BY EntityDefinitionId`
- Tooling SOQL Query: `SELECT EntityDefinitionId, COUNT(Id) NbPageLayouts FROM Layout GROUP BY EntityDefinitionId`
- Tooling SOQL Query: `SELECT EntityDefinitionId, COUNT(Id) NbRecordTypes FROM RecordType GROUP BY EntityDefinitionId`
- Tooling SOQL Query: `SELECT TableEnumOrId, COUNT(Id) NbWorkflowRules FROM WorkflowRule GROUP BY TableEnumOrId`
- Tooling SOQL Query: `SELECT EntityDefinitionId, COUNT(Id) NbValidationRules FROM ValidationRule GROUP BY EntityDefinitionId`
- Tooling SOQL Query: `SELECT EntityDefinitionId, COUNT(Id) NbTriggers FROM ApexTrigger GROUP BY EntityDefinitionId`

### Object Types
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM ObjectType` (REST API)

### Organization Information
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Organization` (REST API)

### Packages
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM InstalledSubscriberPackage` (REST API)
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Organization` (REST API)

### Page Layouts
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Layout` (Tooling API)
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM ProfileLayout` (Tooling API)

### Permission Set Licenses
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM PermissionSetLicense` (REST API)
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM PermissionSet` (REST API)
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM PermissionSetAssignment` (REST API)

### Permission Sets
- SOQL Query: `SELECT Id, Name, Description, IsCustom, License.Name, NamespacePrefix, Type, PermissionsApiEnabled, PermissionsViewSetup, PermissionsModifyAllData, PermissionsViewAllData, PermissionsManageUsers, PermissionsCustomizeApplication, CreatedDate, LastModifiedDate FROM PermissionSet WHERE IsOwnedByProfile = FALSE` (REST API)
- SOQL Query: `SELECT Id, PermissionSetGroupId, PermissionSetGroup.Description FROM PermissionSet WHERE PermissionSetGroupId != null` (REST API)
- SOQL Query: `SELECT ParentId, COUNT(SobjectType) CountObject FROM ObjectPermissions WHERE Parent.IsOwnedByProfile = FALSE GROUP BY ParentId` (REST API)
- SOQL Query: `SELECT ParentId, COUNT(Field) CountField FROM FieldPermissions WHERE Parent.IsOwnedByProfile = FALSE GROUP BY ParentId` (REST API)
- SOQL Query: `SELECT PermissionSetId, COUNT(Id) CountAssignment FROM PermissionSetAssignment WHERE PermissionSet.IsOwnedByProfile = FALSE AND Assignee.IsActive = TRUE GROUP BY PermissionSetId` (REST API)
- SOQL Query: `SELECT PermissionSetGroupId, PermissionSetId FROM PermissionSetGroupComponent WHERE PermissionSet.IsOwnedByProfile = FALSE` (REST API)

### Profile Password Policies
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM ProfilePasswordPolicy` (REST API)

### Profile Restrictions
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Profile` (REST API)

### Profiles
- SOQL Query: `SELECT ProfileId, Profile.Name, Profile.Description, IsCustom, License.Name, NamespacePrefix, PermissionsApiEnabled, PermissionsViewSetup, PermissionsModifyAllData, PermissionsViewAllData, PermissionsManageUsers, PermissionsCustomizeApplication, CreatedDate, LastModifiedDate FROM PermissionSet WHERE isOwnedByProfile = TRUE ORDER BY ProfileId` (REST API)
- SOQL Query: `SELECT Parent.ProfileId, COUNT(SobjectType) CountObject FROM ObjectPermissions WHERE Parent.IsOwnedByProfile = TRUE GROUP BY Parent.ProfileId` (REST API)
- SOQL Query: `SELECT Parent.ProfileId, COUNT(Field) CountField FROM FieldPermissions WHERE Parent.IsOwnedByProfile = TRUE GROUP BY Parent.ProfileId` (REST API)
- SOQL Query: `SELECT PermissionSet.ProfileId, COUNT(Id) CountAssignment FROM PermissionSetAssignment WHERE PermissionSet.IsOwnedByProfile = TRUE AND Assignee.IsActive = TRUE GROUP BY PermissionSet.ProfileId` (REST API)

### Record Types
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM RecordType` (REST API)
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM Profile` (REST API)

### Reports
- SOQL Query: `SELECT Id, Name, DeveloperName, Description, Format, FolderName, NamespacePrefix, CreatedDate, LastModifiedDate, LastRunDate, LastViewedDate, LastReferencedDate FROM Report` (REST API)

### Static Resources
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM StaticResource` (REST API)

### User Roles
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM UserRole` (REST API)

### Validation Rules
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM ValidationRule` (REST API)

### Visualforce Components
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM ApexComponent` (Tooling API)

### Visualforce Pages
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM ApexPage` (Tooling API)

### Web Links
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM WebLink` (Tooling API)

### Workflows
- SOQL Query: `SELECT Id, Name, NamespacePrefix, Description, CreatedDate, LastModifiedDate FROM WorkflowRule` (Tooling API)
