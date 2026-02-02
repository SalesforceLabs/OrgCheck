---
layout: default
title: Hardcoded URLs
permalink: /hardcodedurls/
---

# Hardcoded URLs Analysis

This document describe how Org Check detects Hard Coded URLs in your org

## Hard coded URLs detection from a text

- If the text contains xml code, we remove the comments using the following regular expression `(<!--[\\s\\S]*?-->|\\n)`
- If the text contains Javascript or Apex code, we remove the comments using the following regular expression `(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/.*\\n|\\/\\/[^\\n]*|\\n)`
- We check if the given text has occurences that match the following regular expression `([A-Za-z0-9-]{1,63}\\.)+[A-Za-z]{2,6}``
- We select only the occurences that contain 'salesforce.com' or '.force.'
- We remove duplicates if any
- Finally we remove the my.salesforce.com domains

## Places we expect potential Hard Coded URLs in your metadata

### 1. Email Templates Dataset
Source: [build/src/api/dataset/orgcheck-api-dataset-emailtemplates.js](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-emailtemplates.js)
- **Entity**: `EmailTemplate`
- **Fields**: `HtmlValue`, `Body`, `Markup`
- **SOQL**: `SELECT Id, HtmlValue, Body, Markup FROM EmailTemplate`

#### 2. Visualforce Components Dataset
Source: [build/src/api/dataset/orgcheck-api-dataset-visualforcecomponents.js](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-visualforcecomponents.js)
- **Entity**: `ApexComponent`
- **Field**: `Markup`
- **SOQL**: `SELECT Id, Markup FROM ApexComponent`

#### 3. Apex Classes Dataset
Source: [build/src/api/dataset/orgcheck-api-dataset-apexclasses.js](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-apexclasses.js)
- **Entity**: `ApexClass`
- **Field**: `Body`
- **SOQL**: `SELECT Id, Body FROM ApexClass`

#### 4. Visualforce Pages Dataset
Source: [build/src/api/dataset/orgcheck-api-dataset-visualforcepages.js](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-visualforcepages.js)
- **Entity**: `ApexPage`
- **Field**: `Markup`
- **SOQL**: `SELECT Id, Markup FROM ApexPage`

#### 5. Custom Fields Dataset
Source: [build/src/api/dataset/orgcheck-api-dataset-customfields.js](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-customfields.js)
- **Entity**: `CustomField`
- **Field**: `Metadata.formula`
- **SOQL**: `SELECT Id, Metadata FROM CustomField WHERE DeveloperName='xyz' `
- **Note**: Selecting the `Metadata` field requires to specify the record `Id` or its `DeveloperName`

#### 6. Apex Triggers Dataset
Source: [build/src/api/dataset/orgcheck-api-dataset-apextriggers.js](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-apextriggers.js)
- **Entity**: `ApexTrigger`
- **Field**: `Body`
- **SOQL**: `SELECT Id, Body FROM ApexTrigger`

#### 7. Home Page Components Dataset
Source: [build/src/api/dataset/orgcheck-api-dataset-homepagecomponents.js](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-homepagecomponents.js)
- **Entity**: `HomePageComponent`
- **Field**: `Body`
- **SOQL**: `SELECT Id, Body FROM HomePageComponent`

#### 8. Collaboration Groups Dataset
Source: [build/src/api/dataset/orgcheck-api-dataset-collaborationgroups.js](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-collaborationgroups.js)
- **Entity**: `CollaborationGroup`
- **Field**: `InformationBody`
- **SOQL**: `SELECT Id, InformationBody FROM CollaborationGroup`

#### 9. Web Links Dataset
Source: [build/src/api/dataset/orgcheck-api-dataset-weblinks.js](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-weblinks.js)
- **Entity**: `WebLink`
- **Field**: `Url`
- **SOQL**: `SELECT Id, Url FROM WebLink`

#### 10. Custom Tabs Dataset
Source: [build/src/api/dataset/orgcheck-api-dataset-customtabs.js](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-customtabs.js)
- **Entity**: `CustomTab`
- **Field**: `Url`
- **SOQL**: `SELECT Id, Url FROM CustomTab`

#### 11. Documents Dataset
Source: [build/src/api/dataset/orgcheck-api-dataset-documents.js](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-documents.js)
- **Entity**: `Document`
- **Field**: `Url`
- **SOQL**: `SELECT Id, Url FROM Document`

#### 12.
Source: [build/src/api/dataset/orgcheck-api-dataset-knowledgearticles.js](https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/api/dataset/orgcheck-api-dataset-knowledgearticles.js)
- **Entity**: `KnowledgeArticleVersion`
- **Fields**: all fields
- **SOSL**: `FIND { .salesforce.com OR .force.* } IN ALL FIELDS RETURNING KnowledgeArticleVersion (Id, KnowledgeArticleId, ArticleNumber)`



