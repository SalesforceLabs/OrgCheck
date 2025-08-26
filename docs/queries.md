---
layout: default
title: List of queries by datasets
permalink: /queries/
---

| Dataset | /tooling/query  | /query | /search | /tooling/sobjects | /metadata | /limits/recordCount | /sobjects | Source code |
| ---     | ---          | ---  | ---  | ---               | ---      | ---    | ---      | ---         |
| Apex Classes  | ApexClass <br /> AsyncApexJob <br /> ApexTestResult <br />  ApexCodeCoverage <br /> ApexCodeCoverageAggregate <br /> MetadataComponentDependency&nbsp;<sup>1</sup> | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-apexclasses.js) |
| Apex Triggers | ApexTrigger <br /> MetadataComponentDependency&nbsp;<sup>1</sup> | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-apextriggers.js) | 
| Applications  | | AppMenuItem | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-applications.js) |
| Application Permissions | | AppMenuItem <br /> SetupEntityAccess | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-apppermissions.js) | 
| Chatter Groups | | CollaborationGroup | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-collaborationgroups.js) |
| Current User Permissions | | UserPermissionAccess | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-currentuserpermissions.js) |
| Custom Fields | CustomField <br /> MetadataComponentDependency&nbsp;<sup>1</sup> | | | CustomField&nbsp;<sup>1</sup> | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-customfields.js) |
| Custom Labels | ExternalString <br /> MetadataComponentDependency&nbsp;<sup>1</sup> | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-customlabels.js) |
| Custom Tabs | CustomTab <br /> MetadataComponentDependency&nbsp;<sup>1</sup> | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-customtabs.js) |
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
| Organization Information | | Organization | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-organization.js) |
| Packages | InstalledSubscriberPackage | Organization | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-packages.js) |
| Page Layouts | Layout <br /> ProfileLayout | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-pagelayouts.js) |
| Permission Set Licenses | | PermissionSetLicense <br /> PermissionSet <br /> PermissionSetAssignment | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-permissionsetlicenses.js) |
| Permission Sets | | PermissionSet <br /> ObjectPermissions <br /> FieldPermissions <br /> PermissionSetAssignment <br /> PermissionSetGroupComponent | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-permissionsets.js) |
| Profile Password Policies | | | | | ProfilePasswordPolicy | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-profilepasswordpolicies.js) |
| Profile Restrictions | | Profile | | | Profile | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-profilerestrictions.js) |
| Profiles | | PermissionSet <br /> ObjectPermissions <br /> FieldPermissions <br /> PermissionSetAssignment | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-profiles.js) |
| Record Types | | RecordType <br /> Profile | | | Profile | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-recordtypes.js) |
| Static Resources | MetadataComponentDependency&nbsp;<sup>1</sup> | StaticResource | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-staticresources.js) |
| User Roles | | UserRole | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-userroles.js) |
| Validation Rules | ValidationRule | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-validationrules.js) |
| Visualforce Components | ApexComponent <br /> MetadataComponentDependency&nbsp;<sup>1</sup> | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-visualforcecomponents.js) |
| Visualforce Pages | ApexPage <br /> MetadataComponentDependency&nbsp;<sup>1</sup> | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-visualforcepages.js) |
| Web Links | WebLink <br /> MetadataComponentDependency&nbsp;<sup>1</sup> | | | | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-weblinks.js) |
| Workflows | WorkflowRule | | | WorkflowRule&nbsp;<sup>1</sup> | | | | [source](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-workflows.js) |

---
1: Combined with /tooling/composite
