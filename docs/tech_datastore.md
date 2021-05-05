---
layout: default
title: Data Stores in OrgCheck  
permalink: /technical/datastores/
---

# Data Stores in OrgCheck

**OrgCheck** is retrieving data from Salesforce using the REST API, the Tooling API, and the Dependency API.
That information is called **Data Stores** and is cached in your browser local cache.

## Workflow Rules

1. Get the list of Salesforce ID of all Workflow Rules in the org from the Tooling API:
```SQL
SELECT Id
FROM WorkflowRule
```

2. Get the metadata information for each Workflow Rule based on the previous IDs from the Tooling API:
```SQL
SELECT Id, FullName, Metadata 
FROM WorkflowRule 
WHERE Id = <ID>
```

3. Mapping is the following:

| Extract                       | Transformation         | Load          |
| ----------------------------- | ---------------------- | ------------- |
| Id                            | simplifySalesforceId() | id            |
| FullName                      |                        | name          |
| Metadata.description          |                        | description   |
| Metadata.actions              |                        | actions       |
| Metadata.workflowTimeTriggers |                        | futureActions |
| Metadata.active               |                        | isActive      |


## Flows

1. Get the list of Salesforce ID of all Flows in the org from the Tooling API:
```SQL
SELECT Id
FROM Flow
```

2. Get the metadata information for each Flow based on the previous IDs from the Tooling API:
```SQL
SELECT Id, FullName, DefinitionId, MasterLabel, VersionNumber, Metadata, Status, Description, ProcessType 
FROM Flow 
WHERE Id = <ID>
```

3. Mapping is the following:

| Extract                          | Transformation                                       | Load           |
| -------------------------------- | ---------------------------------------------------- | -------------- |
| Id                               | simplifySalesforceId()                               | id             |
| FullName                         |                                                      | name           |
| DefinitionId                     | simplifySalesforceId()                               | definitionId   |
| MasterLabel                      |                                                      | definitionName |
| Metadata.recordCreates.length    | 0 by default (if null)                               | dmlCreates     |
| Metadata.recordDeletes.length    | 0 by default (if null)                               | dmlDeletes     |
| Metadata.recordUpdates.length    | 0 by default (if null)                               | dmlUpdates     |
| Status                           | === 'Active' ?                                       | isActive       |
| Description                      |                                                      | description    |
| ProcessType                      |                                                      | type           |
| Metadata.processMetadataValues[] | forEach(if(name==='ObjectType') return stringValue)  | sobject        |
| Metadata.processMetadataValues[] | forEach(if(name==='TriggerType') return stringValue) | triggerType    |


## Packages
TODO

## CustomLabels
TODO

## CustomSettings
TODO

## VisualforcePages
TODO

## VisualforceComponents
TODO

## ApexClasses
TODO

## ApexTriggers
TODO

## StaticResources
TODO

## LightningPages
TODO

## LightningWebComponents
TODO

## AuraComponents
TODO

## Users
TODO

## Profiles
TODO

## ProfileLoginRestrictions
TODO

## PermissionSets
TODO

## PermissionSetAssignments
TODO

## Roles
TODO

## PublicGroups
TODO

## Objects
TODO

## Batches
TODO

## CustomObjects
TODO

## CustomFields
TODO

## OrgWideDefaults
TODO
