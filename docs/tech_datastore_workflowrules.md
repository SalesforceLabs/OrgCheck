---
layout: default
title: Data Store "Workflow Rules" in OrgCheck  
permalink: /technical/datastores/workflowrules
---

# Data Store "WorkflowRules"

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
