---
layout: default
title: Data Store "Workflow Rules" in OrgCheck  
permalink: /technical/datastores/workflowrules/
---

# Data Store "WorkflowRules"

## Approach

Currently, the information about **Workflow Rules** is retrieved using the **Tooling API**.

As specified in the documentation, the fields **FullName** and **Metadata** from the object **WorkflowRule**,
can be retrieved only if the query is returning one unique record.

So the only way to do this (with that API) is to get all the IDs first and then to query the object one by
one.

## Step 1: List of Salesforce ID

Get the list of Salesforce ID of all Workflow Rules in the org from the Tooling API:

```SQL
SELECT Id
FROM WorkflowRule
```

## Step 2: Get information for each previous Salesforce ID

Get the metadata information for each Workflow Rule based on the previous IDs from the Tooling API:

```SQL
SELECT Id, FullName, Metadata 
FROM WorkflowRule 
WHERE Id = <ID>
```

## Step 3: Mapping

| Extract                       | Transformation         | Load          |
| ----------------------------- | ---------------------- | ------------- |
| Id                            | simplifySalesforceId() | id            |
| FullName                      |                        | name          |
| Metadata.description          |                        | description   |
| Metadata.actions              |                        | actions       |
| Metadata.workflowTimeTriggers |                        | futureActions |
| Metadata.active               |                        | isActive      |
