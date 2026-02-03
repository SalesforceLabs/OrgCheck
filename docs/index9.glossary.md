---
layout: default
title: Glossary
permalink: /glossary/
mermaid: true
---

# Glossary of Table Definitions

This document explains the column definitions for each table in the Org Check application.

## FieldSets

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Label | URL | Link to the field set with its label |
| Description | TXT | Description of the field set |

## Layouts

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Label | URL | Link to the page layout with its name |
| Type | TXT | Type of the page layout |

## Limits

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the limit |
| Label | TXT | Label of the limit |
| Type | TXT | Type of the limit |
| Max | NUM | Maximum allowed value |
| Used | NUM | Currently used value |
| Used (%) | PRC | Percentage of used value |
| Remaining | NUM | Remaining value |

## ValidationRules

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the validation rule |
| Name | URL | Link to the validation rule |
| Package | TXT | Package containing the validation rule |
| Object API Name | TXT | API name of the object |
| Object Name | URL | Link to the object |
| Object Type | TXT | Type of the object |
| Is Active | CHK | Indicates if the validation rule is active |
| Display On Field | TXT | Field on which the error is displayed |
| Error Message | TXT | Error message displayed |
| Description | TXT | Description of the validation rule |
| Created date | DTM | Date when the validation rule was created |
| Modified date | DTM | Date when the validation rule was last modified |

## WebLinks

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the web link |
| Name | URL | Link to the web link |
| Package | TXT | Package containing the web link |
| In this object | URL | Link to the object |
| Object Type | TXT | Type of the object |
| Hardcoded URLs | TXTS | List of hardcoded URLs |
| Hardcoded IDs | TXTS | List of hardcoded IDs |
| Type | TXT | Type of the web link |
| Behavior | TXT | Behavior of the web link |
| Created date | DTM | Date when the web link was created |
| Modified date | DTM | Date when the web link was last modified |
| Using | NUM | Number of references to this web link |
| Referenced in | NUM | Number of references to this web link |
| Ref. in Layout? | NUM | Number of references in page layouts |
| Dependencies | DEP | List of dependencies |
| Description | TXT | Description of the web link |

## CustomFields

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the custom field |
| Field | URL | Link to the custom field |
| Label | TXT | Label of the custom field |
| Object API Name | TXT | API name of the object |
| Object Name | URL | Link to the object |
| Object Type | TXT | Type of the object |
| Package | TXT | Package containing the custom field |
| Type | TXT | Type of the custom field |
| Length | TXT | Length of the custom field |
| Unique? | CHK | Indicates if the field is unique |
| Encrypted? | CHK | Indicates if the field is encrypted |
| External? | CHK | Indicates if the field is external ID |
| Indexed? | CHK | Indicates if the field is indexed |
| Restricted? | CHK | Indicates if the field is restricted picklist |
| Tooltip | TXT | Tooltip of the custom field |
| Formula | TXT | Formula of the custom field |
| Hardcoded URLs | TXTS | List of hardcoded URLs |
| Hardcoded IDs | TXTS | List of hardcoded IDs |
| Default Value | TXT | Default value of the custom field |
| Using | NUM | Number of references to this custom field |
| Referenced in | NUM | Number of references to this custom field |
| Ref. in Layout? | NUM | Number of references in page layouts |
| Ref. in Apex Class? | NUM | Number of references in Apex classes |
| Ref. in Flow? | NUM | Number of references in flows |
| Dependencies | DEP | List of dependencies |
| Created date | DTM | Date when the custom field was created |
| Modified date | DTM | Date when the custom field was last modified |
| Description | TXT | Description of the custom field |

## ApexClasses

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the Apex class |
| Name | URL | Link to the Apex class |
| API Version | NUM | API version of the Apex class |
| Package | TXT | Package containing the Apex class |
| Class | CHK | Indicates if it's a class |
| Abst. | CHK | Indicates if it's abstract |
| Intf. | CHK | Indicates if it's an interface |
| Enum | CHK | Indicates if it's an enum |
| Schdl. | CHK | Indicates if it's schedulable |
| Access | TXT | Access level |
| Implements | TXTS | Interfaces implemented |
| Extends | TXT | Class extended |
| Size | NUM | Size of the class |
| Hardcoded URLs | TXTS | List of hardcoded URLs |
| Hardcoded IDs | TXTS | List of hardcoded IDs |
| Methods | NUM | Number of methods |
| Inner Classes | NUM | Number of inner classes |
| Annotations | TXTS | Annotations used |
| Sharing | TXT | Sharing model |
| Scheduled | CHK | Indicates if it's scheduled |
| Coverage (>75%) | PRC | Code coverage percentage |
| Editable Related Tests | URLS | Links to related test classes |
| Using | NUM | Number of references to this Apex class |
| Referenced in | NUM | Number of references to this Apex class |
| Dependencies | DEP | List of dependencies |
| Created date | DTM | Date when the Apex class was created |
| Modified date | DTM | Date when the Apex class was last modified |

## Profiles

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the profile |
| Name | URL | Link to the profile |
| Custom | CHK | Indicates if the profile is custom |
| #FLSs | NUM | Number of field-level security settings |
| #Object CRUDs | NUM | Number of object CRUD permissions |
| Is Admin-like? | CHK | Indicates if the profile is admin-like |
| Api Enabled | CHK | Indicates if API is enabled |
| View Setup | CHK | Indicates if view setup is enabled |
| Modify All Data | CHK | Indicates if modify all data is enabled |
| View All Data | CHK | Indicates if view all data is enabled |
| Manage Users | CHK | Indicates if manage users is enabled |
| Customize Application | CHK | Indicates if customize application is enabled |
| License | TXT | License type |
| Package | TXT | Package containing the profile |
| #Active users | NUM | Number of active users |
| Created date | DTM | Date when the profile was created |
| Modified date | DTM | Date when the profile was last modified |
| Description | TXT | Description of the profile |

## PermissionSets

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the permission set |
| Name | URL | Link to the permission set |
| Is Group? | CHK | Indicates if the permission set is a group |
| Custom | CHK | Indicates if the permission set is custom |
| #FLSs | NUM | Number of field-level security settings |
| #Object CRUDs | NUM | Number of object CRUD permissions |
| Is Admin-like? | CHK | Indicates if the permission set is admin-like |
| Api Enabled | CHK | Indicates if API is enabled |
| View Setup | CHK | Indicates if view setup is enabled |
| Modify All Data | CHK | Indicates if modify all data is enabled |
| View All Data | CHK | Indicates if view all data is enabled |
| Manage Users | CHK | Indicates if manage users is enabled |
| Customize Application | CHK | Indicates if customize application is enabled |
| License | TXT | License type |
| Package | TXT | Package containing the permission set |
| #Active users | NUM | Number of active users |
| Contains | URLS | Links to permission sets contained in this group |
| Included in | URLS | Links to permission set groups that include this permission set |
| All groups are empty? | CHK | Indicates if all including groups are empty |
| Created date | DTM | Date when the permission set was created |
| Modified date | DTM | Date when the permission set was last modified |
| Description | TXT | Description of the permission set |

## Objects

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the object |
| Label | URL | Link to the object with its label |
| Name | TXT | Name of the object |
| Package | TXT | Package containing the object |
| Custom fields | NUM | Number of custom fields |
| Page layouts | NUM | Number of page layouts |
| Record types | NUM | Number of record types |
| Workflows | NUM | Number of workflows |
| Apex Triggers | NUM | Number of Apex triggers |
| Validation Rules | NUM | Number of validation rules |
| Internal OWD | TXT | Internal organization-wide default |
| External OWD | TXT | External organization-wide default |

## Flows

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the flow |
| Name | URL | Link to the flow |
| API Version | NUM | API version of the flow |
| Type | TXT | Type of the flow |
| Number of versions | NUM | Number of versions |
| Current Version | URL | Link to the current version |
| Is it Active? | CHK | Indicates if the current version is active |
| Is it the Latest? | CHK | Indicates if the current version is the latest |
| Its SObject | TXT | SObject associated with the flow |
| Its trigger type | TXT | Trigger type of the flow |
| Its record trigger type | TXT | Record trigger type of the flow |
| Its Running Mode | TXT | Running mode of the flow |
| Its API Version | NUM | API version of the current version |
| # Nodes | NUM | Number of nodes |
| # DML Create Nodes | NUM | Number of DML create nodes |
| # DML Delete Nodes | NUM | Number of DML delete nodes |
| # DML Update Nodes | NUM | Number of DML update nodes |
| # Screen Nodes | NUM | Number of screen nodes |
| Its LFS Violations | TXTS | List of LFS violations |
| Its created date | DTM | Created date of the current version |
| Its modified date | DTM | Modified date of the current version |
| Its description | TXT | Description of the current version |
| Flow created date | DTM | Created date of the flow |
| Flow modified date | DTM | Modified date of the flow |
| Flow description | TXT | Description of the flow |
| Using | NUM | Number of references to this flow |
| Referenced in | NUM | Number of references to this flow |
| Dependencies | DEP | List of dependencies |

## Reports

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the report |
| Name | URL | Link to the report |
| Developer Name | TXT | Developer name of the report |
| Package | TXT | Package containing the report |
| Format | TXT | Format of the report |
| Last run | DTM | Date when the report was last run |
| Last viewed | DTM | Date when the report was last viewed |
| Last referenced | DTM | Date when the report was last referenced |
| Created date | DTM | Date when the report was created |
| Modified date | DTM | Date when the report was last modified |
| Description | TXT | Description of the report |
| Folder | TXT | Folder containing the report |

## Dashboards

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the dashboard |
| Title | URL | Link to the dashboard |
| Developer Name | TXT | Developer name of the dashboard |
| Package | TXT | Package containing the dashboard |
| Type | TXT | Type of the dashboard |
| Last viewed | DTM | Date when the dashboard was last viewed |
| Last referenced | DTM | Date when the dashboard was last referenced |
| Refreshed | DTM | Date when the dashboard was refreshed |
| Created date | DTM | Date when the dashboard was created |
| Modified date | DTM | Date when the dashboard was last modified |
| Description | TXT | Description of the dashboard |
| Folder | TXT | Folder containing the dashboard |

## CustomLabels

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the custom label |
| Name | URL | Link to the custom label |
| Package | TXT | Package containing the custom label |
| Label | TXT | Label of the custom label |
| Category | TXT | Category of the custom label |
| Language | TXT | Language of the custom label |
| Protected? | CHK | Indicates if the custom label is protected |
| Using | NUM | Number of references to this custom label |
| Referenced in | NUM | Number of references to this custom label |
| Ref. in Layout? | NUM | Number of references in page layouts |
| Ref. in Apex Class? | NUM | Number of references in Apex classes |
| Ref. in Flow? | NUM | Number of references in flows |
| Dependencies | DEP | List of dependencies |
| Created date | DTM | Date when the custom label was created |
| Modified date | DTM | Date when the custom label was last modified |
| Value | TXT | Value of the custom label |

## Pages

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the page |
| Name | URL | Link to the page |
| Type | TXT | Type of the page |
| Package | TXT | Package containing the page |
| Object | URL | Link to the object |
| #Components | NUM | Number of components |
| #Fields | NUM | Number of fields |
| #Related Lists | NUM | Number of related lists |
| Attachment List? | CHK | Indicates if attachment list is included |
| Lists from Layout? | CHK | Indicates if lists from layout are included |
| Using | NUM | Number of references to this page |
| Referenced in | NUM | Number of references to this page |
| Dependencies | DEP | List of dependencies |
| Created date | DTM | Date when the page was created |
| Modified date | DTM | Date when the page was last modified |
| Description | TXT | Description of the page |

## CustomTabs

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the custom tab |
| Name | URL | Link to the custom tab |
| Package | TXT | Package containing the custom tab |
| Type | TXT | Type of the custom tab |
| Hardcoded URLs | TXTS | List of hardcoded URLs |
| Hardcoded IDs | TXTS | List of hardcoded IDs |
| Created date | DTM | Date when the custom tab was created |
| Modified date | DTM | Date when the custom tab was last modified |
| Using | NUM | Number of references to this custom tab |
| Referenced in | NUM | Number of references to this custom tab |
| Dependencies | DEP | List of dependencies |
| Description | TXT | Description of the custom tab |

## Documents

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the document |
| Name | URL | Link to the document |
| Package | TXT | Package containing the document |
| Folder | TXT | Folder containing the document |
| Document URL | TXT | URL of the document |
| Size (bytes) | NUM | Size of the document in bytes |
| Type | TXT | Type of the document |
| Created date | DTM | Date when the document was created |
| Modified date | DTM | Date when the document was last modified |
| Description | TXT | Description of the document |

## EmailTemplates

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the email template |
| Name | URL | Link to the email template |
| API Version | NUM | API version of the email template |
| Package | TXT | Package containing the email template |
| UI Type | TXT | UI type of the email template |
| Type | TXT | Type of the email template |
| Folder | TXT | Folder containing the email template |
| Is Active | CHK | Indicates if the email template is active |
| Last Used | DTM | Date when the email template was last used |
| Used | NUM | Number of times used |
| Hardcoded URLs | TXTS | List of hardcoded URLs |
| Hardcoded IDs | TXTS | List of hardcoded IDs |
| Created date | DTM | Date when the email template was created |
| Modified date | DTM | Date when the email template was last modified |
| Description | TXT | Description of the email template |

## StaticResources

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the static resource |
| Name | URL | Link to the static resource |
| Package | TXT | Package containing the static resource |
| Content Type | TXT | Content type of the static resource |
| Created date | DTM | Date when the static resource was created |
| Modified date | DTM | Date when the static resource was last modified |
| Using | NUM | Number of references to this static resource |
| Referenced in | NUM | Number of references to this static resource |
| Dependencies | DEP | List of dependencies |
| Description | TXT | Description of the static resource |

## ChatterGroups

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the chatter group |
| Group | URL | Link to the chatter group |
| Description | TXT | Description of the chatter group |
| Hardcoded URLs | TXTS | List of hardcoded URLs |
| Hardcoded IDs | TXTS | List of hardcoded IDs |

## Users

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the user |
| User Name | URL | Link to the user |
| Under LEX? | CHK | Indicates if the user is under Lightning Experience |
| Last login | DTM | Date when the user last logged in |
| Failed logins | NUM | Number of failed logins |
| Has MFA by-pass? | CHK | Indicates if the user has MFA bypass |
| Has Debug mode? | CHK | Indicates if the user has debug mode |
| #SF Logins w/o MFA | NUM | Number of Salesforce logins without MFA |
| #SF Logins w/ MFA | NUM | Number of Salesforce logins with MFA |
| #SSO Logins | NUM | Number of SSO logins |
| Password change | DTM | Date when the password was changed |
| Is Admin-like? | CHK | Indicates if the user is admin-like |
| Api Enabled | CHK | Indicates if API is enabled |
| Api Enabled from | URLS | Links to permissions granted by |
| View Setup | CHK | Indicates if view setup is enabled |
| View Setup from | URLS | Links to permissions granted by |
| Modify All Data | CHK | Indicates if modify all data is enabled |
| Modify All Data from | URLS | Links to permissions granted by |
| View All Data | CHK | Indicates if view all data is enabled |
| View All Data from | URLS | Links to permissions granted by |
| Manage Users | CHK | Indicates if manage users is enabled |
| Manage Users from | URLS | Links to permissions granted by |
| Customize App. | CHK | Indicates if customize application is enabled |
| Customize App. from | URLS | Links to permissions granted by |
| Profile | URL | Link to the profile |
| Permission Sets | URLS | Links to permission sets |

## Roles

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the role |
| Name | URL | Link to the role |
| Developer Name | TXT | Developer name of the role |
| Number of active members | NUM | Number of active members |
| Level | NUM | Level of the role |
| Parent | URL | Link to the parent role |

## Workflows

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the workflow |
| Name | URL | Link to the workflow |
| Is Active | CHK | Indicates if the workflow is active |
| Has Actions | CHK | Indicates if the workflow has actions |
| Direct Actions | OBJS | Direct actions |
| Empty Timetrigger | OBJS | Empty time triggers |
| Future Actions | OBJS | Future actions |
| Created date | DTM | Date when the workflow was created |
| Modified date | DTM | Date when the workflow was last modified |
| Description | TXT | Description of the workflow |

## ApexTriggers

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the Apex trigger |
| Name | URL | Link to the Apex trigger |
| API Version | NUM | API version of the Apex trigger |
| Package | TXT | Package containing the Apex trigger |
| Size | NUM | Size of the trigger |
| Hardcoded URLs | TXTS | List of hardcoded URLs |
| Hardcoded IDs | TXTS | List of hardcoded IDs |
| Object API Name | TXT | API name of the object |
| Object Name | URL | Link to the object |
| Active? | CHK | Indicates if the trigger is active |
| Has SOQL? | CHK | Indicates if the trigger has SOQL |
| Has DML? | CHK | Indicates if the trigger has DML |
| *Insert | CHK | Indicates if before insert is used |
| Insert* | CHK | Indicates if after insert is used |
| *Update | CHK | Indicates if before update is used |
| Update* | CHK | Indicates if after update is used |
| *Delete | CHK | Indicates if before delete is used |
| Delete* | CHK | Indicates if after delete is used |
| Undelete | CHK | Indicates if after undelete is used |
| Using | NUM | Number of references to this Apex trigger |
| Dependencies | DEP | List of dependencies |
| Created date | DTM | Date when the Apex trigger was created |
| Modified date | DTM | Date when the Apex trigger was last modified |

## KnowledgeArticles

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the knowledge article |
| Name | URL | Link to the knowledge article |
| Title | TXT | Title of the knowledge article |
| Status | TXT | Status of the knowledge article |
| Url Name | TXT | URL name of the knowledge article |
| Hardcoded URL? | CHK | Indicates if the knowledge article has a hardcoded URL |
| Created date | DTM | Date when the knowledge article was created |
| Modified date | DTM | Date when the knowledge article was last modified |

## LightningWebComponents

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the Lightning web component |
| Name | URL | Link to the Lightning web component |
| API Version | NUM | API version of the Lightning web component |
| Package | TXT | Package containing the Lightning web component |
| Using | NUM | Number of references to this Lightning web component |
| Referenced in | NUM | Number of references to this Lightning web component |
| Dependencies | DEP | List of dependencies |
| Created date | DTM | Date when the Lightning web component was created |
| Modified date | DTM | Date when the Lightning web component was last modified |
| Description | TXT | Description of the Lightning web component |

## AuraComponents

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the Aura component |
| Name | URL | Link to the Aura component |
| API Version | NUM | API version of the Aura component |
| Package | TXT | Package containing the Aura component |
| Using | NUM | Number of references to this Aura component |
| Referenced in | NUM | Number of references to this Aura component |
| Dependencies | DEP | List of dependencies |
| Created date | DTM | Date when the Aura component was created |
| Modified date | DTM | Date when the Aura component was last modified |
| Description | TXT | Description of the Aura component |

## ProcessBuilders

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the process builder |
| Name | URL | Link to the process builder |
| API Version | NUM | API version of the process builder |
| Number of versions | NUM | Number of versions |
| Current Version | URL | Link to the current version |
| Is it Active? | CHK | Indicates if the current version is active |
| Is it the Latest? | CHK | Indicates if the current version is the latest |
| Its SObject | TXT | SObject associated with the process builder |
| Its trigger type | TXT | Trigger type of the process builder |
| Its Running Mode | TXT | Running mode of the process builder |
| Its API Version | NUM | API version of the current version |
| # Nodes | NUM | Number of nodes |
| # DML Create Nodes | NUM | Number of DML create nodes |
| # DML Delete Nodes | NUM | Number of DML delete nodes |
| # DML Update Nodes | NUM | Number of DML update nodes |
| # Screen Nodes | NUM | Number of screen nodes |
| Its LFS Violations | TXTS | List of LFS violations |
| Its created date | DTM | Created date of the current version |
| Its modified date | DTM | Modified date of the current version |
| Its description | TXT | Description of the current version |
| Process created date | DTM | Created date of the process builder |
| Process modified date | DTM | Modified date of the process builder |
| Using | NUM | Number of references to this process builder |
| Referenced in | NUM | Number of references to this process builder |
| Dependencies | DEP | List of dependencies |

## HomePageComponents

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the home page component |
| Name | URL | Link to the home page component |
| Package | TXT | Package containing the home page component |
| Is Body Empty? | CHK | Indicates if the body is empty |
| Hardcoded URLs | TXTS | List of hardcoded URLs |
| Hardcoded IDs | TXTS | List of hardcoded IDs |
| Created date | DTM | Date when the home page component was created |
| Modified date | DTM | Date when the home page component was last modified |
| Using | NUM | Number of references to this home page component |
| Referenced in | NUM | Number of references to this home page component |
| Dependencies | DEP | List of dependencies |

## CustomFieldsInObject

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the custom field |
| Field | URL | Link to the custom field |
| Label | TXT | Label of the custom field |
| Package | TXT | Package containing the custom field |
| Type | TXT | Type of the custom field |
| Length | TXT | Length of the custom field |
| Unique? | CHK | Indicates if the field is unique |
| Encrypted? | CHK | Indicates if the field is encrypted |
| External? | CHK | Indicates if the field is external ID |
| Indexed? | CHK | Indicates if the field is indexed |
| Restricted? | CHK | Indicates if the field is restricted picklist |
| Tooltip | TXT | Tooltip of the custom field |
| Formula | TXT | Formula of the custom field |
| Hardcoded URLs | TXTS | List of hardcoded URLs |
| Hardcoded IDs | TXTS | List of hardcoded IDs |
| Default Value | TXT | Default value of the custom field |
| Using | NUM | Number of references to this custom field |
| Referenced in | NUM | Number of references to this custom field |
| Ref. in Layout? | NUM | Number of references in page layouts |
| Ref. in Apex Class? | NUM | Number of references in Apex classes |
| Ref. in Flow? | NUM | Number of references in flows |
| Dependencies | DEP | List of dependencies |
| Created date | DTM | Date when the custom field was created |
| Modified date | DTM | Date when the custom field was last modified |
| Description | TXT | Description of the custom field |

## RecordTypes

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the record type |
| Name | URL | Link to the record type |
| Developer Name | TXT | Developer name of the record type |
| Package | TXT | Package containing the record type |
| In this object | URL | Link to the object |
| Object Type | TXT | Type of the object |
| Is Active | CHK | Indicates if the record type is active |
| Is Available | CHK | Indicates if the record type is available |
| Is Default | CHK | Indicates if the record type is default |
| Is Master | CHK | Indicates if the record type is master |

## RecordTypesInObject

| Column Label | Column Type | Description |
|--------------|-------------|-------------|
| # | IDX | Row index |
| Score | SCR | Score assigned to the record type |
| Name | URL | Link to the record type |
| Developer Name | TXT | Developer name of the record type |
| Is Active | CHK | Indicates if the record type is active |
| Is Available | CHK | Indicates if the record type is available |
| Is Default | CHK | Indicates if the record type is default |
| Is Master | CHK | Indicates if the record type is master |
