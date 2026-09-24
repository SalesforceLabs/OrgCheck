import type { OrgCheckContextValue } from '@/context/OrgCheckContext';

const noop = async () => undefined;
const syncNoop = () => undefined;

export function createOrgCheckTestValue(
  overrides: Partial<OrgCheckContextValue> = {}
): OrgCheckContextValue {
  return {
    api: null,
    initializing: false,
    needsAuth: false,
    authSource: 'none',
    isLoading: false,
    version: 'test',
    salesforceApiVersion: 66,
    usage: {
      accepted: false,
      needConfirmation: false,
      manuallyAccepted: false,
    },
    orgInformation: {
      id: '',
      name: '',
      type: '',
      theme: 'other',
      hasApiAccessControlIssue: false,
    },
    orgLimit: { hasInformation: false, usage: '', theme: 'success' },
    filters: { package: '*', sobjectType: '*', sobjectApiName: '*' },
    filterOptions: { packages: [], types: [], objects: [] },
    filtersReady: true,
    isObjectSpecified: false,
    spinner: {
      isOpen: false,
      isClosable: false,
      hadError: false,
      waitingTime: 0,
      inProgressMessage: '',
      inProgressPercentage: 0,
      sections: [],
    },
    modal: {
      isShown: false,
      isClosable: false,
      headerTitle: '',
      message: '',
      errorChains: [],
    },
    jokes: [],
    tableData: {},
    exportData: {},
    exportBasenames: {},
    storedData: {},
    recipeTitles: new Map(),
    acceptTerms: noop,
    applyFilters: noop,
    refreshFilters: noop,
    refreshCurrentPage: noop,
    loadPageData: noop,
    clearCache: syncNoop,
    getCacheItem: () => undefined,
    closeSpinner: syncNoop,
    interruptSection: syncNoop,
    closeModal: syncNoop,
    openModal: syncNoop,
    showErrors: syncNoop,
    showScore: syncNoop,
    runAllTests: noop,
    recompile: noop,
    logout: noop,
    ...overrides,
  };
}
