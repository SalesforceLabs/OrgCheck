---
layout: default
title: Installation FAQ
permalink: /installation/
---

# Installation FAQ


## Question 1: How do I install Org Check?
**Org Check** is a Salesforce application which can be installed on **any** Salesforce organization **very easily**. No additional infrastructure is required. No additional license. Simple as A.B.C.
 - Step 1: Go to the AppExchange
    - Go to the AppExchange at [https://appexchange.salesforce.com](https://appexchange.salesforce.com)
    - Search for "Org Check" or "Technical Debt" and hit enter. You should find it!
    - Alternativelly, please [follow this link](https://sfdc.co/OrgCheck-InstallToday-AppExchange) to reach directly the good page.
 - Step 2: Click to start the installation
    - To install the package in production: click on the "**Get It Now**" button
    - To install the package in a sandbox: click on the "**Try It**" button
 - Step 3: Go throught the installation process
    - Select the profiles -- we recommand to select **Admins Only**
    - Click on "Install" (or "Upgrade")
    - Once installed, go to the app "Org Check", and you are done!

<img src="../images/screenshots/OrgCheck-Screenshot-Home.png" alt="Welcome in Org Check screenshot" style="max-width: 800px; min-width: 600px;" width="100%" /><br />



## Question 2: I can't install the package because some Apex class are not compiling
 - Our package does **NOT include ANY Apex class**.
 - It is more likely an **existing Apex class** in the org you want to analyze that **does not compile** (it happens!).
 - In that case, you can still install the package BUT you will have to specify during the installation process that you only want to validate the classes that are included in the package. This can be done via the **advanced setting when installing the app**.

<img src="../images/screenshots/OrgCheck-Screenshot-Install.png" alt="Installation Notice screenshot" style="max-width: 450px; min-width: 200px;" width="100%" /><br />


## Question 3: I can't see the Org Check application, even if I am SysAdmin
 - The app is called "**Org Check**" obviously, maybe you spell it wrong?
 - Did you install the package for a specific set of profiles and maybe you are not part of these ones? (remember we recommended to install the package for admins only...)
 - Assign your user to the included permission set called "**Org Check Users**"
 - You should see the application definitly!


## Question 4: I have the same error on EVERY tabs when the tool is accessing the API: INVALID_SESSION_ID: This session is not valid for use with the REST API 
In case you have enabled the "**API Access Control**" feature and have the "**For admin-approved users, limit API access to only allowlisted connected apps**" option checked, you will need to:
 - Create a permission set.
 - In this permission set, check the system permission called "**Use any API Client**" (which appears ONLY if you activate the "**API Access Control**" feature -- that's why we can't add it to everybody).
 - And assign your user to this additional permission set.

** Warning**: We are working on another workaround as Salesforce decided to depreciate the system permission "**Use any API Client**".

For more information, you can check that closed issue: https://github.com/SalesforceLabs/OrgCheck/issues/118


## Question 5: When installing the app from AppExchange I see error like "This package can’t be installed... Package namespace conflict"
- In this case it is more likely that you are trying to install the application from the AppExchange on a Salesforce Organization where the standalone package is already installed.
- This can be explained easily, both app share the same namespace (aka package name).
- So either you keep the standalone package or you remove it and try to install the app from the AppExchange again.
- Both version are FREE anyway and will be maintained!
- It is up to you to choose the one you prefer!


## Question 6: I have the error INSUFFICIENT_ACCESS: Requires Extra Verification
- This error is because you have set up in your org to raise the user's session to high assurance when performing some actions.
- Please check the setup page called "Identity Verification Setting” (under Setup > Security Controls > Identity Verification), and try to uncheck some actions.
- For some users, changing the setup for both `Manage Sharing` and `Manage Users` solve the issue.
- For other users, changing the setup for `Manage Data Export` was enough to solve the issue.
- Of course we encourage you to change this setting ONLY if it's ok for you (like in a sandbox and not in production).
- This error is documented by Salesforce at https://help.salesforce.com/s/articleView?id=000389171&type=1
- For more information, you can check that closed issue: https://github.com/SalesforceLabs/OrgCheck/issues/458


## Question 7: I see you also have a standalone package
- Historically, Org Check was available as an "**unlocked package**".
- But the prefered way now is to install the application via the AppExchange.
- The benefits of such a package are:
   - We are able to **push a new version** of the package in your org, to make sure you have the latest fixes and features of the application, without to worry about anything. We take care of this.
   - The content of the application can be **modified in your org** (using the Salesforce Dev Console) in case you find a solution to a bug. Do not forget that every component of this package is under the MIT licence. And when we push a new version, your modification will be erased. Use this capability to send us technical feedback and maybe even solutions!
- The following links are pointing to the latest version of the app:

<a href="https://sfdc.co/OrgCheck-InstallToday-SDB"><img src="../assets/pngs/Install-SDBX.png" alt="Installation on sandbox" style="max-width: 300px; min-width: 200px;" width="100%" /></a><br />
<a href="https://sfdc.co/OrgCheck-InstallToday-DE"><img src="../assets/pngs/Install-DevEdition.png" alt="Installation on dev edition" style="max-width: 300px; min-width: 200px;" width="100%" /></a><br />


