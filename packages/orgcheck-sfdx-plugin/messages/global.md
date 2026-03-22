# flags.accept-the-terms.summary
In production orgs, you need to explicitelly accept the terms before using Org Check in this environment.

# flags.sobject.summary
Filter by SObject API name

# flags.sobject-type.summary
Filter by SObject type (Custom, Standard, or both)

# flags.package.summary
Filter by package/namespace

# check.apex-classes.summary
Check all Apex classes in the org or from a package

# check.apex-classes.description
Analyze Apex classes in your Salesforce org for technical debt and best practices. Optionally filter by package/namespace.

# check.apex-classes.examples
- Check all Apex classes in the org
  sf check apex-classes --target-org MyOrg
- Check Apex classes from the ABC package
  sf check apex-classes --package ABC --target-org MyOrg

# check.apex-tests.summary
Check all Apex unit tests in the org or from a package

# check.apex-tests.description
Analyze Apex unit tests in your Salesforce org for technical debt and best practices. Optionally filter by package/namespace.

# check.apex-tests.examples
- Check all Apex unit tests in the org
  sf check apex-tests --target-org MyOrg
- Check Apex unit tests from the ABC package
  sf check apex-tests --package ABC --target-org MyOrg

# check.apex-triggers.summary
Check all Apex triggers in the org or from a package

# check.apex-triggers.description
Analyze Apex triggers in your Salesforce org for technical debt and best practices. Optionally filter by package/namespace.

# check.apex-triggers.examples
- Check all Apex triggers in the org
  sf check apex-triggers --target-org MyOrg
- Check Apex triggers from the ABC package
  sf check apex-triggers --package ABC --target-org MyOrg

# check.apex-uncompiled.summary
Check Apex classes that need recompilation in the org

# check.apex-uncompiled.description
Find Apex classes that are out of sync with the org and need to be recompiled. Optionally filter by package/namespace.

# check.apex-uncompiled.examples
- Check all Apex classes that need recompilation
  sf check apex-uncompiled --target-org MyOrg
- Check uncompiled Apex classes from the ABC package
  sf check apex-uncompiled --package ABC --target-org MyOrg

# check.app-permissions.summary
Check application permissions (app visibility) in the org

# check.app-permissions.description
Analyze which profiles and permission sets grant access to which applications. Optionally filter by package/namespace.

# check.app-permissions.examples
- Check all application permissions in the org
  sf check app-permissions --target-org MyOrg
- Check application permissions from the ABC package
  sf check app-permissions --package ABC --target-org MyOrg

# check.browsers.summary
Check browser login history in the org

# check.browsers.description
Analyze browser information from login history to understand which browsers are used to access your org.

# check.browsers.examples
- Check browser login history in the org
  sf check browsers --target-org MyOrg

# check.collaboration-groups.summary
Check Chatter groups in the org

# check.collaboration-groups.description
Analyze Chatter (Collaboration) groups in your Salesforce org for technical debt and configuration.

# check.collaboration-groups.examples
- Check all Chatter groups in the org
  sf check collaboration-groups --target-org MyOrg

# check.custom-fields.summary
Check custom fields in the org or from a package, type, or object

# check.custom-fields.description
Analyze custom fields in your Salesforce org for technical debt and best practices. Filter by package, SObject type, or specific object.

# check.custom-fields.examples
- Check all custom fields in the org
  sf check custom-fields --target-org MyOrg
- Check custom fields from the ABC package
  sf check custom-fields --package ABC --target-org MyOrg
- Check custom fields under the Account object
  sf check custom-fields --sobject Account --target-org MyOrg

# check.custom-labels.summary
Check custom labels in the org or from a package

# check.custom-labels.description
Analyze custom labels in your Salesforce org for technical debt and best practices. Optionally filter by package/namespace.

# check.custom-labels.examples
- Check all custom labels in the org
  sf check custom-labels --target-org MyOrg
- Check custom labels from the ABC package
  sf check custom-labels --package ABC --target-org MyOrg

# check.custom-tabs.summary
Check custom tabs in the org or from a package

# check.custom-tabs.description
Analyze custom tabs in your Salesforce org for technical debt and best practices. Optionally filter by package/namespace.

# check.custom-tabs.examples
- Check all custom tabs in the org
  sf check custom-tabs --target-org MyOrg
- Check custom tabs from the ABC package
  sf check custom-tabs --package ABC --target-org MyOrg

# check.dashboards.summary
Check dashboards in the org

# check.dashboards.description
Analyze dashboards in your Salesforce org for technical debt and best practices.

# check.dashboards.examples
- Check all dashboards in the org
  sf check dashboards --target-org MyOrg

# check.documents.summary
Check documents in the org or from a package

# check.documents.description
Analyze documents (files) in your Salesforce org for technical debt and best practices. Optionally filter by package/namespace.

# check.documents.examples
- Check all documents in the org
  sf check documents --target-org MyOrg
- Check documents from the ABC package
  sf check documents --package ABC --target-org MyOrg

# check.email-templates.summary
Check email templates in the org or from a package

# check.email-templates.description
Analyze email templates in your Salesforce org for technical debt and best practices. Optionally filter by package/namespace.

# check.email-templates.examples
- Check all email templates in the org
  sf check email-templates --target-org MyOrg
- Check email templates from the ABC package
  sf check email-templates --package ABC --target-org MyOrg

# check.field-permissions.summary
Check field-level security permissions for a given object

# check.field-permissions.description
Analyze which profiles and permission sets grant read/update access to fields on a specific object. Requires --sobject flag.

# check.field-permissions.examples
- Check field permissions for the Account object
  sf check field-permissions --sobject Account --target-org MyOrg
- Check field permissions for Account from the ABC package
  sf check field-permissions --sobject Account --package ABC --target-org MyOrg

# check.flows.summary
Check flows in the org

# check.flows.description
Analyze flows in your Salesforce org for technical debt and best practices.

# check.flows.examples
- Check all flows in the org
  sf check flows --target-org MyOrg

# check.global-view.summary
Check everything in the org at a glance

# check.global-view.description
Run a comprehensive analysis across all metadata types in your org. Returns an overview with counts of good and bad items per category.

# check.global-view.examples
- Check the global view of your org
  sf check global-view --target-org MyOrg
- Get global view as JSON output
  sf check global-view --target-org MyOrg --json

# check.hardcoded-urls.summary
Check Salesforce hard-coded URLs in the org

# check.hardcoded-urls.description
Find hard-coded Salesforce URLs (my.salesforce.com, login.salesforce.com, etc.) in your metadata that may cause issues when moving between environments.

# check.hardcoded-urls.examples
- Check the Salesforce hard-coded URLs of your org
  sf check hardcoded-urls --target-org MyOrg

# check.homepages.summary
Check home page components in the org

# check.homepages.description
Analyze home page components (App Launcher items, etc.) in your Salesforce org for technical debt and best practices.

# check.homepages.examples
- Check all home page components in the org
  sf check homepages --target-org MyOrg

# check.internal-active-users.summary
Check active internal users in the org

# check.internal-active-users.description
Analyze active internal users in your Salesforce org for technical debt and best practices.

# check.internal-active-users.examples
- Check all active internal users in the org
  sf check internal-active-users --target-org MyOrg

# check.knowledge-articles.summary
Check knowledge articles in the org

# check.knowledge-articles.description
Analyze knowledge articles in your Salesforce org for technical debt and best practices.

# check.knowledge-articles.examples
- Check all knowledge articles in the org
  sf check knowledge-articles --target-org MyOrg

# check.lightning-aura-components.summary
Check Lightning Aura components in the org or from a package

# check.lightning-aura-components.description
Analyze Lightning Aura components in your Salesforce org for technical debt and best practices. Optionally filter by package/namespace.

# check.lightning-aura-components.examples
- Check all Lightning Aura components in the org
  sf check lightning-aura-components --target-org MyOrg
- Check Lightning Aura components from the ABC package
  sf check lightning-aura-components --package ABC --target-org MyOrg

# check.lightning-pages.summary
Check Lightning pages in the org or from a package

# check.lightning-pages.description
Analyze Lightning pages (FlexiPages) in your Salesforce org for technical debt and best practices. Optionally filter by package/namespace.

# check.lightning-pages.examples
- Check all Lightning pages in the org
  sf check lightning-pages --target-org MyOrg
- Check Lightning pages from the ABC package
  sf check lightning-pages --package ABC --target-org MyOrg

# check.lightning-web-components.summary
Check Lightning Web Components in the org or from a package

# check.lightning-web-components.description
Analyze Lightning Web Components in your Salesforce org for technical debt and best practices. Optionally filter by package/namespace.

# check.lightning-web-components.examples
- Check all Lightning Web Components in the org
  sf check lightning-web-components --target-org MyOrg
- Check Lightning Web Components from the ABC package
  sf check lightning-web-components --package ABC --target-org MyOrg

# check.object-permissions.summary
Check object permissions (CRUD) in the org or from a package

# check.object-permissions.description
Analyze which profiles and permission sets grant Create, Read, Update, Delete, View All, and Modify All on objects. Optionally filter by package/namespace.

# check.object-permissions.examples
- Check all object permissions in the org
  sf check object-permissions --target-org MyOrg
- Check object permissions from the ABC package
  sf check object-permissions --package ABC --target-org MyOrg

# check.object.summary
Get full description of a given SObject in the org

# check.object.description
Retrieve comprehensive metadata for a specific SObject including fields, layouts, triggers, validation rules, and more. Requires --sobject flag.

# check.object.examples
- Get full description of the Account object in the org
  sf check object --sobject Account --target-org MyOrg

# check.objects.summary
Check all objects in the org or from a package and type

# check.objects.description
Analyze SObjects in your Salesforce org for technical debt and best practices. Filter by package and/or SObject type (Custom, Standard).

# check.objects.examples
- Check all objects in the org
  sf check objects --target-org MyOrg
- Check custom objects from the ABC package
  sf check objects --package ABC --sobject-type Custom --target-org MyOrg

# check.packages.summary
List packages/namespaces in the org

# check.packages.description
Retrieve the list of all packages (managed and unmanaged namespaces) present in your Salesforce org. Useful for understanding org structure and filtering other checks.

# check.packages.examples
- List all packages in the org
  sf check packages --target-org MyOrg

# check.page-layouts.summary
Check page layouts in the org or from a package, type, or object

# check.page-layouts.description
Analyze page layouts in your Salesforce org for technical debt and best practices. Filter by package, SObject type, or specific object.

# check.page-layouts.examples
- Check all page layouts in the org
  sf check page-layouts --target-org MyOrg
- Check page layouts under the Account object
  sf check page-layouts --sobject Account --target-org MyOrg

# check.permission-sets.summary
Check permission sets in the org or from a package

# check.permission-sets.description
Analyze permission sets in your Salesforce org for technical debt and best practices. Optionally filter by package/namespace.

# check.permission-sets.examples
- Check all permission sets in the org
  sf check permission-sets --target-org MyOrg
- Check permission sets from the ABC package
  sf check permission-sets --package ABC --target-org MyOrg

# check.permission-set-licenses.summary
Check permission set licenses in the org or from a package

# check.permission-set-licenses.description
Analyze permission set licenses in your Salesforce org for technical debt and best practices. Optionally filter by package/namespace.

# check.permission-set-licenses.examples
- Check all permission set licenses in the org
  sf check permission-set-licenses --target-org MyOrg
- Check permission set licenses from the ABC package
  sf check permission-set-licenses --package ABC --target-org MyOrg

# check.process-builders.summary
Check Process Builder processes in the org

# check.process-builders.description
Analyze Process Builder processes in your Salesforce org for technical debt and best practices.

# check.process-builders.examples
- Check all Process Builder processes in the org
  sf check process-builders --target-org MyOrg

# check.profile-password-policies.summary
Check profile password policies in the org

# check.profile-password-policies.description
Analyze password policies configured on profiles in your Salesforce org for technical debt and security best practices.

# check.profile-password-policies.examples
- Check all profile password policies in the org
  sf check profile-password-policies --target-org MyOrg

# check.profile-restrictions.summary
Check profile restrictions (login IP ranges, etc.) in the org or from a package

# check.profile-restrictions.description
Analyze profile restrictions (login IP ranges, hours) in your Salesforce org for technical debt and best practices. Optionally filter by package/namespace.

# check.profile-restrictions.examples
- Check all profile restrictions in the org
  sf check profile-restrictions --target-org MyOrg
- Check profile restrictions from the ABC package
  sf check profile-restrictions --package ABC --target-org MyOrg

# check.profiles.summary
Check all profiles in the org or from a package

# check.profiles.description
Analyze profiles in your Salesforce org for technical debt and best practices. Optionally filter by package/namespace.

# check.profiles.examples
- Check all profiles in the org
  sf check profiles --target-org MyOrg
- Check profiles from the ABC package
  sf check profiles --package ABC --target-org MyOrg

# check.public-groups.summary
Check public groups in the org

# check.public-groups.description
Analyze public groups in your Salesforce org for technical debt and best practices.

# check.public-groups.examples
- Check all public groups in the org
  sf check public-groups --target-org MyOrg

# check.queues.summary
Check queues in the org

# check.queues.description
Analyze queues in your Salesforce org for technical debt and best practices.

# check.queues.examples
- Check all queues in the org
  sf check queues --target-org MyOrg

# check.record-types.summary
Check record types in the org or from a package, type, or object

# check.record-types.description
Analyze record types in your Salesforce org for technical debt and best practices. Filter by package, SObject type, or specific object.

# check.record-types.examples
- Check all record types in the org
  sf check record-types --target-org MyOrg
- Check record types under the Account object
  sf check record-types --sobject Account --target-org MyOrg

# check.reports.summary
Check reports in the org

# check.reports.description
Analyze reports in your Salesforce org for technical debt and best practices.

# check.reports.examples
- Check all reports in the org
  sf check reports --target-org MyOrg

# check.static-resources.summary
Check static resources in the org or from a package

# check.static-resources.description
Analyze static resources in your Salesforce org for technical debt and best practices. Optionally filter by package/namespace.

# check.static-resources.examples
- Check all static resources in the org
  sf check static-resources --target-org MyOrg
- Check static resources from the ABC package
  sf check static-resources --package ABC --target-org MyOrg

# check.user-roles.summary
Check user roles in the org

# check.user-roles.description
Analyze user roles and the role hierarchy in your Salesforce org for technical debt and best practices.

# check.user-roles.examples
- Check all user roles in the org
  sf check user-roles --target-org MyOrg

# check.validation-rules.summary
Check validation rules in the org or from a package, type, or object

# check.validation-rules.description
Analyze validation rules in your Salesforce org for technical debt and best practices. Filter by package, SObject type, or specific object.

# check.validation-rules.examples
- Check all validation rules in the org
  sf check validation-rules --target-org MyOrg
- Check validation rules under the Account object
  sf check validation-rules --sobject Account --target-org MyOrg

# check.visualforce-components.summary
Check Visualforce components in the org or from a package

# check.visualforce-components.description
Analyze Visualforce components in your Salesforce org for technical debt and best practices. Optionally filter by package/namespace.

# check.visualforce-components.examples
- Check all Visualforce components in the org
  sf check visualforce-components --target-org MyOrg
- Check Visualforce components from the ABC package
  sf check visualforce-components --package ABC --target-org MyOrg

# check.visualforce-pages.summary
Check Visualforce pages in the org or from a package

# check.visualforce-pages.description
Analyze Visualforce pages in your Salesforce org for technical debt and best practices. Optionally filter by package/namespace.

# check.visualforce-pages.examples
- Check all Visualforce pages in the org
  sf check visualforce-pages --target-org MyOrg
- Check Visualforce pages from the ABC package
  sf check visualforce-pages --package ABC --target-org MyOrg

# check.web-links.summary
Check all web links in the org or from a package, type, or object

# check.web-links.description
Analyze web links in your Salesforce org for technical debt and best practices. Filter by package, SObject type, or specific object.

# check.web-links.examples
- Check all web links in the org
  sf check web-links --target-org MyOrg
- Check web links from the ABC package in the org
  sf check web-links --package ABC --target-org MyOrg
- Check web links under the Account object in the org
  sf check web-links --sobject Account --target-org MyOrg

# check.workflows.summary
Check workflows in the org

# check.workflows.description
Analyze workflow rules in your Salesforce org for technical debt and best practices.

# check.workflows.examples
- Check all workflows in the org
  sf check workflows --target-org MyOrg
