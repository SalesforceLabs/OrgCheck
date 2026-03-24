# flags.verbose.summary
Activate the verbose mode in the plugin logs (not in the console!)

# flags.action.summary
Name of the check (or action) you would like to perform on this org 

# flags.accept-the-terms.summary
In production orgs, you need to explicitelly accept the terms before using Org Check in this environment.

# flags.sobject.summary
Filter by SObject API name

# flags.sobject-type.summary
Filter by SObject type (Custom, Standard, or both)

# flags.package.summary
Filter by package/namespace

# flags.csv-file.summary
Filename of the CSV output

# flags.json-file.summary
Filename of the JSON ouput

# flags.xslx-file.summary
Filename of the XSLS output

# check.summary
Check something in the org using Org Check command line

# check.description
Analyze something in your Salesforce org for technical debt and best practices.

# check.examples
- Check all Apex classes in the org
  sf check apex-classes --target-org MyOrg
- Check Apex classes from the ABC package
  sf check apex-classes --package ABC --target-org MyOrg
- Check all Apex unit tests in the org
  sf check apex-tests --target-org MyOrg
- Check Apex unit tests from the ABC package
  sf check apex-tests --package ABC --target-org MyOrg
- Check all Apex triggers in the org
  sf check apex-triggers --target-org MyOrg
- Check Apex triggers from the ABC package
  sf check apex-triggers --package ABC --target-org MyOrg
- Check all Apex classes that need recompilation
  sf check apex-uncompiled --target-org MyOrg
- Check uncompiled Apex classes from the ABC package
  sf check apex-uncompiled --package ABC --target-org MyOrg
- Check all application permissions in the org
  sf check app-permissions --target-org MyOrg
- Check application permissions from the ABC package
  sf check app-permissions --package ABC --target-org MyOrg
- Check browser login history in the org
  sf check browsers --target-org MyOrg
- Check all Chatter groups in the org
  sf check collaboration-groups --target-org MyOrg
- Check all custom fields in the org
  sf check custom-fields --target-org MyOrg
- Check custom fields from the ABC package
  sf check custom-fields --package ABC --target-org MyOrg
- Check custom fields under the Account object
  sf check custom-fields --sobject Account --target-org MyOrg
- Check all custom labels in the org
  sf check custom-labels --target-org MyOrg
- Check custom labels from the ABC package
  sf check custom-labels --package ABC --target-org MyOrg
- Check all custom tabs in the org
  sf check custom-tabs --target-org MyOrg
- Check custom tabs from the ABC package
  sf check custom-tabs --package ABC --target-org MyOrg
- Check all dashboards in the org
  sf check dashboards --target-org MyOrg
- Check all documents in the org
  sf check documents --target-org MyOrg
- Check documents from the ABC package
  sf check documents --package ABC --target-org MyOrg
- Check all email templates in the org
  sf check email-templates --target-org MyOrg
- Check email templates from the ABC package
  sf check email-templates --package ABC --target-org MyOrg
- Check field permissions for the Account object
  sf check field-permissions --sobject Account --target-org MyOrg
- Check field permissions for Account from the ABC package
  sf check field-permissions --sobject Account --package ABC --target-org MyOrg
