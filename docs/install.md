---
layout: default
title: How to install OrgCheck in your org?
permalink: /installation/
---

# How to install OrgCheck in your org?


## Easy to install

**OrgCheck** is a Salesforce application which can be installed on **any** Salesforce organization **very easily**. No additional infrastructure is required. No additional license. Simple as A.B.C.


## Step 1: Go to the AppExchange

- Go to the AppExchange at https://appexchange.salesforce.com
- Search for "OrgCheck" or "Technical Debt" and hit enter. You should find it!
- Alternativelly, please [![follow this link](../assets/pngs/Install-AppExchange.png)](https://sfdc.co/OrgCheck-InstallToday-AppExchange) to reach directly the good page.

## Step 2: Get it now!

- Click on the "**Get It Now**" button on the previous page
- Select the environnment you want to install OrgCheck to.



## Step 2: Install the package

- Select the profiles -- we recommand to select **Admins Only**
- Click on "Install" (or "Upgrade")

Note: For some orgs that have Apex class not compiling, you can install the package without checking Apex classes (advanced setting when installing the app).

![Installation Notice screenshot](../images/screenshots/OrgCheck-Screenshot-Install.png)


## Step 3: Permission Set assignment

We do not provide a specific permission set anymore.
Once installed, go to the app "OrgCheck", and you are done!

![Welcome in OrgCheck screenshot](../images/screenshots/OrgCheck-Screenshot-Home.png)

## Known issues

### I see you also have a standalone package

Historically, OrgCheck was available as an "**unlocked package**".

The benefits of such a package were:
- We are able to **push a new version** of the package in your org, to make sure you have the latest fixes and features of the application, without to worry about anything. We take care of this.
- The content of the application can be **modified in your org** (using the Salesforce Dev Console) in case you find a solution to a bug. Do not forget that every component of this package is under the MIT licence. And when we push a new version, your modification will be erased. Use this capability to send us technical feedback and maybe even solutions!

The URLs are still pointing to the latest version of the app and can be reached at:
- If you want to install the application on a **sandbox**, please [![follow this link](../assets/pngs/Install-SDBX.png)](https://sfdc.co/OrgCheck-InstallToday-SDB)
- If you want to install the application on a **developer edition org**, please [![follow this other link](../assets/pngs/Install-DevEdition.png)](https://sfdc.co/OrgCheck-InstallToday-DE)

But the prefered way now is to install the application via the AppExchange.

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

### When installing the app from AppExchange I see error like "This package can’t be installed... Package namespace conflict"
In this case it is more likely that you are trying to install the application from the AppExchange on a Salesforce Organization where the standalone package is already installed.
This can be explained easily, both app share the same namespace (aka package name).
So either you keep the standalone package or you remove it and try to install the app from the AppExchange again.
Both version are FREE anyway and will be maintained!
It is up to you to choose the one you prefer!
