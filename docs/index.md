---
layout: default
title: Welcome to OrgCheck
---


# Welcome to OrgCheck



## Technical Debt, you said?

Although invisible, Technical Debt has an impact on your programs & projects, your budget, your platform & applications, your end-users and... your business.

Let’s start a discussion about it today!

What do you expect from this reduction? 
- impact on the maintenance of my Salesforce applications
- impact on my technical documentation
- impact on our IT processes
- no additional infrastructure nor licenses!



## Introducing “OrgCheck”

Let customers have an application within their Salesforce org to reduce their technical debt continuously.

Use cases of the application are:
    - **Full SObject documentation** from the data model
    - **Custom fields** created by the customer and their dependencies
    - **Active users** with their profile and permission sets
    - **Profiles** and **Permission Sets**
    - **Roles** table and diagram
    - **Public Groups**: recursive list of users
    - **Automations**: workflows, process builders and flow
    - **Visual Components**: Visual Force Page, Visual Force Component, Lightning Page, Lightning Aura Component and Lightning Web Component
    - **Apex Components**: Classes and Triggers
    - **Batches**: Failed jobs

A complementary tool for the awesome **Salesforce Optimizer**.



## Installation
[How to install OrgCheck in your org?](installation)



## My vision of this tool

### No software
- The tool should run on a salesforce org
  - Easy to install
  - Easy to use and secure
- No additional software or platform 
  - All is in the Salesforce app
  - Not on Heroku 
  - Not on SFDX
- Customer will continue to use it even after I’m gone!

### Available to anyone
- Source on a GitHub public repo
- Package URL without password
- Support on a public Slack
- One day on the AppExchange?



## What this application contains

- 1 Permission Set for users to see the app
- 1 Custom App
- 12 Tabs
- 1 Visualforce Template
- 13 Visualforce Pages
- 4 StaticResource including “jsforce.min.js” and “d3.v5.min.js”

No more!

Visualforce Pages contain Javascript code which uses JsForce library to connect to the REST API and the Tooling API of the current org.

Warning: the app may increase the Daily API Request limit (although it uses a caching mechanism on the local browser)! So this application should be used in sandbox only.



## How to get help and support?

- Source code is available to anyone at: https://www.sfdc.co/OrgCheck-Repository
- Issues or ideas are welcome and can be logged by anyone at: https://www.sfdc.co/OrgCheck-Backlog
- Join our public Slack workspace at: https://sfdc.co/OrgCheck-Community



## Legal terms

**OrgCheck is free to use, but is not an official Salesforce product.** OrgCheck has not been officially tested or documented. Salesforce support is not available for OrgCheck. Support requests for OrgCheck should be directed to GitHub at <a href="https://github.com/VinceFINET/OrgCheck/issues" target="_blank">https://github.com/VinceFINET/OrgCheck/issues</a>. Source code for OrgCheck can be found at <a href="https://github.com/VinceFINET/OrgCheck" target="_blank">https://github.com/VinceFINET/OrgCheck</a> under separate and different license terms.
