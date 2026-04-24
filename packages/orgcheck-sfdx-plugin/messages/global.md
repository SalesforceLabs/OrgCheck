# check.summary
Welcome to the Org Check CLI plugin!

# check.description
Welcome to the Org Check CLI plugin!

# check.examples
Welcome to the Org Check CLI plugin!



# flags.action.summary
Name of the check (or action) you would like to perform on this org 

# flags.accept-the-terms.summary
In production orgs, you need to explicitly accept the terms before using Org Check in this environment.

# flags.sobject.summary
Filter by SObject API name

# flags.sobject-type.summary
Filter by SObject type (Custom, Standard, or both)

# flags.package.summary
Filter by package/namespace

# flags.csv-file.summary
Filename of the CSV output

# flags.json-file.summary
Filename of the JSON output

# flags.xlsx-file.summary
Filename of the XLSX output

# flags.invalidate-cache.summary
Make sure the entries you need from the cache are flushed before starting






# check.apex-classes.summary
Check Apex Classes in the org using Org Check command line

# check.apex-classes.description
Analyze Apex Classes in your Salesforce org for technical debt and best practices.

# check.apex-classes.examples
- Check all Apex classes in the org
  sf check apex-classes --target-org MyOrg
- Check Apex classes from the ABC package
  sf check apex-classes --package ABC --target-org MyOrg
- Check Apex classes and export the result as an excel file
  sf check apex-classes --package ABC --target-org MyOrg --xlsx-file /tmp/results.xlsx
- Check Apex classes and export the result as a CSV file
  sf check apex-classes --package ABC --target-org MyOrg --csv-file /tmp/results.csv
- Check Apex classes and export the result as a JSON file
  sf check apex-classes --package ABC --target-org MyOrg --json-file /tmp/results.json




# check.hardcoded-urls.summary
Check Hardcoded URLs in the org across multiple metadata types using Org Check command line

# check.hardcoded-urls.description
Analyze multiple metadata types and look for Salesforce hardcoded URLs such as salesforce.com or force.com

# check.hardcoded-urls.examples
- Check all Hardcoded URLs in the org
  sf check hardcoded-urls --target-org MyOrg
- Check all Hardcoded URLs in the org and export the result as an excel file
  sf check hardcoded-urls --package ABC --target-org MyOrg --xlsx-file /tmp/results.xlsx
- Check all Hardcoded URLs in the org and export the result as a CSV file
  sf check hardcoded-urls --package ABC --target-org MyOrg --csv-file /tmp/results.csv
- Check all Hardcoded URLs in the org and export the result as a JSON file
  sf check hardcoded-urls --package ABC --target-org MyOrg --json-file /tmp/results.json





# check.global-view.summary
Check all the metadata that Org Check can scan at once in the org using Org Check command line

# check.global-view.description
Analyze all the metadata that Org Check can scan at once and get some stats and details out of it

# check.global-view.examples
- Check the Global View of the org
  sf check global-view --target-org MyOrg
- Check the Global View of the org and export the result as an excel file
  sf check global-view --target-org MyOrg --xlsx-file /tmp/results.xlsx
- Check the Global View of the org and export the result as a CSV file
  sf check global-view --target-org MyOrg --csv-file /tmp/results.csv
- Check the Global View of the org and export the result as a JSON file
  sf check global-view --target-org MyOrg --json-file /tmp/results.json






# check.run-all-tests.summary
Run all tests in the org using Org Check command line

# check.run-all-tests.description
Run all tests in the org using Org Check command line before calling `check apex-classes`

# check.run-all-tests.examples
- Run all tests in the org
  sf check run-all-tests --target-org MyOrg






# check.clear-all-cache.summary
Clear all local cache items for this org

# check.clear-all-cache.description
Clear all local cache items for this org

# check.clear-all-cache.examples
- Clear all cache items for this org
  sf check clear--all-cache --target-org MyOrg