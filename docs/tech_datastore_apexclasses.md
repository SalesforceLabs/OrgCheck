---
layout: default
title: Data Store "ApexClasses" in OrgCheck  
permalink: /technical/datastores/apexclasses/
---



# Data Store "ApexClasses"



## Approach

Currently, the information about **Apex Classes** is retrieved using the **Tooling API**.

We run two queries in parallel to get (1) the **metadata information** for each apex class
and (2) the **code coverage** for each apex class



## Metadata information of Apex Classes

### Where is the information in Salesforce?

The metadata information for Apex Classes is located on the object **ApexClass**. 

The information that does not require compilation is available as simple fields 
(like **ApiVersion**, **Body**, ...). 

The information that does require compilation is available in a  composite field 
called **SymbolTable** which contains multiple fields.

If for some reason a class was not compiled, the information that relies on it is
obviously not available. That is why before trying to checking for classes, it is 
good to go to setup and compile all classes (there is a button in OrgCheck to 
open the setup in the right place).

The classes that are from packages that you may not need to worry about (because 
you cannot change them) will have a specific **ManageableState** value. That is why
we will use this as a criteria in OrgCheck.

### How OrgCheck is retreiving the information?

In OrgCheck we will run the following query on the **Tooling API** :

```SQL
SELECT Id, Name, ApiVersion, NamespacePrefix, Body, 
    LengthWithoutComments, SymbolTable 
FROM ApexClass
WHERE ManageableState = 'unmanaged'
```

Additionaly to the fields described in the SOQL query, we will use the following information in the **SymbolTable** field:
- SymbolTable.tableDeclaration.modifiers
- SymbolTable.tableDeclaration.annotations
- SymbolTable.innerClasses
- SymbolTable.interfaces
- SymbolTable.methods

For each record that returns this query, we will do the following mapping:

| OrgCheck field                           | Formula                                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| id                                       | simplifySalesforceId(**Id**)                                                               |
| name                                     | **Name**                                                                                   |
| apiVersion                               | **ApiVersion**                                                                             |
| ApiVersion                               | isVersionOld(**ApiVersion**)                                                               |
| namespace                                | **NamespacePrefix**                                                                        |
| isTest                                   | false by default, true if **SymbolTable.tableDeclaration.modifiers** contains 'testMethod' |
| isAbstract                               | false by default. true if **SymbolTable.tableDeclaration.modifiers** contains 'abstract'   |
| isInterface                              | false by default. true if **Body** matches regex "public|global interface"                 |
| size                                     | **LengthWithoutComments**                                                                  |
| needsRecompilation                       | true if **SymbolTable** is not null, false otherwise.                                      |
| size                                     | **LengthWithoutComments**                                                                  |
| innerClassesCount                        | **SymbolTable.innerClasses.length** (0 if the object is null)                              |
| interfaces                               | **SymbolTable.interfaces**                                                                 |
| methodsCount                             | **SymbolTable.methods.length** (0 if the object is null)                                   |
| annotations                              | **SymbolTable.tableDeclaration.annotations**                                               |
| specifiedSharing                         | switch(**SymbolTable.tableDeclaration.modifiers**) <br />
                                                case 'with sharing': 'with'<br />
                                                case 'without sharing': 'without'<br />
                                                case 'inherited sharing': 'inherit'                                                     |
| isSharingMissing                         | false by default. true if ***isTest***=false AND ***isInterface***=false AND
                                                                       ***specifiedSharing*** is null                                   | 

## Code coverage

### Where is the information in Salesforce?

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

### How OrgCheck is computing the code coverage?

In OrgCheck, we calculate a "lazy" code coverage, by just computing the average count of 
covered lines for each test method. It is faster. It gives a quick idea of the coverage. 
It is not quite the same as the one Salesforce calculates thought, we do understand. 

To do so we only need to query this:

```SQL
SELECT ApexClassOrTriggerId, NumLinesCovered, NumLinesUncovered 
FROM ApexCodeCoverage
```

For each record that returns this query, we will:
- Get the value of the field **ApexClassOrTriggerId**
- Check if this is the first time we see that Id?
  - Yes: we set a structure for this Id with a property called "cov" and "cnt" both set to zero.
  - No: we will get the previous structure with the properties "cov" and "cnt" set to some value.
- Get the values of the fields **NumLinesCovered** and the **NumLinesUncovered**
- We append "cov" with the computed value **NumLinesCovered / (NumLinesCovered + NumLinesUncovered** 
- We increment "cnt" by 1

At this stage, we have a map with "Ids" as key and a structure { "cov", "cnt" } as value.

Given a specific Apex Class Id, we can get that structure from the map and just compute a lazy 
code coverage score by computing **cov / cnt**.

