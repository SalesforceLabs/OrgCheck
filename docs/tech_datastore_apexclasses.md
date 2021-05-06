---
layout: default
title: Data Store "ApexClasses" in OrgCheck  
permalink: /technical/datastores/apexclasses/
---

# Data Store "ApexClasses"

## Approach

Currently, the information about **Apex Classes** is retrieved using the **Tooling API**.

We run two queries in parallel to get (1) the **code coverage** for each apex class and (2) 
the **metadata information** for each apex class.


## Step 1: Code coverage

Everytime you run an Apex Unit Test, Salesforce stores the result of each test method as 
a set of records in the table **ApexCodeCoverage**.

Each record does not represent the global code coverage of a specific class, but rather
the code coverage for a specific test method and a specific apex class.

For example, if you run a unit test with two methods (A and B). When method A runs, lines 
of code in Apex classes X, Y and Z will be covered and the rest uncovered.
When method B runs, some lines in X, Y and Z will be covered (hopefully not exactly the 
same ones when method A was run).

In that example, you will have 6 lines in the table ApexCodeCoverage:
1. information about the code coverage of lines in Apex class X when running method A.
2. information about the code coverage of lines in Apex class Y when running method A.
3. information about the code coverage of lines in Apex class Z when running method A.
4. information about the code coverage of lines in Apex class X when running method B.
5. information about the code coverage of lines in Apex class Y when running method B.
6. information about the code coverage of lines in Apex class Z when running method B.

Every record in ApexCodeCoverage has the count of lines covered and uncovered. It has 
also the detail of the lines covered and uncovered (like line #1 was covered, line #2 
was not covered, etc.)

Salesforce has, then, all the information to check if one line of code from a specific class 
was at least covered by one test method. And finally, Salesforce can compute the global
percentage of lines that are covered for a specific class.

In OrgCheck, we calculate a "lazy" code coverage, by just compute the average of covered 
line for each test method. It is faster. It gives a quick idea of the coverage. It is 
not quite the same as the one Salesforce calculates. 

To do so we only need to query this:

```SQL
SELECT ApexClassOrTriggerId, NumLinesCovered, NumLinesUncovered 
FROM ApexCodeCoverage
```

## Step 2: Get information for Apex Classes

The metadata information for ApexClasses are located in two locations. The information
that do not require compilation is available as simple field (like **ApiVersion**, 
**Body**, ...). Then the information that do require compilation is available in a 
coposite field called **SymbolTable**.

That is why in OrgCheck we alert you when at least one apex class that we list was 
not compiled (for some reason).

That is also why you have access to an action button in the Apex page to compile all 
the classes.

Finally, as we want you to monitor the technical debt of you own code we exclude the
classes that are not umanaged (see the WHERE clause).

This is the query:

```SQL
SELECT Id, Name, ApiVersion, NamespacePrefix, Body, 
    LengthWithoutComments, SymbolTable 
FROM ApexClass
WHERE ManageableState = 'unmanaged'
```

## Step 3: Mapping


| Step # | Extract                                  | Transformation                                                                | Load                       |
| :----: | ---------------------------------------- | ----------------------------------------------------------------------------- | -------------------------- |
|   1    | ApexClassOrTriggerId                     | have a map of Coverage by Class ID, by default={ cov: 0, cnt: 0 }.            |                            |
|   1    | NumLinesCovered and NumLinesUncovered    | cov += NumLinesCovered / (NumLinesCovered + NumLinesUncovered. <br /> cnt++   | update the item in the map |
|   2    | Id                                       | simplifySalesforceId()                                                        | id                         |
|   2    | Name                                     |                                                                               | name                       |
|   2    | ApiVersion                               |                                                                               | apiVersion                 |
|   2    | ApiVersion.                              | isVersionOld()                                                                | isApiVersionOld            |
|   2    | NamespacePrefix                          |                                                                               | namespace                  |
|   2    | SymbolTable.tableDeclaration.modifiers   | false by default. true if modifiers list contains 'testMethod'                | isTest                     |
|   2    | SymbolTable.tableDeclaration.modifiers   | false by default. true if modifiers list contains 'abstract'                  | isAbstract                 |
|   2    | Body                                     | false by default. true if Body matches regex "public|global interface"        | isInterface                |
|   2    | LengthWithoutComments                    |                                                                               | size                       |
|   2    | SymbolTable                              | true is the field is set. false is the field is null                          | needsRecompilation         |
|   2    | LengthWithoutComments                    |                                                                               | size                       |
|   2    | SymbolTable.innerClasses.length          | 0 by default.                                                                 | innerClassesCount          |
|   2    | SymbolTable.interfaces                   |                                                                               | interfaces                 |
|   2    | SymbolTable.methods.length               | 0 by default.                                                                 | methodsCount               |
|   2    | SymbolTable.tableDeclaration.annotations |                                                                               | annotations                |
|   2    | SymbolTable.tableDeclaration.modifiers   | 'with sharing'->'with', 'without sharing'->'without', else 'inherit'          | specifiedSharing           |
|   2    |                                          | false by default. true if isTest=false isInterface=false specifiedSharing=nul | isSharingMissing           |

