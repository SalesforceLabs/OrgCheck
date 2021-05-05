---
layout: default
title: Data Store "Packages" in OrgCheck  
permalink: /technical/datastores/packages/
---

# Data Store "Packages"

## Approach

Currently, the information about **Packages** is retrieved from two sources.
One source is the installed packages (using the **Tooling API**).
Another source is the current namespace setup in the org (using the **REST API**). 
Most of the time, the namespace of the org is empty, unless you specifically set it.

## Step 1: List of Installed Packages

Get the list of all Installed Packages in the org from the Tooling API:

```SQL
SELECT Id, SubscriberPackage.NamespacePrefix, SubscriberPackage.Name 
FROM InstalledSubscriberPackage
```

## Step 2: Get the namespace of the local Organization

Get the global namespace used in the organization from the REST API -- this information can be empty:

```SQL
SELECT NamespacePrefix 
FROM Organization
```

## Step 3: Mapping

| Step # | Extract                           | Transformation         | Load       |
| ------ | --------------------------------- | ---------------------- | ---------- |
|:   1  :| Id                                |                        | id         |
|:   1  :| SubscriberPackage.Name            |                        | name       |
|:   1  :| SubscriberPackage.NamespacePrefix |                        | namespace  |
|:   1  :|                                   | ="Installed"           | type       |
|:   2  :| NamespacePrefix                   |                        | id         |
|:   2  :| NamespacePrefix                   |                        | name       |
|:   2  :| NamespacePrefix                   |                        | namespace  |
|:   2  :|                                   | ="Local"               | type       |
