---
layout: default
title: List of queries by datasets
permalink: /queries/
---

| Dataset | SOQL Tooling | SOQL | SOSL | Composite Tooling | Metadata | Limits | Describe | Source code |
| ---     | ---          | ---  | ---  | ---               | ---      | ---    | ---      | ---         |
| Apex Classes  | ApexClass, AsyncApexJob, ApexTestResult, MetadataComponentDependency, ApexCodeCoverage, ApexCodeCoverageAggregate | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-apexclasses.js) |
| Apex Triggers | ApexTrigger, MetadataComponentDependency | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-apextriggers.js) | 
| Applications  | | AppMenuItem | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-applications.js) |
| Application Permissions | | AppMenuItem, SetupEntityAccess | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-apppermissions.js) | 
| Chatter Groups | | CollaborationGroup (byPass: INVALID_TYPE) | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-collaborationgroups.js) |
| Current User Permissions | | UserPermissionAccess | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-currentuserpermissions.js) |
| Custom Fields | CustomField, MetadataComponentDependency | | | CustomField (byPass: INVALID_CROSS_REFERENCE_KEY) | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-customfields.js) |
| Custom Labels | ExternalString, MetadataComponentDependency | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-customlabels.js) |
| Custom Tabs | CustomTab, MetadataComponentDependency | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-customtabs.js) |
| Documents | | Document | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-documents.js) |
| Email Templates | | EmailTemplate | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-emailtemplates.js) |
| Field Permissions | | FieldPermissions | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-fieldpermissions.js) |
| Flow and Process Builder | FlowDefinition, Flow, MetadataComponentDependency | | | FlowbyPass: UNKNOWN_EXCEPTION) | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-flows.js) |
| Public Groups and Queues | | Group | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-groups.js) |
| Homepage Components | Homepagecomponent, MetadataComponentDependency | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-homepagecomponents.js) |
| Internal Active Users | | User | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-internalactiveusers.js) |
| Knowledge Articles | | | KnowledgeArticleVersion (byPass: INVALID_TYPE) | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-knowledgearticles.js) |
| Aura Components  | AuraDefinitionBundle, MetadataComponentDependency | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-lighntingauracomponents.js) |
| Lightning Pages  | FlexiPage, MetadataComponentDependency | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-lighntingpages.js) |
| LWCs | LightningComponentBundle, MetadataComponentDependency | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-lighntingwebcomponents.js) |
| SObject | EntityDefinition, FieldDefinition | | | | | RecordCount | SObject Describe | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-object.js) |
| SObject permissions | | ObjectPermissions | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-objectpermissions.js) |
| SObjects | EntityDefinition | | | | | | SObject DescribeGlobal | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-objects.js) |
| Organization Information | | Organization | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-organization.js) |
| Packages | InstalledSubscriberPackage | Organization | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-packages.js) |
| Page Layouts | Layout, ProfileLayout | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-pagelayouts.js) |
| Permission Set Licenses | | PermissionSetLicense, PermissionSet, PermissionSetAssignment | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-permissionsetlicenses.js) |
| Permission Sets | | PermissionSet, ObjectPermissions, FieldPermissions, PermissionSetAssignment, PermissionSetGroupComponent | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-permissionsets.js) |
| Profile Password Policies | | | | | ProfilePasswordPolicy | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-profilepasswordpolicies.js) |
| Profile Restrictions | | Profile | | | Profile (byPass: UNKNOWN_EXCEPTION) | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-profilerestrictions.js) |
| Profiles | | PermissionSet, ObjectPermissions, FieldPermissions, PermissionSetAssignment | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-profiles.js) |
| Record Types | | RecordType, Profile | | | Profile (byPass: UNKNOWN_EXCEPTION) | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-recordtypes.js) |
| Static Resources | MetadataComponentDependency | StaticResource | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-staticresources.js) |
| User Roles | | UserRole | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-userroles.js) |
| Validation Rules | ValidationRule | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-validationrules.js) |
| Visualforce Components | ApexComponent, MetadataComponentDependency | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-visualforcecomponents.js) |
| Visualforce Pages | ApexPage, MetadataComponentDependency | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-visualforcepages.js) |
| Web Links | WebLink, MetadataComponentDependency | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-weblinks.js) |
| Workflows | WorkflowRule | | | WorkflowRule (byPass: UNKNOWN_EXCEPTION) | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-workflows.js) |
