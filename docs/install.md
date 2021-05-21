---
layout: default
title: How to install OrgCheck in your org?
permalink: /installation/
---

# How to install OrgCheck in your org?


## Easy to install

**OrgCheck** is a Salesforce application which can be installed on **any** Salesforce organization **very easily**. No additional infrastructure is required. No additional license. Simple as A.B.C.


## A) URLs for the installation

Go to one of the following URLs depending on the nature of the organization you want to install **OrgCheck**.

| Environment            | URL                                                                                | Button |
| ---------------------- | ---------------------------------------------------------------------------------- | ------ |
| Sandboxes              | [sfdc.co/OrgCheck-Install-1_9-SDB](https://sfdc.co/OrgCheck-Install-1_9-SDB)       | ![sfdc.co/OrgCheck-Install-1_9-SDB](../docs/assets/pngs/Install-SDBX.png) |
| Developer Edition Orgs | [sfdc.co/OrgCheck-Install-1_9-DevOrg](https://sfdc.co/OrgCheck-Install-1_9-DevOrg) | ![sfdc.co/OrgCheck-Install-1_9-DevOrg](../docs/assets/pngs/Install-DevEdition.png) |

URLs to install Salesforce packages contain the Salesforce ID of the current version of the package. To insure you always **point to the newest version**, we are masking you this detail by using a redirection.

After selecting the previous URL, you were redirected to Salesforce servers.
If you were not yet authenticated, you will have to sign on using your credentials.


## B) Install the package

Just like an AppExchange application you have to:
- Select the profiles -- we recommand to select **Admins Only**
- Click on "Install" (or "Upgrade")

For some orgs that have Apex class not compiling, you can install the package without checking Apex classes (advanced setting when installing the app).

![Installation Notice screenshot](../images/screenshots/OrgCheck-v1.9.1-Screenshot5.png)


## C) Permission Set assignment

Once installed, go to your org and assign your Salesforce user to the Permission Set called "OrgCheck Users".

And you are done!

![Welcome in OrgCheck screenshot](../images/screenshots/OrgCheck-v1.9.1-Screenshot1.png)


## The benefits of unlocked package

The application is delivered to you as an **unlocked package**.

This means the installation is pretty much like the installation of a simple AppExchange application.

We are also able to **push a new version** of the package in your org, to make sure you have the latest fixes and features of the application, without to worry about anything. We take care of this.

We made the choice to use a specific **namespace** for this package, which is __OrgCheck__ of course, so that you can identify faster components of this package when browsing the metadata of your org (additionally to the naming convention).

Finally, the content of the application can be modified in your org (using the Salesforce Dev Console) in case you find a solution to a bug. Do not forget that every component of this package is under the MIT licence.
