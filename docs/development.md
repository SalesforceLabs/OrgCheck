---
layout: default
title: How to setup your own environment to modify the application and propose a PR to the project?
permalink: /development/
---




# Development Setup Guide

This guide will walk you through setting up a developer environment allowing you to deploy Org Check as your own unlocked package.

This page is also a good start if you want to participate in the project and propose your own PR o the team!


## Prerequisites

Before you begin, ensure you have installed the following elements:

- Git
- Npm
- Yarn
- A development tool like VsCode
- Salesforce CLI


## Step 1: Clone the Org Check Project

First, clone the Org Check project repository from GitHub:

```bash
git clone https://github.com/SalesforceLabs/OrgCheck.git
cd OrgCheck
```

Make sure your user is correclty setup in git:
```bash
git config --global user.name "<Your Fullname>"
git config --global user.email "<Your Email>"
```


## Step 2: Connect Developer Orgs

You need two developer orgs:

1. **Dev Hub Org**: Enable Unlocked Packages and Second-Generation Managed Packages settings.
2. **Namespace Org**: A single DevHub can link multiple namespaces, but a packaging project must be linked to one Namespace Org.

### Connect Dev Hub Org

Log in to your Dev Hub org and enable the necessary settings.

### Link Namespace in Dev Hub Org

1. Go to **App Launcher**.
2. Search for **Namespace Registries**.
3. Click **Link** and sign in to your Namespace Org.

## Step 3: Update Project Definition

Edit the `sfdx-project.json` file to specify the namespace:

```json
{
  "packageDirectories": [
    {
      "path": "<namespace>",
      "default": true,
      "package": "<namespace>",
      "versionName": "Beryllium",
      "versionNumber": "4.3.2.NEXT",
      "versionDescription": "Org Check is an easy-to-install and easy-to-use Salesforce application in order to quickly analyze your org and its technical debt."
    }
  ],
  "namespace": "<namespace>",
  "sfdcLoginUrl": "https://login.salesforce.com",
  "sourceApiVersion": "62.0"
}
```
Replace `<namespace>` with your actual namespace.

## Step 4: Rename the Force-App Folder

Rename the `force-app` folder to match your namespace name.

## Step 5: Create the Package

Create the package using the Salesforce CLI:

```bash
sf package create --name <namespace> --package-type Unlocked --path <namespace> --target-dev-hub <devhubalias>
```

Note the generated **Package Id**.

## Step 6: Create a Package Version

Create a package version with the generated **Package Id**:

```bash
sf package version create --package <namespace> --installation-key-bypass --wait 10 --target-dev-hub <devhubalias>
```

Note the **Subscriber Package Version Id** from the output.

## Step 7: Optional - Create a Scratch Org

If you want to use a scratch org, create it using:

```bash
sf org create scratch --definition-file orgs/dev.json --alias <scratchorgalias> --target-dev-hub <devhubalias> --wait 10
```

## Step 8: Deploy the Package

Deploy the package to your org using the **Subscriber Package Version Id**.

```bash
sf package install --package 04tDn0000011NpHIAU -u <scratchorgalias> -w 10
```

Alternatively, you can use the corresponding **alias** of the version id, which has been generated for you (on step 7) in the sfdx-project.json under the section **packageAliases**.

```bash
sf package install --package <namespace>@1.2.3.4 -u <scratchorgalias> -w 10
```

## Debugging

To debug, go to **Setup** in Salesforce:

1. Navigate to **Visualforce Pages**.
2. Look for `OrgCheck_App_VFP`.
3. Click **Preview** to view the page.

If you encounter any issues, check the following:

- Verify the Visualforce page is correctly pointing to your namespace.
- Ensure the namespace is correctly set in `sfdx-project.json`.

## Conclusion

You should now have a fully working unlocked package of Org Check, using your own namespace. For further assistance, refer to the official documentation or reach out to the community. Happy coding!
