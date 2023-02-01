---
layout: default
title: Data Store "ApexClasses" in Org Check  
permalink: /technical/datastores/apexclasses/
---



# Data Store "ApexClasses"

## What is the information we are interested in about Apex Classes?

- Metadata information that does not require compilation, like Id, Name, ApiVersion, Size, etc.
- Metadata information that does require compilation, like number of methods, number of inner classes, etc.
- Code coverage information like the percentage of line covered in a class and also the list of classes that cover a class.

### Where is the metadata information about Apex Classes in Salesforce?

The metadata information for Apex Classes is located in multiple places:
- as the entity called **ApexClass** that can be retrieved and deployed via 
  the **Metadata API**. 
  See (https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_classes.htm)
- as the sObject called **ApexClass** that can be queried in SOQL via the 
  **SOAP API** and **REST API**. 
  See https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/sforce_api_objects_apexclass.htm
- as the object called **ApexClass** that can be queried via the 
  **Tooling API**. 
  See https://developer.salesforce.com/docs/atlas.en-us.api_tooling.meta/api_tooling/tooling_api_objects_apexclass.htm 

In this section we choose to use the **Tooling API** because we will have more 
information about classes, especially data that is available after the 
**compilation** of the class.

The information that does not require compilation is available as simple fields 
(like **ApiVersion**, **Body**, ...). 

The information that does require compilation is available in a composite field 
called **SymbolTable** which contains multiple fields.

If for some reason a class was not compiled, the information that relies on it is
obviously not available. That is why before trying to checking for classes, it is 
good to go to setup and compile all classes (there is a button in Org Check to 
open the setup in the right place).

The classes that are from packages that you may not need to worry about (because 
you cannot change them) will have a specific **ManageableState** value. That is why
we will use this as a criteria in Org Check.

### Where is the code coverage information about Apex Classes in Salesforce?

Everytime you run an Apex Unit Test, Salesforce stores the result of each test method as 
a set of records in the table **ApexCodeCoverage**, and also stores the aggregate results
for a specific Apex Class in the table **ApexCodeCoverageAggregate**.

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

That information is used for example in the Developer Console in Salesforce to show
the coverage of a class from a specific method in a unit test class.

Finally, you will get the global coverage of a class in the table ApexCodeCoverageAggregate.
If you want to have the exact same percentage as if in production, you will have to ensure 
that:
- you run all unit tests
- all your unit tests are successful





## How Org Check is retreiving the information?

### Metadata information about Apex Classes

In Org Check we will run the following query on the **Tooling API** :

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

| Org Check field                           | Formula                                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| id                                       | simplifySalesforceId(**Id**)                                                               |
| name                                     | **Name**                                                                                   |
| apiVersion                               | **ApiVersion**                                                                             |
| ApiVersion                               | isVersionOld(**ApiVersion**)                                                               |
| namespace                                | **NamespacePrefix**                                                                        |
| isTest                                   | false by default, true if **SymbolTable.tableDeclaration.modifiers** contains 'testMethod' |
| isAbstract                               | false by default. true if **SymbolTable.tableDeclaration.modifiers** contains 'abstract'   |
| isInterface                              | false by default. true if **Body** matches regex "public OR global interface"              |
| size                                     | **LengthWithoutComments**                                                                  |
| needsRecompilation                       | true if **SymbolTable** is not null, false otherwise.                                      |
| size                                     | **LengthWithoutComments**                                                                  |
| innerClassesCount                        | **SymbolTable.innerClasses.length** (0 if the object is null)                              |
| interfaces                               | **SymbolTable.interfaces**                                                                 |
| methodsCount                             | **SymbolTable.methods.length** (0 if the object is null)                                   |
| annotations                              | **SymbolTable.tableDeclaration.annotations**                                               |
| specifiedSharing                         | switch(**SymbolTable.tableDeclaration.modifiers**) <br />case 'with sharing': 'with'<br />case 'without sharing': 'without'<br />case 'inherited sharing': 'inherit' |
| isSharingMissing                         | false by default. true if ***isTest***=false AND ***isInterface***=false AND ***specifiedSharing*** is null | 



### Code coverage information about Apex Classes

In Org Check, we get the global code coverage from Salesforce (table
***ApexCodeCoverageAggregate*** in Tooling API) and we also get the 
list of unit tests that participate in that coverage (table 
***ApexCodeCoverage*** in Tooling API).

To get the global code coverage, we do the following query, in the Tooling API:

```SQL
SELECT ApexClassorTriggerId, NumLinesCovered, NumLinesUncovered, Coverage 
FROM ApexCodeCoverageAggregate
```

To get the related unit test to an Apex Class, we do the following query, in the Tooling API:

```SQL
SELECT ApexClassOrTriggerId, ApexTestClassId
FROM ApexCodeCoverage
```


