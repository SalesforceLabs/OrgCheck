---
layout: default
title: How to install OrgCheck in your org?
permalink: /installation/
---


# Installation



## Easy to install

**OrgCheck** is a Salesforce application which can be installed on **any** Salesforce organization **very easily**.

No additional infrastructure is required.

No additional license.

Simple as A.B.C.



## The benefits of unlocked package

The application is delivered to you as an **unlocked package**.

This means the installation is pretty much like the installation of a simple AppExchange application.

We are also able to **push a new version** of the package in your org, to make sure you have the latest fixes and features of the application, without to worry about anything. We take care of this.

We made the choice to use a specific **namespace** for this package, which is __OrgCheck__ of course, so that you can identify faster components of this package when browsing the metadata of your org (additionally to the naming convention).

Finally, the content of the application can be modified in your org (using the Salesforce Dev Console) in case you find a solution to a bug. Do not forget that every component of this package is under the MIT licence.



## URLs for the installation

There are two URLs available for installing the application:
- for Sandboxes: http://sfdc.co/OrgCheck-Install-1_9-SDB
- for Developer Orgs: http://sfdc.co/OrgCheck-Install-1_9-DevOrg

**Why two URLs?** <br />
*Because Sandboxes are under the test.salesforce.com domain and Developer Orgs are under the login.salesforce.com.*

**Why a redirection?** <br />
*The final URL contains the Salesforce ID of the current version of the package. To insure you always point to the newest version, we are masking you this detail by using this redirection.*



## Authentication

After you are redirected to the final URL, you will need to authenticate to your Salesforce org.
Keep in mind that installing a package implies having a system adminitrator rights on the specified org.

## I cannot authenticate to my org. Why?
Maybe you are on the wrong link, trying to connect to a sandbox with your credential but with the login.salesforce.com
Maybe your org is set to allow authentication only from you my domain? if so replace "login." with you my domain name.


