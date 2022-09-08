---
layout: default
title: How to install OrgCheck in your org?
permalink: /installation/
---

# How to install OrgCheck in your org?


## Easy to install

**OrgCheck** is a Salesforce application which can be installed on **any** Salesforce organization **very easily**. No additional infrastructure is required. No additional license. Simple as A.B.C.


## Step 1: URLs for the installation

OrgCheck is available on the AppExchange as a manage package, or, freely as an unlocked package.

### AppExchange (recommanded)

Go to the AppExchange or go directly to https://sfdc.co/OrgCheck-InstallToday-AppExchange

URL to install Salesforce packages on the AppExchange contain the Salesforce ID of the listing. To insure you always **point to the newest version**, we are masking you this detail by using a redirection.

After selecting the previous URL, you were redirected to Salesforce servers.
If you were not yet authenticated, you will have to sign on using your credentials.

### Unlocked Package (alternative)

Go to one of the following URLs depending on the nature of the organization you want to install **OrgCheck**.

| Environment            | URL                                                                                | Action |
| ---------------------- | ---------------------------------------------------------------------------------- | ------ |
| Sandboxes              | [sfdc.co/OrgCheck-InstallToday-SDB](https://sfdc.co/OrgCheck-InstallToday-SDB)       | [![Deploy OrgCheck on Sandbox](../assets/pngs/Install-SDBX.png)](https://sfdc.co/OrgCheck-InstallToday-SDB) |
| Developer Edition Orgs | [sfdc.co/OrgCheck-InstallToday-DE](https://sfdc.co/OrgCheck-InstallToday-DE) | [![Deploy OrgCheck on DevOrg](../assets/pngs/Install-DevEdition.png)](https://sfdc.co/OrgCheck-InstallToday-DE) |

URLs to install Salesforce packages contain the Salesforce ID of the current version of the package. To insure you always **point to the newest version**, we are masking you this detail by using a redirection.

After selecting the previous URL, you were redirected to Salesforce servers.
If you were not yet authenticated, you will have to sign on using your credentials.


## Step 2: Install the package

Just like an AppExchange application you have to:
- Select the profiles -- we recommand to select **Admins Only**
- Click on "Install" (or "Upgrade")

For some orgs that have Apex class not compiling, you can install the package without checking Apex classes (advanced setting when installing the app).

![Installation Notice screenshot](../images/screenshots/OrgCheck-Screenshot-Install.png)


## Step 3: Permission Set assignment

We do not provide a specific permission set anymore.
Once installed, go to the app "OrgCheck", and you are done!

![Welcome in OrgCheck screenshot](../images/screenshots/OrgCheck-Screenshot-Home.png)


## The benefits of unlocked package

The application is delivered to you as an **unlocked package**.

This means the installation is pretty much like the installation of a simple AppExchange application.

We are also able to **push a new version** of the package in your org, to make sure you have the latest fixes and features of the application, without to worry about anything. We take care of this.

We made the choice to use a specific **namespace** for this package, which is __OrgCheck__ of course, so that you can identify faster components of this package when browsing the metadata of your org (additionally to the naming convention).

Finally, the content of the application can be modified in your org (using the Salesforce Dev Console) in case you find a solution to a bug. Do not forget that every component of this package is under the MIT licence.


## Known issues

### I can't install the package because some Apex class are not compiling
 - Our package does **NOT include ANY Apex class**.
 - It is more likely a **existing Apex class** in the org you want to analyze that **does not compile** (it happens!).
 - In that case, you can still install the package BUT you will have to specify during the installation process that you only want to validate the classes that are included in the package. This can be done via the **advanced setting when installing the app**.

### I can't see the OrgCheck application, even if I am SysAdmin
 - The app is called "**OrgCheck**" obviously, maybe you spell it wrong?
 - Did you install the package for a specific set of profiles and maybe you are not part of these ones? (remember we recommended to install the package for admins only...)
 - You should see the application definitly!

### I have the same error on EVERY tabs when the tool is accessing the API: INVALID_SESSION_ID: This session is not valid for use with the REST API 
In case you have enabled the "**API Client Whitelisting**" feature, you will need to:
 - Create a permission set.
 - In this permission set, check the system permission called "**Use any API Client**" (which appears ONLY if you activate the "**API CLient Whitelisting**" feature -- that's why we can't add it to everybody).
 - And assign your user to this additional permission set.
For more information, you can check that closed issue: https://github.com/VinceFINET/OrgCheck/issues/118


