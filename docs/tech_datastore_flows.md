---
layout: default
title: Data Store "Flows" in OrgCheck  
permalink: /technical/datastores/flows/
---

# Data Store "Flows"

## Approach

Currently, the information about **Flows** is retrieved using the **Tooling API**.

As specified in the documentation, the fields **FullName** and **Metadata** from the object **Flow**,
can be retrieved only if the query is returning one unique record.

So the only way to do this (with that API) is to get all the IDs first and then to query the object one by
one.

In the future we will challenge this by using the **Metadata API**.

## Metadata information of Flows

### Where is the information in Salesforce?

In the Tooling API, the metadata information for Flows is located on the object **Flow**.

### How OrgCheck is retreiving the information?

In OrgCheck we will run the following query on the **Tooling API**:

```SQL
SELECT Id, FullName, DefinitionId, MasterLabel, 
   VersionNumber, Metadata, Status, Description, 
   ProcessType 
FROM Flow 
WHERE Id = <ID>
```

Additionaly to the fields described in the SOQL query, we will use the following information 
in the **Metadata** field:
- Metadata.recordCreates
- Metadata.processMetadataValues

For each record that returns this query, we will do the following mapping:

| OrgCheck field                   | Formula                                                                                  |
| -------------------------------- | ---------------------------------------------------------------------------------------- |
| id                               | simplifySalesforceId(**Id**)                                                             |
| name                             | **FullName**                                                                             |
| definitionId                     | simplifySalesforceId(**DefinitionId**)                                                   |
| definitionName                   | **MasterLabel**                                                                          |
| dmlCreates                       | **Metadata.recordCreates.length** (0 if the object is null)                              |
| dmlDeletes                       | **Metadata.recordDeletes.length**0 by default (if null)                                  |
| dmlUpdates                       | **Metadata.recordUpdates.length**0 by default (if null)                                  |
| isActive                         | true if Status = 'Active', false otherwise                                               |
| description                      | **Description**                                                                          |
| type                             | **ProcessType**                                                                          |
| sobject                          | **Metadata.processMetadataValues[]** filter(e.name = 'ObjectType') return e.stringValue  |
| triggerType                      | **Metadata.processMetadataValues[]** filter(e.name = 'TriggerType') return e.stringValue |

