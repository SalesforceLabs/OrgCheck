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
2. **Namespace Org**: A single DevHub can link multiple namespaces, but a packaging project must be linked to one Namespace Org.(Not available in a Dev Hub Org)

### Set up a Namespace for Packages

1. Go to **Setup**.
2. Search for **Package Manager**.
3. Click **Edit** next to **Namespace Settings**.
4. Enter a Namespace Prefix.
5. Check Availability and Confirm. 

### Link Namespace in Dev Hub Org

> Pre-requisite: Enable Unlocked Packages and Second-Generation Managed Packages

1. Log in to your **Dev Hub**.
1. Go to **App Launcher**.
2. Search for **Namespace Registries**.
3. Click **Link** and sign in to your Namespace Org.

## Step 3: Update Project Definition

Create a fresh `sfdx-project.json` file with your namespace:

```json
{
  "packageDirectories": [
    {
      "path": "force-app",
      "default": true
    }
  ],
  "namespace": "<yournamespace>",
  "sfdcLoginUrl": "https://login.salesforce.com",
  "sourceApiVersion": "64.0"
}
```
Replace `<namespace>` with your actual namespace.

## Step 4: Rename the Force-App Folder

Rename the `force-app` folder to match your namespace name.

## Step 5: Create the Package

> Pre-requisite: `sf plugins install @salesforce/plugin-packaging`
Create the package using the Salesforce CLI:

```bash
sf package create --name "Org Check" --package-type Managed --path force-app --target-dev-hub <yourdevhuborgalias>
```

## Step 6: Create the Static Resource

Use `build-static-resource.sh` (bash) or `build-static-resource.ps1`(powershell) to generate a Static resource at: force-app/main/default/staticresources/OrgCheck_SR.resource

```bash
build/build-static-resource.sh
```

## Step 6: Create a Package Version

Create a package version with the generated **Package Id**:

```bash
sf package version create --package "Org Check" --installation-key-bypass --wait 10 --target-dev-hub <devhubalias>
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
