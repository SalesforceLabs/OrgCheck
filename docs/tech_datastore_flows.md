---
layout: default
title: Data Store "Flows" in OrgCheck  
permalink: /technical/datastores/flows/
---

# Data Store "Flows"

## Step 1: List of Salesforce ID

Get the list of Salesforce ID of all Flows in the org from the Tooling API:

```SQL
SELECT Id
FROM Flow
```

## Step 2: Get information for each previous Salesforce ID

Get the metadata information for each Flow based on the previous IDs from the Tooling API:

```SQL
SELECT Id, FullName, DefinitionId, MasterLabel, 
   VersionNumber, Metadata, Status, Description, 
   ProcessType 
FROM Flow 
WHERE Id = <ID>
```

## Step 3: Mapping

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

