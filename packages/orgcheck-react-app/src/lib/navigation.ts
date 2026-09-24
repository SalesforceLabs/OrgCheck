import { Recipes, type RecipeAliases } from '@orgcheck/api';

export const ANY = '*';
export const EMPTY = '';

export type RecipeAction = 'runAllTests' | 'recompile';

export type PageKind =
  | 'welcome'
  | 'cache'
  | 'global-view'
  | 'object'
  | 'field-permissions'
  | 'role-hierarchy'
  | 'recipe';

export type NavPage = {
  key: string;
  path: string;
  label: string;
  kind: PageKind;
  recipe?: RecipeAliases;
  dataKey?: string;
  refreshButtonVisible?: boolean;
  requiresObject?: boolean;
  emptyMessage?: string;
  showScore?: boolean;
  extraAction?: RecipeAction;
  legend?: string;
  intro?: string;
  storeData?: boolean;
};

export type NavSection = {
  key: string;
  title: string;
  pages: NavPage[];
};

export const NAVIGATION: NavSection[] = [
  {
    key: 'A',
    title: 'Home',
    pages: [
      { key: '01', path: '/', label: '👋 Welcome!', kind: 'welcome', refreshButtonVisible: false },
      { key: '02', path: '/cache', label: '🧹 Cache', kind: 'cache', dataKey: 'cacheitems', refreshButtonVisible: false },
      {
        key: '03',
        path: '/score-rules',
        label: 'Help',
        kind: 'recipe',
        recipe: Recipes.SCORE_RULES,
        dataKey: 'scorerules',
        refreshButtonVisible: false,
        emptyMessage: 'There is no score rule to show.',
      },
    ],
  },
  {
    key: 'B',
    title: '🗺️ Salesforce Organization',
    pages: [
      { key: '04', path: '/global-view', label: 'Global view', kind: 'global-view', recipe: Recipes.GLOBAL_VIEW, dataKey: 'globalview' },
      { key: '05', path: '/hardcoded-urls', label: 'Hardcoded URLs', kind: 'recipe', recipe: Recipes.HARDCODED_URLS_VIEW, dataKey: 'hardcodedurls', emptyMessage: 'There is no hardcoded URL to show.' },
    ],
  },
  {
    key: 'C',
    title: '⚽ Data model',
    pages: [
      { key: '06', path: '/object', label: 'Object documentation', kind: 'object', recipe: Recipes.OBJECT, dataKey: 'object', requiresObject: true },
      { key: '07', path: '/objects', label: 'Objects', kind: 'recipe', recipe: Recipes.OBJECTS, dataKey: 'objects', emptyMessage: 'There is no object to show.', showScore: true },
      { key: '08', path: '/custom-fields', label: 'Custom fields', kind: 'recipe', recipe: Recipes.CUSTOM_FIELDS, dataKey: 'customfields', emptyMessage: 'There is no custom field to show.', showScore: true },
      { key: '09', path: '/page-layouts', label: 'Page layouts', kind: 'recipe', recipe: Recipes.PAGE_LAYOUTS, dataKey: 'pagelayouts', emptyMessage: 'There is no page layouts to show.', showScore: true },
      { key: '0A', path: '/validation-rules', label: 'Validation rules', kind: 'recipe', recipe: Recipes.VALIDATION_RULES, dataKey: 'validationrules', emptyMessage: 'There is no validation rule to show.', showScore: true },
      { key: '0B', path: '/record-types', label: 'Record types', kind: 'recipe', recipe: Recipes.RECORD_TYPES, dataKey: 'recordtypes', emptyMessage: 'There is no record type to show', showScore: true },
      { key: '0C', path: '/web-links', label: 'Web links', kind: 'recipe', recipe: Recipes.WEBLINKS, dataKey: 'weblinks', emptyMessage: 'There is no web links to show', showScore: true },
      { key: '32', path: '/sharing-rules', label: 'Sharing rules', kind: 'recipe', recipe: Recipes.SHARING_RULES, dataKey: 'sharingrules', emptyMessage: 'There is no sharing rules to show.', showScore: true },
    ],
  },
  {
    key: 'D',
    title: '👮 Security and Access',
    pages: [
      { key: '0D', path: '/users', label: 'Internal active users', kind: 'recipe', recipe: Recipes.INTERNAL_ACTIVE_USERS, dataKey: 'internalactiveusers', emptyMessage: 'There is no active internal user to show.', showScore: true },
      { key: '0E', path: '/profiles', label: 'Profiles', kind: 'recipe', recipe: Recipes.PROFILES, dataKey: 'profiles', emptyMessage: 'There is no profile to show.', showScore: true },
      { key: '0F', path: '/permission-sets', label: 'Permission sets', kind: 'recipe', recipe: Recipes.PERMISSION_SETS, dataKey: 'permissionsets', emptyMessage: 'There is no permission to show.', showScore: true },
      { key: '10', path: '/permission-set-licenses', label: 'Permission set licenses', kind: 'recipe', recipe: Recipes.PERMISSION_SET_LICENSES, dataKey: 'permissionsetlicenses', emptyMessage: 'There is no permission to show.', showScore: true },
      { key: '11', path: '/profile-restrictions', label: 'Profile restrictions', kind: 'recipe', recipe: Recipes.PROFILE_RESTRICTIONS, dataKey: 'profilerestrictions', emptyMessage: 'There is no profile restriction to show.', showScore: true },
      { key: '12', path: '/profile-password-policies', label: 'Profile password policies', kind: 'recipe', recipe: Recipes.PROFILE_PWD_POLICIES, dataKey: 'profilepasswordpolicies', emptyMessage: 'There is no profile password policy to show.', showScore: true },
      { key: '13', path: '/object-permissions', label: 'Object permissions', kind: 'recipe', recipe: Recipes.OBJECT_PERMISSIONS, dataKey: 'objectpermissions', emptyMessage: 'There is no object permission to show.', legend: 'C means Create, R means Read, U means Update/Modify, D means Delete, v means View All and m means Modify All.' },
      { key: '14', path: '/field-permissions', label: 'Field permissions', kind: 'field-permissions', recipe: Recipes.FIELD_PERMISSIONS, dataKey: 'fieldpermissions', requiresObject: true, emptyMessage: 'There is no field permission to show.', legend: 'R means field can be read, U means field can be updated.' },
      { key: '15', path: '/app-permissions', label: 'App permissions', kind: 'recipe', recipe: Recipes.APP_PERMISSIONS, dataKey: 'apppermissions', emptyMessage: 'There is no application permission to show.', legend: 'A means Accessible and V means Visible.' },
      { key: '16', path: '/browsers', label: 'Browsers', kind: 'recipe', recipe: Recipes.BROWSERS, dataKey: 'browsers', emptyMessage: 'There is no browser to show.', showScore: true, intro: 'If you are interested in the login history details, please go to the Login History setup page where you can download the last six months of login history.' },
      { key: '31', path: '/release-updates', label: 'Release updates', kind: 'recipe', recipe: Recipes.RELEASE_UPDATES, dataKey: 'releaseupdates', emptyMessage: 'There is no Release Updates to show.', showScore: true },
    ],
  },
  {
    key: 'E',
    title: '🐇 Boxes',
    pages: [
      { key: '17', path: '/role-explorer', label: '🐙 Internal Role Explorer', kind: 'role-hierarchy', dataKey: 'userrolestree' },
      { key: '18', path: '/roles', label: 'Roles', kind: 'recipe', recipe: Recipes.USER_ROLES, dataKey: 'userroles', emptyMessage: 'There is no role to show.', showScore: true },
      { key: '19', path: '/public-groups', label: 'Public groups', kind: 'recipe', recipe: Recipes.PUBLIC_GROUPS, dataKey: 'publicgroups', emptyMessage: 'There is no public group to show.', showScore: true },
      { key: '1A', path: '/queues', label: 'Queues', kind: 'recipe', recipe: Recipes.QUEUES, dataKey: 'queues', emptyMessage: 'There is no queue to show.', showScore: true },
      { key: '1B', path: '/chatter-groups', label: 'Chatter groups', kind: 'recipe', recipe: Recipes.COLLABORATION_GROUPS, dataKey: 'chattergroups', emptyMessage: 'There is no chatter group to show.', showScore: true },
    ],
  },
  {
    key: 'F',
    title: '🤖 Automations',
    pages: [
      { key: '1C', path: '/flows', label: 'Flows', kind: 'recipe', recipe: Recipes.FLOWS, dataKey: 'flows', emptyMessage: 'There is no flow to show.', showScore: true },
      { key: '1D', path: '/process-builders', label: 'Process builders', kind: 'recipe', recipe: Recipes.PROCESS_BUILDERS, dataKey: 'processbuilders', emptyMessage: 'There is no process builder to show.', showScore: true },
      { key: '1E', path: '/workflows', label: 'Workflows', kind: 'recipe', recipe: Recipes.WORKFLOWS, dataKey: 'workflows', emptyMessage: 'There is no workflow to show.', showScore: true, intro: 'Salesforce provides a migration tool for your workflows.' },
    ],
  },
  {
    key: 'G',
    title: '🎁 Setting',
    pages: [
      { key: '1F', path: '/custom-labels', label: 'Custom labels', kind: 'recipe', recipe: Recipes.CUSTOM_LABELS, dataKey: 'customlabels', emptyMessage: 'There is no custom label to show.', showScore: true },
      { key: '20', path: '/documents', label: 'Documents', kind: 'recipe', recipe: Recipes.DOCUMENTS, dataKey: 'documents', emptyMessage: 'There is no document to show.', showScore: true },
      { key: '21', path: '/email-templates', label: 'Email templates', kind: 'recipe', recipe: Recipes.EMAIL_TEMPLATES, dataKey: 'emailtemplates', emptyMessage: 'There is no email template to show.', showScore: true },
      { key: '22', path: '/knowledge-articles', label: 'Knowledge articles', kind: 'recipe', recipe: Recipes.KNOWLEDGE_ARTICLES, dataKey: 'knowledgearticles', emptyMessage: 'There is no knowledge article to show.', showScore: true },
      { key: '23', path: '/static-resources', label: 'Static resources', kind: 'recipe', recipe: Recipes.STATIC_RESOURCES, dataKey: 'staticresources', emptyMessage: 'There is no static resource to show.', showScore: true },
    ],
  },
  {
    key: 'H',
    title: '🥐 User Interface',
    pages: [
      { key: '24', path: '/visualforce-pages', label: 'Visualforce pages', kind: 'recipe', recipe: Recipes.VISUALFORCE_PAGES, dataKey: 'visualforcepages', emptyMessage: 'There is no visual force page to show.', showScore: true },
      { key: '25', path: '/visualforce-components', label: 'Visualforce components', kind: 'recipe', recipe: Recipes.VISUALFORCE_COMPONENTS, dataKey: 'visualforcecomponents', emptyMessage: 'There is no visual force component to show.', showScore: true },
      { key: '26', path: '/lightning-pages', label: 'Lightning pages', kind: 'recipe', recipe: Recipes.LIGHTNING_PAGES, dataKey: 'lightningpages', emptyMessage: 'There is no Lightning Page to show.', showScore: true },
      { key: '27', path: '/lightning-aura-components', label: 'Lightning Aura components', kind: 'recipe', recipe: Recipes.LIGHTNING_AURA_COMPONENTS, dataKey: 'lightningauracomponents', emptyMessage: 'There is no Lightning Aura Component to show.', showScore: true },
      { key: '28', path: '/lightning-web-components', label: 'Lightning web components', kind: 'recipe', recipe: Recipes.LIGHTNING_WEB_COMPONENTS, dataKey: 'lightningwebcomponents', emptyMessage: 'There is no Lightning Web Component to show.', showScore: true },
      { key: '29', path: '/home-pages', label: 'Home page components', kind: 'recipe', recipe: Recipes.HOME_PAGE_COMPONENTS, dataKey: 'homepages', emptyMessage: 'There is no Home Page Component to show.', showScore: true },
      { key: '2A', path: '/custom-tabs', label: 'Custom tabs', kind: 'recipe', recipe: Recipes.CUSTOM_TABS, dataKey: 'customtabs', emptyMessage: 'There is no Custom Tab to show.', showScore: true },
    ],
  },
  {
    key: 'I',
    title: '🔥 Programmatic',
    pages: [
      { key: '2B', path: '/apex-classes', label: 'Apex classes', kind: 'recipe', recipe: Recipes.APEX_CLASSES, dataKey: 'apexclasses', emptyMessage: 'There is no Apex Class to show.', showScore: true, extraAction: 'runAllTests' },
      { key: '2C', path: '/apex-uncompiled', label: 'Apex uncompiled', kind: 'recipe', recipe: Recipes.APEX_UNCOMPILED, dataKey: 'apexuncompiled', emptyMessage: 'There is no Apex Uncompiled Class to show.', showScore: true, extraAction: 'recompile', storeData: true },
      { key: '2D', path: '/apex-triggers', label: 'Apex triggers', kind: 'recipe', recipe: Recipes.APEX_TRIGGERS, dataKey: 'apextriggers', emptyMessage: 'There is no Apex Trigger to show.', showScore: true },
      { key: '2E', path: '/apex-tests', label: 'Apex tests', kind: 'recipe', recipe: Recipes.APEX_TESTS, dataKey: 'apextests', emptyMessage: 'There is no Apex Unit Test to show.', showScore: true },
    ],
  },
  {
    key: 'J',
    title: '⛰️ Analytics',
    pages: [
      { key: '2F', path: '/reports', label: 'Reports', kind: 'recipe', recipe: Recipes.REPORTS, dataKey: 'reports', emptyMessage: 'There is no Report to show.', showScore: true },
      { key: '30', path: '/dashboards', label: 'Dashboards', kind: 'recipe', recipe: Recipes.DASHBOARDS, dataKey: 'dashboards', emptyMessage: 'There is no Dashboard to show.', showScore: true },
    ],
  },
];

export function findPageByPath(pathname: string): NavPage | undefined {
  const normalized = pathname === '' ? '/' : pathname;
  for (const section of NAVIGATION) {
    const match = section.pages.find(page => page.path === normalized);
    if (match) return match;
  }
  return undefined;
}

export function allPages(): NavPage[] {
  return NAVIGATION.flatMap(section => section.pages);
}
