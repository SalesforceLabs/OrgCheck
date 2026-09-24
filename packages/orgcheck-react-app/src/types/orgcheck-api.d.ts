declare module '@orgcheck/api' {
  export type RecipeAliases = string;

  export const Recipes: Record<string, string> & {
    SCORE_RULES: string;
    GLOBAL_VIEW: string;
    HARDCODED_URLS_VIEW: string;
    OBJECT: string;
    OBJECTS: string;
    CUSTOM_FIELDS: string;
    PAGE_LAYOUTS: string;
    VALIDATION_RULES: string;
    RECORD_TYPES: string;
    WEBLINKS: string;
    SHARING_RULES: string;
    INTERNAL_ACTIVE_USERS: string;
    PROFILES: string;
    PERMISSION_SETS: string;
    PERMISSION_SET_LICENSES: string;
    PROFILE_RESTRICTIONS: string;
    PROFILE_PWD_POLICIES: string;
    OBJECT_PERMISSIONS: string;
    FIELD_PERMISSIONS: string;
    APP_PERMISSIONS: string;
    BROWSERS: string;
    RELEASE_UPDATES: string;
    USER_ROLES: string;
    PUBLIC_GROUPS: string;
    QUEUES: string;
    COLLABORATION_GROUPS: string;
    FLOWS: string;
    PROCESS_BUILDERS: string;
    WORKFLOWS: string;
    CUSTOM_LABELS: string;
    DOCUMENTS: string;
    EMAIL_TEMPLATES: string;
    KNOWLEDGE_ARTICLES: string;
    STATIC_RESOURCES: string;
    VISUALFORCE_PAGES: string;
    VISUALFORCE_COMPONENTS: string;
    LIGHTNING_PAGES: string;
    LIGHTNING_AURA_COMPONENTS: string;
    LIGHTNING_WEB_COMPONENTS: string;
    HOME_PAGE_COMPONENTS: string;
    CUSTOM_TABS: string;
    APEX_CLASSES: string;
    APEX_UNCOMPILED: string;
    APEX_TRIGGERS: string;
    APEX_TESTS: string;
    REPORTS: string;
    DASHBOARDS: string;
  };

  export interface LoggerSetup {
    started(operationName: string): void;
    messageLogged(operationName: string, message?: string): void;
    endedWithErrors(operationName: string, errors?: Error[]): void;
    endedSuccessfully(operationName: string): void;
    stopped(operationName: string): void;
    canBeInterrupted(operationName: string, interruptCallback: () => void): void;
  }

  export interface ApiSetup {
    logSettings: LoggerSetup;
    salesforce: {
      connection?: unknown;
      authenticationOptions?: { accessToken?: string };
    };
    storage: {
      setItem(key: string, value: string): void;
      getItem(key: string): string;
      removeItem(key: string): void;
      key(n: number): string;
      length(): number;
    };
  }

  export interface Table {
    name: string;
    definition: {
      columns: { label: string; type?: string; orientation?: 'horizontal' | 'vertical' }[];
    };
    orderIndex: number;
    orderSort: 'asc' | 'desc';
    rows: Array<{
      index: number;
      name: string;
      score: number;
      badFields: string[];
      badReasonIds: string[];
      cells: Record<string, unknown>[];
      isVisible: boolean;
    }>;
    nbAllRows: number;
    hasData: boolean;
    nbFilteredRows: number;
    nbBadRows: number;
    isFilterOn: boolean;
    isFilteredDataEmpty: boolean;
  }

  export interface ExportedTable {
    label: string;
    columns: string[];
    rows: string[][];
  }

  export interface ScoreRule {
    description: string;
    errorMessage: string;
  }

  export interface SalesforceUsageInformationIntf {
    currentUsagePercentage?: number;
    isGreenZone?: boolean;
    isYellowZone?: boolean;
  }

  export interface ApiIntf {
    version: string;
    salesforceApiVersion: number;
    orgId?: string;
    dailyApiRequestLimitInformation: SalesforceUsageInformationIntf;
    clearCache(): void;
    listCacheItems(includeEmptyItems?: boolean): Array<{
      name: string;
      isEmpty: boolean;
      isMap: boolean;
      isArray: boolean;
      isObject: boolean;
      length: number;
      created: string;
    }>;
    getCacheItem(itemName: string): unknown;
    getOrganizationInformation(): Promise<{
      id: string;
      name: string;
      type: string;
      isProduction: boolean;
      isSandbox: boolean;
    }>;
    checkCurrentUserPermissions(): Promise<boolean>;
    runAllTestsAsync(): Promise<string>;
    compileClasses(
      apexClassIds: string[]
    ): Promise<Map<string, { isSuccess: boolean; reasons?: string[] }>>;
    checkUsageTerms(): Promise<boolean>;
    wereUsageTermsAcceptedManually(): boolean;
    acceptUsageTermsManually(): void;
    getPackages(): Promise<unknown[]>;
    getObjectTypes(): Promise<unknown[]>;
    getObjects(namespace?: string, sobjectType?: string): Promise<unknown[]>;
    clearObjects(): void;
    clearPackages(): void;
    getRolesAsTree(): Promise<unknown>;
    cachestampData(
      alias: string,
      namespace: string,
      sobjectType: string,
      sobject: string
    ): string;
    prepareData(
      alias: string,
      namespace: string,
      sobjectType: string,
      sobject: string
    ): Promise<unknown>;
    serveData(alias: string, mixture: unknown): Promise<unknown>;
    exportData(alias: string, plate: unknown): Promise<ExportedTable | ExportedTable[]>;
    titlesForAllData(): Map<string, string>;
    cleanData(
      alias: string,
      namespace: string,
      sobjectType: string,
      sobject: string
    ): void;
  }

  export class ApiFactory {
    static create(setup: ApiSetup): ApiIntf;
  }

  export class Rules {
    static get(id: number): ScoreRule | undefined;
  }

  export class TableUtils {
    static sort(table: Table, columnIndex: number, order: 'asc' | 'desc'): void;
    static filter(table: Table, searchInput: string): void;
    static exportAsXls(source: ExportedTable | ExportedTable[]): ArrayBuffer;
  }
}
