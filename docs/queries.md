---
layout: default
title: List of queries by datasets
permalink: /queries/
---

| Dataset | SOQL Tooling | SOQL | SOSL | Composite API Tooling | Metadata API | Limits API | Describe API | Source code |
| ---     | ---          | ---  | ---  | ---                   | ---          | ---        | ---          | ---         |
| Apex Classes  | ApexClass, AsyncApexJob, ApexTestResult, MetadataComponentDependency, ApexCodeCoverage, ApexCodeCoverageAggregate | | | | | | | build/src/api/dataset/orgcheck-api-dataset-apexclasses.js |
| Apex Triggers | ApexTrigger, MetadataComponentDependency | | | | | | | build/src/api/dataset/orgcheck-api-dataset-apextriggers.js | 
| Applications  | | AppMenuItem | | | | | | build/src/api/dataset/orgcheck-api-dataset-applications.js |
| Application Permissions | | AppMenuItem, SetupEntityAccess | | | | | | build/src/api/dataset/orgcheck-api-dataset-apppermissions.js | 
| Chatter Groups | | CollaborationGroup (byPass: INVALID_TYPE) | | | | | | build/src/api/dataset/orgcheck-api-dataset-collaborationgroups.js |
| Current User Permissions | | UserPermissionAccess | | | | | | build/src/api/dataset/orgcheck-api-dataset-currentuserpermissions.js |
| Custom Fields | CustomField, MetadataComponentDependency | | | CustomField (byPass: INVALID_CROSS_REFERENCE_KEY) | | | | build/src/api/dataset/orgcheck-api-dataset-customfields.js |
| Custom Labels | ExternalString, MetadataComponentDependency | | | | | | | build/src/api/dataset/orgcheck-api-dataset-customlabels.js |
| Custom Tabs | CustomTab, MetadataComponentDependency | | | | | | | build/src/api/dataset/orgcheck-api-dataset-customtabs.js |
| Documents | | Document | | | | | | build/src/api/dataset/orgcheck-api-dataset-documents.js |
| Email Templates | | EmailTemplate | | | | | | build/src/api/dataset/orgcheck-api-dataset-emailtemplates.js |
| Field Permissions | | FieldPermissions | | | | | | build/src/api/dataset/orgcheck-api-dataset-fieldpermissions.js |
| Flow and Process Builder | FlowDefinition, Flow, MetadataComponentDependency | | | FlowbyPass: UNKNOWN_EXCEPTION) | | | | build/src/api/dataset/orgcheck-api-dataset-flows.js |
| Public Groups and Queues | | Group | | | | | | build/src/api/dataset/orgcheck-api-dataset-groups.js |
| Homepage Components | Homepagecomponent, MetadataComponentDependency | | | | | | | build/src/api/dataset/orgcheck-api-dataset-homepagecomponents.js |
| Internal Active Users | | User | | | | | | build/src/api/dataset/orgcheck-api-dataset-internalactiveusers.js |
| Knowledge Articles | | | KnowledgeArticleVersion (byPass: INVALID_TYPE) | | | | | build/src/api/dataset/orgcheck-api-dataset-knowledgearticles.js |
| Aura Components  | AuraDefinitionBundle, MetadataComponentDependency | | | | | | | build/src/api/dataset/orgcheck-api-dataset-lighntingauracomponents.js |
| Lightning Pages  | FlexiPage, MetadataComponentDependency | | | | | | | build/src/api/dataset/orgcheck-api-dataset-lighntingpages.js |
| LWCs | LightningComponentBundle, MetadataComponentDependency | | | | | | | build/src/api/dataset/orgcheck-api-dataset-lighntingwebcomponents.js |
| SObject | EntityDefinition, FieldDefinition | | | | | RecordCount | SObject Describe | build/src/api/dataset/orgcheck-api-dataset-object.js |
| SObject permissions | | ObjectPermissions | | | | | | build/src/api/dataset/orgcheck-api-dataset-objectpermissions.js |
| SObjects | EntityDefinition | | | | | | SObject DescribeGlobal | build/src/api/dataset/orgcheck-api-dataset-objects.js |
| Organization Information | | Organization | | | | | | build/src/api/dataset/orgcheck-api-dataset-organization.js |
| Packages | InstalledSubscriberPackage | Organization | | | | | | build/src/api/dataset/orgcheck-api-dataset-packages.js |
| Page Layouts | Layout, ProfileLayout | | | | | | | build/src/api/dataset/orgcheck-api-dataset-pagelayouts.js |
| Permission Set Licenses | | PermissionSetLicense, PermissionSet, PermissionSetAssignment | | | | | | build/src/api/dataset/orgcheck-api-dataset-permissionsetlicenses.js |
| Permission Sets | | PermissionSet, ObjectPermissions, FieldPermissions, PermissionSetAssignment, PermissionSetGroupComponent | | | | | | build/src/api/dataset/orgcheck-api-dataset-permissionsets.js |
| Profile Password Policies | | | | | ProfilePasswordPolicy | | | build/src/api/dataset/orgcheck-api-dataset-profilepasswordpolicies.js |
| Profile Restrictions | | Profile | | | Profile (byPass: UNKNOWN_EXCEPTION) | | | | build/src/api/dataset/orgcheck-api-dataset-profilerestrictions.js |
| Profiles | | PermissionSet, ObjectPermissions, FieldPermissions, PermissionSetAssignment | | | | | | build/src/api/dataset/orgcheck-api-dataset-profiles.js |
| Record Types | | RecordType, Profile | | | Profile (byPass: UNKNOWN_EXCEPTION) | | | | build/src/api/dataset/orgcheck-api-dataset-recordtypes.js |
| Static Resources | MetadataComponentDependency | StaticResource | | | | | | | build/src/api/dataset/orgcheck-api-dataset-staticresources.js |
| User Roles | | UserRole | | | | | | build/src/api/dataset/orgcheck-api-dataset-userroles.js |
| Validation Rules | ValidationRule | | | | | | | build/src/api/dataset/orgcheck-api-dataset-validationrules.js |
| Visualforce Components | ApexComponent, MetadataComponentDependency | | | | | | | build/src/api/dataset/orgcheck-api-dataset-visualforcecomponents.js |
| Visualforce Pages | ApexPage, MetadataComponentDependency | | | | | | | build/src/api/dataset/orgcheck-api-dataset-visualforcepages.js |
| Web Links | WebLink, MetadataComponentDependency | | | | | | | build/src/api/dataset/orgcheck-api-dataset-weblinks.js |
| Workflows | WorkflowRule | | | WorkflowRule (byPass: UNKNOWN_EXCEPTION) | | | | build/src/api/dataset/orgcheck-api-dataset-workflows.js |
