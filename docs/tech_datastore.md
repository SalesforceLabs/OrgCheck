# Datastores in OrgCheck

## Workflow Rules

1. Get the list of Salesforce ID of all Workflow Rule in the org from the Tooling API:
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
TODO

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
