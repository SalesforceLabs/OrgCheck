---
layout: default
title: Welcome to Org Check
---


# Welcome to Org Check

Let administrators, developers, customers and partners have an application within 
their Salesforce org to monitor and help **continuously reduce their technical debt**.

![Home Page tab screenshot](./images/screenshots/OrgCheck-Screenshot-Home.png)


## Why would you need this application in your org?

Make sure your Salesforce organisation is under control in terms of **technical debt reduction**.

You will need org Check to verify some things in your organisation like:
- Well Described Data Model
- Useful and meaningful Profiles and Permission Sets
- Efficent Role Hierarchy
- Active Users
- Useful Public Groups and Queues
- UI and Apex Componants respecting best practices
- Better Automations
- etc.


## My Vision of the application

- This application is **easy to install and easy to use**.
- It requires no additional software or platform whatsoever. 
- All you need is to install the application in your org from the AppExchange.
- No custom object will be added, no external connection, all stays in your browser and your org.
- The app is free of use: open sourced, available on the AppExchange for free and a support on slack and GitHub.
- Please use [this deck](http://sfdc.co/OrgCheck-Presentation) with your colleagues, company or customers to present the application before installing it and using it for your org.
- Keep in mind that Org Check is not a Salesforce product. It has not been officially tested or documented by Salesforce. Also Salesforce support is not available for Org Check. Support is based on open source participation and requests are managed (as we can) via GitHub at https://github.com/SalesforceLabs/OrgCheck/issues.


## Frequently Asked Question by Security

### What data is stored in Org Check?

- At this point of time, the Org Check application is only analyzing configuration data in the Salesforce org where it is installed.
- We usually call this data as “metadata” such as list of Apex Classes, SObjects definition, Custom fields, etc. 
- We do not collect your data such as Account, Contact , Opportunity or any custom object you may have created in your org.
- The metadata types that are gathered (as of 6 November 2024) by the application using Salesforce APIs from the org where the app is installed are:
  * Home: InstalledSubscriberPackage, Organization
  * ⚽ Objects tab: Field, FieldSet, Layout, Limit, ValidationRule, WebLink
  * 🥕 Custom Fields tab: CustomField, EntityDefinition
  * 🧔 Users tab: User, UserPermissionAccess
  * 👮 Profiles and Permission Sets tab: Profile, PermissionSet, PermissionSetAssignment, AppMenuItem, SetupEntityAccess
  * 🐇 Roles tab: UserRole
  * 🌶️ Public Groups and Queues tab: Group
  * 🤖 Automations tab: Flow, FlowDefinition, WorkflowRule
  * 🎁 Custom Labels tab: ExternalString
  * 🥐 Visual Components tab: ApexComponent, ApexPage, AuraDefinitionBundle, LightningComponentBundle, FlexiPage
  * 🔥 Apex tab: ApexClass, ApexCodeCoverage, ApexCodeCoverageAggregate, AsyncApexJob, ApexTrigger
- Please note that we have in our roadmap a Data Skew Analyser (but not until end of 2025).
- At this moment, we do not know if such feature will be included in the same package or in a different package from the AppExchange. That could be an option to garantee that you use a package that does not touch you data at all.

### Is the data processed outside of my region or Country?

- The metadata (and not the data) is gathered from the user’s browser using Javascript library that is nested in the Org Check application, and then processed by the user’s browser and potentially cached in the same browser.
- No external storage is used, not even a custom object in the org.
- If the metadata is processed outside of your region or country it is because the user you gave access to your org and the app comes from another region or country.

### What are the flow in Org Check (data processing) ? Can you share a flow / Architecture diagram ?

- Org Check is using a Javascript library called “JSForce” (v1.11.1) to connect to the local Salesforce org where it is installed. Note that this library is also used by Salesforce for its own SF CLI plugin technology.
- This library is part of the package so there is no dependencies with other external site that may host this library. Once the application is installed in your org, the library is hosted in your org.
- Then Org Check uses the following standard Salesforce APIs (limited to the org where it is installed) via the JSForce library:
  * REST API
  * Tooling API
  * Metadata API
  * BULK v2 API
  * Limits API
  * Dependency API
- To perform these calls the current user is used during the navigation in the application.
- The application is expecting the current user to have the following system permissions, if not the application will stop and show a warning message:
  * ModifyAllData
  * AuthorApex
  * ApiEnabled
  * InstallPackaging
- So basically the flows are rather the same from on tab to the other:
  * get a list of metadata from the Salesforce org using the appropriate Salesforce API
  * if the data is cached and not to “old” then use it (to avoid impacting the Request API limit)
  * compute on the fly the aggregated data that is needed in the tab. The process is within the Javascript code in the user’s browser. Important: we do not alter the org metadata nor data at this point or any point at all.
  * our secret sauce is to compute a score based on best practices and the data will be sorted so that we show the configuration that needs to be “corrected”.
- Export feature is available in some tabs. This uses a library called “SheetJS” also part of the package. That data is not leaving your org or your browser. The Excel file is generated by Javascript on your browser and once finished available in your Download folder of your browser.

### How org check is impacting my own org ? API Limits, Objects, Apex,...

- The usage of this application impacts only one limit in your salesforce org which is called '“Daily API Request limit”.
- All calls to the Salesforce APIs on your org by the application is preceded with a check if that Daily API Request limit has reached a certain percentage.
- From 0% to 70%, the application will call the API.
- When the limit reaches 70% up to 90%, the application will call the API but will also show a warning to the user.
- This warning is not STOPPING the application from calling the API.
- Then if the limit reaches 90%, the application will refuse to call anymore APIs and will show an error. If this type of error happens, just wait for the limit to decrease (as this is a 24 hour rolling limit). Or use the app in another sandbox for a specific usage.
- IMPORTANT: We encourage you to use Org Check in a sandbox that is not crucial for your dev lifecycle and certainly not your production org. Even if we put in place this check, we remind you that Salesforce Labs applications like Org Check have no warranty of any sort (as described in the AppExchange).

### Is Org Check Open Source ? Can We customize Org Check or participate to Org Check Development ? if yes, how do you select your team members ?

- Org Check is open source.
- The code is available on GitHub: https://github.com/SalesforceLabs/OrgCheck
- Under the MIT license: https://github.com/SalesforceLabs/OrgCheck?tab=MIT-1-ov-file#readme
- If you install the application fro AppExchange, the code is locked because the store forces us to use a “managed package”. So in short you won’t be able to change the code directly from the Salesforce org where it is installed.
- Same if you installed the application for the “unlocked package” that allows you to install the application in a sandbox without having the right to install apps in production (which is the case when you install application from AppExchange).
- As the code is open source, you are free to fork the project, and make your own modifications to it. In this case, we believe that it would be great to share your modifications to the community by doing Pull Request to the main project. To do so you will need to sign a digital agreement (this is because our repository is hosted in the Salesforce Labs project owned by Salesforce). This is own team members can contribute to the project even thought they are not part of Salesforce.
- Of course before considering doing your own fork of the project, you could just create an issue in the main project and we will be happy to work with you on a fix or an a new feature you will want in future releases.

### What are the security check-in related to Org Check ? past, current and future ?

- The Org Check application has been validated by a Security Review from the ISV Salesforce internal team.
- That team is validating ALL applications that are hosted in the AppExchange. 
- By “ALL” we mean salesforce labs or not, free or not, etc...
- We got our validation back in September 2022:


## How do I install this application?

<a href="https://sfdc.co/OrgCheck-InstallToday-AppExchange" target="_blank"><img width="300" src="./assets/pngs/Install-AppExchange.png" alt="Deploy Org Check from AppExchange"></a><br />

- You install this application directly in the org you want to analyse from the AppExchange.
- Then, you navigate through the tabs in the app to discover some bad practices in the org.
- Any issues installing the application? Please, [go to this dedicated page](installation) about installation, including some frequently asked questions.


## How to get help and support?
- Source code is available to anyone at: [sfdc.co/OrgCheck-Repository](https://www.sfdc.co/OrgCheck-Repository)
- Issues or ideas are welcome and can be logged by anyone at: [sfdc.co/OrgCheck-Backlog](https://www.sfdc.co/OrgCheck-Backlog)
- Join us on the Trailblazer COmmunity at: [sfdc.co/OrgCheck-Community](https://sfdc.co/OrgCheck-Community)


## Useful references
- [Article on  Salesforce's Ben: "Free technical debt analysis"](https://www.salesforceben.com/salesforce-org-check-free-technical-debt-analysis)
- [Article on Pablo Gonzalez blog: "10 Salesforce Open-source Projects for DevOps Engineers"](https://www.pablogonzalez.io/top-10-salesforce-open-source-projects-for-devops/#4-orgcheck)
- [Youtube Video: "Reduce Technical Debt with Org Check"](https://www.youtube.com/watch?v=gjv6q-AR1m0)
- [Article on Medium: "How to contin uously monitor, balance, challenge, and reduce Technical Debt in a Salesforce org?"](https://medium.com/@vfinet/how-to-continuously-monitor-balance-challenge-and-reduce-technical-debt-in-a-salesforce-org-8809cef4ce4a)
- [Article on Medium:  "Five concrete actions to reduce technical debt related to Apex Classes"](https://medium.com/@vfinet/five-concret-actions-to-reduce-technical-debt-related-to-apex-classes-reduce-technical-debt-f71a31e4b30c)
- [Youtube Video: "Org Check Review by Ike Wagh"](https://www.youtube.com/watch?v=IG4zzqVsO_8)
- [Salesforce Labs Live! "How to Reduce Technical Debt from your Salesforce Environment (Ep.1)"](https://www.youtube.com/watch?v=ZCJ_NH-29I0)
- [Albanian Dreamin21: "Org Check presentation" by Sara Sali and Vincent Finet](https://dreamin21.sfalbania.al/schedule/schedule-fullwidth-filterable/)
- [Article on Unofficial SF: "Analyze your org with Org Check"](https://unofficialsf.com/from-vincent-finet-analyze-your-org-with-orgcheck/)
- [Article on Salesforce's Ben: "Free ways to monitor your Salesforce org"](https://www.salesforceben.com/free-ways-to-monitor-your-salesforce-org/)


## I am a developer, how do I contribute?

To set up a development environment and deploy Org Check as your own unlocked package, follow the steps outlined in the [Development Setup Guide](development).

Once done when you want to send a Pull Request just do so from Github and we will review it.
Please note that you will need to sign the Salesforce CLA to do this.




