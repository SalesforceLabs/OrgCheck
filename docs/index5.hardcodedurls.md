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
Source: [packages/orgcheck-api/src/api/dataset/orgcheck-api-dataset-emailtemplates.ts](https://github.com/SalesforceLabs/OrgCheck/blob/main/packages/orgcheck-api/src/api/dataset/orgcheck-api-dataset-emailtemplates.ts)
- **Entity**: `EmailTemplate`
- **Fields**: `HtmlValue`, `Body`, `Markup`
- **SOQL**: `SELECT Id, HtmlValue, Body, Markup FROM EmailTemplate`

#### 2. Visualforce Components Dataset
Source: [packages/orgcheck-api/src/api/dataset/orgcheck-api-dataset-visualforcecomponents.ts](https://github.com/SalesforceLabs/OrgCheck/blob/main/packages/orgcheck-api/src/api/dataset/orgcheck-api-dataset-visualforcecomponents.ts)
- **Entity**: `ApexComponent`
- **Field**: `Markup`
- **SOQL**: `SELECT Id, Markup FROM ApexComponent`

#### 3. Apex Classes Dataset
Source: [packages/orgcheck-api/src/api/dataset/orgcheck-api-dataset-apexclasses.ts](https://github.com/SalesforceLabs/OrgCheck/blob/main/packages/orgcheck-api/src/api/dataset/orgcheck-api-dataset-apexclasses.ts)
- **Entity**: `ApexClass`
- **Field**: `Body`
- **SOQL**: `SELECT Id, Body FROM ApexClass`

#### 4. Visualforce Pages Dataset
Source: [packages/orgcheck-api/src/api/dataset/orgcheck-api-dataset-visualforcepages.ts](https://github.com/SalesforceLabs/OrgCheck/blob/main/packages/orgcheck-api/src/api/dataset/orgcheck-api-dataset-visualforcepages.ts)
- **Entity**: `ApexPage`
- **Field**: `Markup`
- **SOQL**: `SELECT Id, Markup FROM ApexPage`

#### 5. Custom Fields Dataset
Source: [packages/orgcheck-api/src/api/dataset/orgcheck-api-dataset-customfields.ts](https://github.com/SalesforceLabs/OrgCheck/blob/main/packages/orgcheck-api/src/api/dataset/orgcheck-api-dataset-customfields.ts)
- **Entity**: `CustomField`
- **Field**: `Metadata.formula`
- **SOQL**: `SELECT Id, Metadata FROM CustomField WHERE DeveloperName='xyz' `
- **Note**: Selecting the `Metadata` field requires to specify the record `Id` or its `DeveloperName`

#### 6. Apex Triggers Dataset
Source: [packages/orgcheck-api/src/api/dataset/orgcheck-api-dataset-apextriggers.ts](https://github.com/SalesforceLabs/OrgCheck/blob/main/packages/orgcheck-api/src/api/dataset/orgcheck-api-dataset-apextriggers.ts)
- **Entity**: `ApexTrigger`
- **Field**: `Body`
- **SOQL**: `SELECT Id, Body FROM ApexTrigger`

#### 7. Home Page Components Dataset
Source: [packages/orgcheck-api/src/api/dataset/orgcheck-api-dataset-homepagecomponents.ts](https://github.com/SalesforceLabs/OrgCheck/blob/main/packages/orgcheck-api/src/api/dataset/orgcheck-api-dataset-homepagecomponents.ts)
- **Entity**: `HomePageComponent`
- **Field**: `Body`
- **SOQL**: `SELECT Id, Body FROM HomePageComponent`

#### 8. Collaboration Groups Dataset
Source: [packages/orgcheck-api/src/api/dataset/orgcheck-api-dataset-collaborationgroups.ts](https://github.com/SalesforceLabs/OrgCheck/blob/main/packages/orgcheck-api/src/api/dataset/orgcheck-api-dataset-collaborationgroups.ts)
- **Entity**: `CollaborationGroup`
- **Field**: `InformationBody`
- **SOQL**: `SELECT Id, InformationBody FROM CollaborationGroup`

#### 9. Web Links Dataset
Source: [packages/orgcheck-api/src/api/dataset/orgcheck-api-dataset-weblinks.ts](https://github.com/SalesforceLabs/OrgCheck/blob/main/packages/orgcheck-api/src/api/dataset/orgcheck-api-dataset-weblinks.ts)
- **Entity**: `WebLink`
- **Field**: `Url`
- **SOQL**: `SELECT Id, Url FROM WebLink`

#### 10. Custom Tabs Dataset
Source: [packages/orgcheck-api/src/api/dataset/orgcheck-api-dataset-customtabs.ts](https://github.com/SalesforceLabs/OrgCheck/blob/main/packages/orgcheck-api/src/api/dataset/orgcheck-api-dataset-customtabs.ts)
- **Entity**: `CustomTab`
- **Field**: `Url`
- **SOQL**: `SELECT Id, Url FROM CustomTab`

#### 11. Documents Dataset
Source: [packages/orgcheck-api/src/api/dataset/orgcheck-api-dataset-documents.ts](https://github.com/SalesforceLabs/OrgCheck/blob/main/packages/orgcheck-api/src/api/dataset/orgcheck-api-dataset-documents.ts)
- **Entity**: `Document`
- **Field**: `Url`
- **SOQL**: `SELECT Id, Url FROM Document`

#### 12. Knowledge Article Dataset
Source: [packages/orgcheck-api/src/api/dataset/orgcheck-api-dataset-knowledgearticles.ts](https://github.com/SalesforceLabs/OrgCheck/blob/main/packages/orgcheck-api/src/api/dataset/orgcheck-api-dataset-knowledgearticles.ts)
- **Entity**: `KnowledgeArticleVersion`
- **Fields**: all fields
- **SOSL**: `FIND { .salesforce.com OR .force.* } IN ALL FIELDS RETURNING KnowledgeArticleVersion (Id, KnowledgeArticleId, ArticleNumber)`



