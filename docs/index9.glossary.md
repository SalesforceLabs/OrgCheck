---
layout: default
title: Glossary
permalink: /glossary/
mermaid: true
---

# Glossary of Table Definitions

This document explains the column definitions for each table in the OrgCheck application.

## Table of Contents

| Letter | Sections |
| ------ | -------- |
| A | [ApexClasses](#ApexClasses), [ApexTriggers](#ApexTriggers), [AuraComponents](#AuraComponents) |
| C | [ChatterGroups](#ChatterGroups), [CustomFields](#CustomFields), [CustomFieldsInObject](#CustomFieldsInObject), [CustomLabels](#CustomLabels), [CustomTabs](#CustomTabs) |
| D | [Dashboards](#Dashboards), [Documents](#Documents) |
| E | [EmailTemplates](#EmailTemplates)
| F | [FieldSets](#FieldSets), [Flows](#Flows), [FlexiPagesInObject](#FlexiPagesInObject) |
| H | [HomePageComponents](#HomePageComponents) |
| K | [KnowledgeArticles](#KnowledgeArticles) |
| L | [Layouts](#Layouts), [LightningWebComponents](#LightningWebComponents), [Limits](#Limits) |
| O | [Objects](#Objects) |
| P | [Pages](#Pages), [PermissionSets](#PermissionSets), [ProcessBuilders](#ProcessBuilders), [Profiles](#Profiles) |
| R | [RecordTypes](#RecordTypes), [RecordTypesInObject](#RecordTypesInObject), [Reports](#Reports), [Roles](#Roles) |
| S | [StaticResources](#StaticResources) |
| U | [Users](#Users) |
| V | [ValidationRules](#ValidationRules) |
| W | [Workflows](#Workflows) |



## ApexClasses
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the Apex class |
| Name | Link | Link to the Apex class |
| API Version | Numeric | API version of the Apex class |
| Package | String | Package containing the Apex class |
| Class | Boolean | Indicates if it's a class |
| Abst. | Boolean | Indicates if it's abstract |
| Intf. | Boolean | Indicates if it's an interface |
| Enum | Boolean | Indicates if it's an enum |
| Schdl. | Boolean | Indicates if it's schedulable |
| Access | String | Access level |
| Implements | List of strings | Interfaces implemented |
| Extends | String | Class extended |
| Size | Numeric | Size of the class |
| Hardcoded URLs | List of strings | List of hardcoded URLs |
| Hardcoded IDs | List of strings | List of hardcoded IDs |
| Methods | Numeric | Number of methods |
| Inner Classes | Numeric | Number of inner classes |
| Annotations | List of strings | Annotations used |
| Sharing | String | Sharing model |
| Scheduled | Boolean | Indicates if it's scheduled |
| Coverage (>75%) | Percentage | Code coverage percentage |
| Editable Related Tests | List of URLs | Links to related test classes |
| Using | Numeric | Number of references to this Apex class |
| Referenced in | Numeric | Number of references to this Apex class |
| Dependencies | Link | Link to the dependencies modal |
| Created date | Date Time | Date when the Apex class was created |
| Modified date | Date Time | Date when the Apex class was last modified |

## ApexTriggers
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the Apex trigger |
| Name | Link | Link to the Apex trigger |
| API Version | Numeric | API version of the Apex trigger |
| Package | String | Package containing the Apex trigger |
| Size | Numeric | Size of the trigger |
| Hardcoded URLs | List of strings | List of hardcoded URLs |
| Hardcoded IDs | List of strings | List of hardcoded IDs |
| Object API Name | String | API name of the object |
| Object Name | Link | Link to the object |
| Active? | Boolean | Indicates if the trigger is active |
| Has SOQL? | Boolean | Indicates if the trigger has SOQL |
| Has DML? | Boolean | Indicates if the trigger has DML |
| *Insert | Boolean | Indicates if before insert is used |
| Insert* | Boolean | Indicates if after insert is used |
| *Update | Boolean | Indicates if before update is used |
| Update* | Boolean | Indicates if after update is used |
| *Delete | Boolean | Indicates if before delete is used |
| Delete* | Boolean | Indicates if after delete is used |
| Undelete | Boolean | Indicates if after undelete is used |
| Using | Numeric | Number of references to this Apex trigger |
| Dependencies | Link | Link to the dependencies modal |
| Created date | Date Time | Date when the Apex trigger was created |
| Modified date | Date Time | Date when the Apex trigger was last modified |

## AuraComponents
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the Aura component |
| Name | Link | Link to the Aura component |
| API Version | Numeric | API version of the Aura component |
| Package | String | Package containing the Aura component |
| Using | Numeric | Number of references to this Aura component |
| Referenced in | Numeric | Number of references to this Aura component |
| Dependencies | Link | Link to the dependencies modal |
| Created date | Date Time | Date when the Aura component was created |
| Modified date | Date Time | Date when the Aura component was last modified |
| Description | String | Description of the Aura component |

## ChatterGroups
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the chatter group |
| Group | Link | Link to the chatter group |
| Description | String | Description of the chatter group |
| Hardcoded URLs | List of strings | List of hardcoded URLs |
| Hardcoded IDs | List of strings | List of hardcoded IDs |

## CustomFields
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the custom field |
| Field | Link | Link to the custom field |
| Label | String | Label of the custom field |
| Object API Name | String | API name of the object |
| Object Name | Link | Link to the object |
| Object Type | String | Type of the object |
| Package | String | Package containing the custom field |
| Type | String | Type of the custom field |
| Length | String | Length of the custom field |
| Unique? | Boolean | Indicates if the field is unique |
| Encrypted? | Boolean | Indicates if the field is encrypted |
| External? | Boolean | Indicates if the field is external ID |
| Indexed? | Boolean | Indicates if the field is indexed |
| Restricted? | Boolean | Indicates if the field is restricted picklist |
| Tooltip | String | Tooltip of the custom field |
| Formula | String | Formula of the custom field |
| Hardcoded URLs | List of strings | List of hardcoded URLs |
| Hardcoded IDs | List of strings | List of hardcoded IDs |
| Default Value | String | Default value of the custom field |
| Using | Numeric | Number of references to this custom field |
| Referenced in | Numeric | Number of references to this custom field |
| Ref. in Layout? | Numeric | Number of references in page layouts |
| Ref. in Apex Class? | Numeric | Number of references in Apex classes |
| Ref. in Flow? | Numeric | Number of references in flows |
| Dependencies | Link | Link to the dependencies modal |
| Created date | Date Time | Date when the custom field was created |
| Modified date | Date Time | Date when the custom field was last modified |
| Description | String | Description of the custom field |

## CustomFieldsInObject
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the custom field |
| Field | Link | Link to the custom field |
| Label | String | Label of the custom field |
| Package | String | Package containing the custom field |
| Type | String | Type of the custom field |
| Length | String | Length of the custom field |
| Unique? | Boolean | Indicates if the field is unique |
| Encrypted? | Boolean | Indicates if the field is encrypted |
| External? | Boolean | Indicates if the field is external ID |
| Indexed? | Boolean | Indicates if the field is indexed |
| Restricted? | Boolean | Indicates if the field is restricted picklist |
| Tooltip | String | Tooltip of the custom field |
| Formula | String | Formula of the custom field |
| Hardcoded URLs | List of strings | List of hardcoded URLs |
| Hardcoded IDs | List of strings | List of hardcoded IDs |
| Default Value | String | Default value of the custom field |
| Using | Numeric | Number of references to this custom field |
| Referenced in | Numeric | Number of references to this custom field |
| Ref. in Layout? | Numeric | Number of references in page layouts |
| Ref. in Apex Class? | Numeric | Number of references in Apex classes |
| Ref. in Flow? | Numeric | Number of references in flows |
| Dependencies | Link | Link to the dependencies modal |
| Created date | Date Time | Date when the custom field was created |
| Modified date | Date Time | Date when the custom field was last modified |
| Description | String | Description of the custom field |

## CustomLabels
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the custom label |
| Name | Link | Link to the custom label |
| Package | String | Package containing the custom label |
| Label | String | Label of the custom label |
| Category | String | Category of the custom label |
| Language | String | Language of the custom label |
| Protected? | Boolean | Indicates if the custom label is protected |
| Using | Numeric | Number of references to this custom label |
| Referenced in | Numeric | Number of references to this custom label |
| Ref. in Layout? | Numeric | Number of references in page layouts |
| Ref. in Apex Class? | Numeric | Number of references in Apex classes |
| Ref. in Flow? | Numeric | Number of references in flows |
| Dependencies | Link | Link to the dependencies modal |
| Created date | Date Time | Date when the custom label was created |
| Modified date | Date Time | Date when the custom label was last modified |
| Value | String | Value of the custom label |

## CustomTabs
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the custom tab |
| Name | Link | Link to the custom tab |
| Package | String | Package containing the custom tab |
| Type | String | Type of the custom tab |
| Hardcoded URLs | List of strings | List of hardcoded URLs |
| Hardcoded IDs | List of strings | List of hardcoded IDs |
| Created date | Date Time | Date when the custom tab was created |
| Modified date | Date Time | Date when the custom tab was last modified |
| Using | Numeric | Number of references to this custom tab |
| Referenced in | Numeric | Number of references to this custom tab |
| Dependencies | Link | Link to the dependencies modal |
| Description | String | Description of the custom tab |

## Dashboards
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the dashboard |
| Title | Link | Link to the dashboard |
| Developer Name | String | Developer name of the dashboard |
| Package | String | Package containing the dashboard |
| Type | String | Type of the dashboard |
| Last viewed | Date Time | Date when the dashboard was last viewed |
| Last referenced | Date Time | Date when the dashboard was last referenced |
| Refreshed | Date Time | Date when the dashboard was refreshed |
| Created date | Date Time | Date when the dashboard was created |
| Modified date | Date Time | Date when the dashboard was last modified |
| Description | String | Description of the dashboard |
| Folder | String | Folder containing the dashboard |

## Documents
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the document |
| Name | Link | Link to the document |
| Package | String | Package containing the document |
| Folder | String | Folder containing the document |
| Document URL | String | URL of the document |
| Size (bytes) | Numeric | Size of the document in bytes |
| Type | String | Type of the document |
| Created date | Date Time | Date when the document was created |
| Modified date | Date Time | Date when the document was last modified |
| Description | String | Description of the document |

## EmailTemplates
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the email template |
| Name | Link | Link to the email template |
| API Version | Numeric | API version of the email template |
| Package | String | Package containing the email template |
| UI Type | String | UI type of the email template |
| Type | String | Type of the email template |
| Folder | String | Folder containing the email template |
| Is Active | Boolean | Indicates if the email template is active |
| Last Used | Date Time | Date when the email template was last used |
| Used | Numeric | Number of times used |
| Hardcoded URLs | List of strings | List of hardcoded URLs |
| Hardcoded IDs | List of strings | List of hardcoded IDs |
| Created date | Date Time | Date when the email template was created |
| Modified date | Date Time | Date when the email template was last modified |
| Description | String | Description of the email template |

## FieldSets
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Label | Link | Link to the field set with its label |
| Description | String | Description of the field set |

## Flows
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the flow |
| Name | Link | Link to the flow |
| API Version | Numeric | API version of the flow |
| Type | String | Type of the flow |
| Number of versions | Numeric | Number of versions |
| Current Version | Link | Link to the current version |
| Is it Active? | Boolean | Indicates if the current version is active |
| Is it the Latest? | Boolean | Indicates if the current version is the latest |
| Its SObject | String | SObject associated with the flow |
| Its trigger type | String | Trigger type of the flow |
| Its record trigger type | String | Record trigger type of the flow |
| Its Running Mode | String | Running mode of the flow |
| Its API Version | Numeric | API version of the current version |
| # Nodes | Numeric | Number of nodes |
| # DML Create Nodes | Numeric | Number of DML create nodes |
| # DML Delete Nodes | Numeric | Number of DML delete nodes |
| # DML Update Nodes | Numeric | Number of DML update nodes |
| # Screen Nodes | Numeric | Number of screen nodes |
| Its LFS Violations | List of strings | List of LFS violations |
| Its created date | Date Time | Created date of the current version |
| Its modified date | Date Time | Modified date of the current version |
| Its description | String | Description of the current version |
| Flow created date | Date Time | Created date of the flow |
| Flow modified date | Date Time | Modified date of the flow |
| Flow description | String | Description of the flow |
| Using | Numeric | Number of references to this flow |
| Referenced in | Numeric | Number of references to this flow |
| Dependencies | Link | Link to the dependencies modal |

## FlexiPagesInObject
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the flexi page |
| Name | Link | Link to the flexi page |
| Type | String | Type of the flexi page |
| Package | String | Package containing the flexi page |
| #Components | Numeric | Number of components |
| #Fields | Numeric | Number of fields |
| #Related Lists | Numeric | Number of related lists |
| Attachment List? | Boolean | Indicates if attachment list is included |
| Lists from Layout? | Boolean | Indicates if lists from layout are included |
| Using | Numeric | Number of references to this flexi page |
| Referenced in | Numeric | Number of references to this flexi page |
| Dependencies | Link | Link to the dependencies modal |
| Created date | Date Time | Date when the flexi page was created |
| Modified date | Date Time | Date when the flexi page was last modified |
| Description | String | Description of the flexi page |

## HomePageComponents
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the home page component |
| Name | Link | Link to the home page component |
| Package | String | Package containing the home page component |
| Is Body Empty? | Boolean | Indicates if the body is empty |
| Hardcoded URLs | List of strings | List of hardcoded URLs |
| Hardcoded IDs | List of strings | List of hardcoded IDs |
| Created date | Date Time | Date when the home page component was created |
| Modified date | Date Time | Date when the home page component was last modified |
| Using | Numeric | Number of references to this home page component |
| Referenced in | Numeric | Number of references to this home page component |
| Dependencies | Link | Link to the dependencies modal |

## KnowledgeArticles
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the knowledge article |
| Name | Link | Link to the knowledge article |
| Title | String | Title of the knowledge article |
| Status | String | Status of the knowledge article |
| Url Name | String | URL name of the knowledge article |
| Hardcoded URL? | Boolean | Indicates if the knowledge article has a hardcoded URL |
| Created date | Date Time | Date when the knowledge article was created |
| Modified date | Date Time | Date when the knowledge article was last modified |

## Layouts
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Label | Link | Link to the page layout with its name |
| Type | String | Type of the page layout |

## LightningWebComponents
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the Lightning web component |
| Name | Link | Link to the Lightning web component |
| API Version | Numeric | API version of the Lightning web component |
| Package | String | Package containing the Lightning web component |
| Using | Numeric | Number of references to this Lightning web component |
| Referenced in | Numeric | Number of references to this Lightning web component |
| Dependencies | Link | Link to the dependencies modal |
| Created date | Date Time | Date when the Lightning web component was created |
| Modified date | Date Time | Date when the Lightning web component was last modified |
| Description | String | Description of the Lightning web component |

## Limits
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the limit |
| Label | String | Label of the limit |
| Type | String | Type of the limit |
| Max | Numeric | Maximum allowed value |
| Used | Numeric | Currently used value |
| Used (%) | Percentage | Percentage of used value |
| Remaining | Numeric | Remaining value |

## Objects
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the object |
| Label | Link | Link to the object with its label |
| Name | String | Name of the object |
| Package | String | Package containing the object |
| Custom fields | Numeric | Number of custom fields |
| Page layouts | Numeric | Number of page layouts |
| Record types | Numeric | Number of record types |
| Workflows | Numeric | Number of workflows |
| Apex Triggers | Numeric | Number of Apex triggers |
| Validation Rules | Numeric | Number of validation rules |
| Internal OWD | String | Internal organization-wide default |
| External OWD | String | External organization-wide default |

## Pages
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the page |
| Name | Link | Link to the page |
| Type | String | Type of the page |
| Package | String | Package containing the page |
| Object | Link | Link to the object |
| #Components | Numeric | Number of components |
| #Fields | Numeric | Number of fields |
| #Related Lists | Numeric | Number of related lists |
| Attachment List? | Boolean | Indicates if attachment list is included |
| Lists from Layout? | Boolean | Indicates if lists from layout are included |
| Using | Numeric | Number of references to this page |
| Referenced in | Numeric | Number of references to this page |
| Dependencies | Link | Link to the dependencies modal |
| Created date | Date Time | Date when the page was created |
| Modified date | Date Time | Date when the page was last modified |
| Description | String | Description of the page |

## PermissionSets
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the permission set |
| Name | Link | Link to the permission set |
| Is Group? | Boolean | Indicates if the permission set is a group |
| Custom | Boolean | Indicates if the permission set is custom |
| #FLSs | Numeric | Number of field-level security settings |
| #Object CRUDs | Numeric | Number of object CRUD permissions |
| Is Admin-like? | Boolean | Indicates if the permission set is admin-like |
| Api Enabled | Boolean | Indicates if API is enabled |
| View Setup | Boolean | Indicates if view setup is enabled |
| Modify All Data | Boolean | Indicates if modify all data is enabled |
| View All Data | Boolean | Indicates if view all data is enabled |
| Manage Users | Boolean | Indicates if manage users is enabled |
| Customize Application | Boolean | Indicates if customize application is enabled |
| License | String | License type |
| Package | String | Package containing the permission set |
| #Active users | Numeric | Number of active users |
| Contains | List of URLs | Links to permission sets contained in this group |
| Included in | List of URLs | Links to permission set groups that include this permission set |
| All groups are empty? | Boolean | Indicates if all including groups are empty |
| Created date | Date Time | Date when the permission set was created |
| Modified date | Date Time | Date when the permission set was last modified |
| Description | String | Description of the permission set |

## ProcessBuilders
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the process builder |
| Name | Link | Link to the process builder |
| API Version | Numeric | API version of the process builder |
| Number of versions | Numeric | Number of versions |
| Current Version | Link | Link to the current version |
| Is it Active? | Boolean | Indicates if the current version is active |
| Is it the Latest? | Boolean | Indicates if the current version is the latest |
| Its SObject | String | SObject associated with the process builder |
| Its trigger type | String | Trigger type of the process builder |
| Its Running Mode | String | Running mode of the process builder |
| Its API Version | Numeric | API version of the current version |
| # Nodes | Numeric | Number of nodes |
| # DML Create Nodes | Numeric | Number of DML create nodes |
| # DML Delete Nodes | Numeric | Number of DML delete nodes |
| # DML Update Nodes | Numeric | Number of DML update nodes |
| # Screen Nodes | Numeric | Number of screen nodes |
| Its LFS Violations | List of strings | List of LFS violations |
| Its created date | Date Time | Created date of the current version |
| Its modified date | Date Time | Modified date of the current version |
| Its description | String | Description of the current version |
| Process created date | Date Time | Created date of the process builder |
| Process modified date | Date Time | Modified date of the process builder |
| Using | Numeric | Number of references to this process builder |
| Referenced in | Numeric | Number of references to this process builder |
| Dependencies | Link | Link to the dependencies modal |

## Profiles
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the profile |
| Name | Link | Link to the profile |
| Custom | Boolean | Indicates if the profile is custom |
| #FLSs | Numeric | Number of field-level security settings |
| #Object CRUDs | Numeric | Number of object CRUD permissions |
| Is Admin-like? | Boolean | Indicates if the profile is admin-like |
| Api Enabled | Boolean | Indicates if API is enabled |
| View Setup | Boolean | Indicates if view setup is enabled |
| Modify All Data | Boolean | Indicates if modify all data is enabled |
| View All Data | Boolean | Indicates if view all data is enabled |
| Manage Users | Boolean | Indicates if manage users is enabled |
| Customize Application | Boolean | Indicates if customize application is enabled |
| License | String | License type |
| Package | String | Package containing the profile |
| #Active users | Numeric | Number of active users |
| Created date | Date Time | Date when the profile was created |
| Modified date | Date Time | Date when the profile was last modified |
| Description | String | Description of the profile |

## RecordTypes
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the record type |
| Name | Link | Link to the record type |
| Developer Name | String | Developer name of the record type |
| Package | String | Package containing the record type |
| In this object | Link | Link to the object |
| Object Type | String | Type of the object |
| Is Active | Boolean | Indicates if the record type is active |
| Is Available | Boolean | Indicates if the record type is available |
| Is Default | Boolean | Indicates if the record type is default |
| Is Master | Boolean | Indicates if the record type is master |

## RecordTypesInObject
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the record type |
| Name | Link | Link to the record type |
| Developer Name | String | Developer name of the record type |
| Is Active | Boolean | Indicates if the record type is active |
| Is Available | Boolean | Indicates if the record type is available |
| Is Default | Boolean | Indicates if the record type is default |
| Is Master | Boolean | Indicates if the record type is master |

## Reports
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the report |
| Name | Link | Link to the report |
| Developer Name | String | Developer name of the report |
| Package | String | Package containing the report |
| Format | String | Format of the report |
| Last run | Date Time | Date when the report was last run |
| Last viewed | Date Time | Date when the report was last viewed |
| Last referenced | Date Time | Date when the report was last referenced |
| Created date | Date Time | Date when the report was created |
| Modified date | Date Time | Date when the report was last modified |
| Description | String | Description of the report |
| Folder | String | Folder containing the report |

## Roles
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the role |
| Name | Link | Link to the role |
| Developer Name | String | Developer name of the role |
| Number of active members | Numeric | Number of active members |
| Level | Numeric | Level of the role |
| Parent | Link | Link to the parent role |

## StaticResources
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the static resource |
| Name | Link | Link to the static resource |
| Package | String | Package containing the static resource |
| Content Type | String | Content type of the static resource |
| Created date | Date Time | Date when the static resource was created |
| Modified date | Date Time | Date when the static resource was last modified |
| Using | Numeric | Number of references to this static resource |
| Referenced in | Numeric | Number of references to this static resource |
| Dependencies | Link | Link to the dependencies modal |
| Description | String | Description of the static resource |

## Users
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the user |
| User Name | Link | Link to the user |
| Under LEX? | Boolean | Indicates if the user is under Lightning Experience |
| Last login | Date Time | Date when the user last logged in |
| Failed logins | Numeric | Number of failed logins |
| Has MFA by-pass? | Boolean | Indicates if the user has MFA bypass |
| Has Debug mode? | Boolean | Indicates if the user has debug mode |
| #SF Logins w/o MFA | Numeric | Number of Salesforce logins without MFA |
| #SF Logins w/ MFA | Numeric | Number of Salesforce logins with MFA |
| #SSO Logins | Numeric | Number of SSO logins |
| Password change | Date Time | Date when the password was changed |
| Is Admin-like? | Boolean | Indicates if the user is admin-like |
| Api Enabled | Boolean | Indicates if API is enabled |
| Api Enabled from | List of URLs | Links to permissions granted by |
| View Setup | Boolean | Indicates if view setup is enabled |
| View Setup from | List of URLs | Links to permissions granted by |
| Modify All Data | Boolean | Indicates if modify all data is enabled |
| Modify All Data from | List of URLs | Links to permissions granted by |
| View All Data | Boolean | Indicates if view all data is enabled |
| View All Data from | List of URLs | Links to permissions granted by |
| Manage Users | Boolean | Indicates if manage users is enabled |
| Manage Users from | List of URLs | Links to permissions granted by |
| Customize App. | Boolean | Indicates if customize application is enabled |
| Customize App. from | List of URLs | Links to permissions granted by |
| Profile | Link | Link to the profile |
| Permission Sets | List of URLs | Links to permission sets |

## ValidationRules
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the validation rule |
| Name | Link | Link to the validation rule |
| Package | String | Package containing the validation rule |
| Object API Name | String | API name of the object |
| Object Name | Link | Link to the object |
| Object Type | String | Type of the object |
| Is Active | Boolean | Indicates if the validation rule is active |
| Display On Field | String | Field on which the error is displayed |
| Error Message | String | Error message displayed |
| Description | String | Description of the validation rule |
| Created date | Date Time | Date when the validation rule was created |
| Modified date | Date Time | Date when the validation rule was last modified |

## Workflows
[Back to top](#Table%20of%20Contents)

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | Numeric | Row index |
| Score | Score | Score assigned to the workflow |
| Name | Link | Link to the workflow |
| Is Active | Boolean | Indicates if the workflow is active |
| Has Actions | Boolean | Indicates if the workflow has actions |
| Direct Actions | OBJS | Direct actions |
| Empty Timetrigger | OBJS | Empty time triggers |
| Future Actions | OBJS | Future actions |
| Created date | Date Time | Date when the workflow was created |
| Modified date | Date Time | Date when the workflow was last modified |
| Description | String | Description of the workflow |
