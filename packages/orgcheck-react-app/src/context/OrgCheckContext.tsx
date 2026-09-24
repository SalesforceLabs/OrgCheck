import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { ApiIntf, ExportedTable, Table } from '@orgcheck/api';
import { createOrgCheckApi, Rules } from '@/lib/orgcheck-bootstrap';
import { ANY, EMPTY, findPageByPath, type NavPage } from '@/lib/navigation';
import { KONAMI_SEQUENCE, pickJokesOfTheDay, type Joke } from '@/lib/jokes';
import { resolveSalesforceSession } from '@/lib/session';
import {
  isOAuthCallbackLocation,
  isOAuthSessionIdle,
  revokeOAuthSession,
  touchOAuthActivity,
} from '@/lib/oauth';
import { escapeHtml, toSalesforceHref } from '@/lib/html';
import { clearOrgInstanceUrl } from '@/lib/org-instance-url';

export type SpinnerSectionStatus = 'in-progress' | 'ended' | 'failed';

export type SpinnerSection = {
  id: string;
  status: SpinnerSectionStatus;
  label: string;
  contextInformation?: { key: string; value: string }[];
  showInterruptButton: boolean;
  isInterrupted: boolean;
};

export type SpinnerState = {
  isOpen: boolean;
  isClosable: boolean;
  hadError: boolean;
  waitingTime: number;
  inProgressMessage: string;
  inProgressPercentage: number;
  sections: SpinnerSection[];
};

export type ModalState = {
  isShown: boolean;
  isClosable: boolean;
  headerTitle: string;
  message: string;
  errorChains: { index: number; message: string; body: string }[];
};

export type OrgFilters = {
  package: string;
  sobjectType: string;
  sobjectApiName: string;
};

export type FilterOption = { label: string; value: string };

type PackageLike = { name?: string; namespace?: string; type?: string };
type TypeLike = { label?: string; id?: string };
type ObjectLike = {
  package?: string;
  typeId?: string;
  typeRef?: { label?: string };
  label?: string;
  name?: string;
  id?: string;
};

type DataPlate = Table | Table[] | unknown;

export type OrgCheckContextValue = {
  api: ApiIntf | null;
  initializing: boolean;
  needsAuth: boolean;
  authSource: 'none' | 'platform' | 'env' | 'oauth';
  isLoading: boolean;
  version: string;
  salesforceApiVersion: number;
  usage: { accepted: boolean; needConfirmation: boolean; manuallyAccepted: boolean };
  orgInformation: {
    id: string;
    name: string;
    type: string;
    theme: 'production' | 'sandbox' | 'other';
    hasApiAccessControlIssue: boolean;
  };
  orgLimit: { hasInformation: boolean; usage: string; theme: 'success' | 'warning' | 'error' };
  filters: OrgFilters;
  filterOptions: {
    packages: FilterOption[];
    types: FilterOption[];
    objects: FilterOption[];
  };
  filtersReady: boolean;
  isObjectSpecified: boolean;
  spinner: SpinnerState;
  modal: ModalState;
  jokes: Joke[];
  tableData: Record<string, DataPlate>;
  exportData: Record<string, ExportedTable | ExportedTable[]>;
  exportBasenames: Record<string, string>;
  storedData: Record<string, unknown>;
  recipeTitles: Map<string, string>;
  acceptTerms: () => Promise<void>;
  applyFilters: (next: OrgFilters) => Promise<void>;
  refreshFilters: () => Promise<void>;
  refreshCurrentPage: () => Promise<void>;
  loadPageData: (page: NavPage, forceRefresh?: boolean) => Promise<void>;
  clearCache: () => void;
  getCacheItem: (name: string) => unknown;
  closeSpinner: () => void;
  interruptSection: (sectionId: string) => void;
  closeModal: () => void;
  openModal: (title: string, content: string, isClosable?: boolean) => void;
  showErrors: (context: string, errors: unknown) => void;
  showScore: (detail: {
    whatId: string;
    whatName: string;
    score: number;
    reasonIds?: number[];
  }) => void;
  runAllTests: () => Promise<void>;
  recompile: () => Promise<void>;
  logout: () => Promise<void>;
};

const OrgCheckContext = createContext<OrgCheckContextValue | null>(null);

const INITIAL_SPINNER: SpinnerState = {
  isOpen: false,
  isClosable: false,
  hadError: false,
  waitingTime: 0,
  inProgressMessage: '',
  inProgressPercentage: 0,
  sections: [],
};

const INITIAL_MODAL: ModalState = {
  isShown: false,
  isClosable: false,
  headerTitle: '',
  message: '',
  errorChains: [],
};

function asErrorArray(errors: unknown): Error[] {
  if (Array.isArray(errors)) {
    return errors.map(item =>
      item instanceof Error ? item : new Error(String(item))
    );
  }
  if (errors instanceof Error) return [errors];
  return [new Error(String(errors ?? 'Unknown error'))];
}

export function OrgCheckProvider({ children }: { children: ReactNode }) {
  const apiRef = useRef<ApiIntf | null>(null);
  const interruptibles = useRef(new Map<string, () => void>());
  const keysIndex = useRef(new Map<string, number>());
  const lastAlias = useRef(new Map<string, string>());
  const spinnerTimer = useRef<number | undefined>(undefined);
  const openSince = useRef<number>(0);

  const [api, setApi] = useState<ApiIntf | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [authSource, setAuthSource] = useState<OrgCheckContextValue['authSource']>('none');
  const [isLoading, setIsLoading] = useState(false);
  const [version, setVersion] = useState('');
  const [salesforceApiVersion, setSalesforceApiVersion] = useState(0);
  const [usage, setUsage] = useState({
    accepted: false,
    needConfirmation: false,
    manuallyAccepted: false,
  });
  const [orgInformation, setOrgInformation] = useState<
    OrgCheckContextValue['orgInformation']
  >({
    id: '',
    name: '',
    type: '',
    theme: 'other',
    hasApiAccessControlIssue: false,
  });
  const [orgLimit, setOrgLimit] = useState<OrgCheckContextValue['orgLimit']>({
    hasInformation: false,
    usage: '',
    theme: 'success',
  });
  const [filters, setFilters] = useState<OrgFilters>({
    package: ANY,
    sobjectType: ANY,
    sobjectApiName: ANY,
  });
  const [rawObjects, setRawObjects] = useState<ObjectLike[]>([]);
  const [filterOptions, setFilterOptions] = useState<
    OrgCheckContextValue['filterOptions']
  >({ packages: [], types: [], objects: [] });
  const [filtersReady, setFiltersReady] = useState(false);
  const [spinner, setSpinner] = useState<SpinnerState>(INITIAL_SPINNER);
  const [modal, setModal] = useState<ModalState>(INITIAL_MODAL);
  const [jokes] = useState<Joke[]>(() => pickJokesOfTheDay());
  const [tableData, setTableData] = useState<Record<string, DataPlate>>({});
  const [exportData, setExportData] = useState<
    Record<string, ExportedTable | ExportedTable[]>
  >({});
  const [exportBasenames, setExportBasenames] = useState<Record<string, string>>(
    {}
  );
  const [storedData, setStoredData] = useState<Record<string, unknown>>({});
  const [recipeTitles, setRecipeTitles] = useState<Map<string, string>>(() => new Map());
  const currentPath = useRef(window.location.pathname);

  const isObjectSpecified = filters.sobjectApiName !== ANY;

  const closeSpinner = useCallback(() => {
    if (spinnerTimer.current) window.clearInterval(spinnerTimer.current);
    interruptibles.current.clear();
    keysIndex.current.clear();
    setSpinner(INITIAL_SPINNER);
  }, []);

  const openSpinner = useCallback(() => {
    setSpinner(current => {
      if (current.isOpen) return current;
      keysIndex.current.clear();
      openSince.current = Date.now();
      if (spinnerTimer.current) window.clearInterval(spinnerTimer.current);
      spinnerTimer.current = window.setInterval(() => {
        setSpinner(prev =>
          prev.isOpen
            ? { ...prev, waitingTime: (Date.now() - openSince.current) / 1000 }
            : prev
        );
      }, 1000);
      return {
        ...INITIAL_SPINNER,
        isOpen: true,
      };
    });
  }, []);

  const setSection = useCallback(
    (sectionName: string, message: unknown, status: SpinnerSectionStatus) => {
      openSpinner();
      const isError = message instanceof Error;
      const section: SpinnerSection = {
        id: sectionName,
        status,
        label: isError
          ? 'There was an error during the process...'
          : String(message ?? ''),
        showInterruptButton:
          status === 'in-progress' && interruptibles.current.has(sectionName),
        isInterrupted: false,
      };
      if (status !== 'in-progress') {
        interruptibles.current.delete(sectionName);
      }
      if (isError) {
        const context = (message as Error & { contextInformation?: Record<string, string> })
          .contextInformation;
        section.contextInformation = [{ key: 'Message', value: message.message }];
        if (context) {
          for (const key of Object.keys(context)) {
            section.contextInformation.push({ key, value: String(context[key]) });
          }
        }
      }
      setSpinner(prev => {
        const sections = [...prev.sections];
        const existing = keysIndex.current.get(sectionName);
        if (
          existing === undefined ||
          existing < 0 ||
          existing >= sections.length ||
          !sections[existing]
        ) {
          keysIndex.current.set(sectionName, sections.length);
          sections.push(section);
        } else {
          sections[existing] = section;
        }
        const inProgress = sections.filter(item => item?.status === 'in-progress').length;
        const hadError = prev.hadError || status === 'failed';
        const next: SpinnerState = {
          ...prev,
          isOpen: true,
          hadError,
          sections,
          inProgressPercentage: Math.round(
            (1 - inProgress / Math.max(sections.length, 1)) * 100
          ),
          inProgressMessage:
            inProgress === 0
              ? hadError
                ? 'Ooops! Something went wrong...'
                : ''
              : `We have currently ${inProgress} process(es) in progress and ${sections.length - inProgress} process(es) completed...`,
        };
        if (inProgress === 0 && !hadError) {
          window.setTimeout(() => closeSpinner(), 0);
        }
        if (inProgress === 0 && hadError) {
          next.isClosable = true;
        }
        return next;
      });
    },
    [closeSpinner, openSpinner]
  );

  const interruptSection = useCallback((sectionId: string) => {
    interruptibles.current.get(sectionId)?.();
    interruptibles.current.delete(sectionId);
    setSpinner(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, showInterruptButton: false, isInterrupted: true }
          : section
      ),
    }));
  }, []);

  const spinnerApi = useMemo(
    () => ({
      open: openSpinner,
      close: closeSpinner,
      sectionLog: (section: string, message: string) =>
        setSection(section, message, 'in-progress'),
      sectionEnded: (section: string, message: string) =>
        setSection(section, message, 'ended'),
      sectionFailed: (section: string, error: unknown) =>
        setSection(section, error instanceof Error ? error : new Error(String(error)), 'failed'),
      registerInterruptibleSection: (section: string, cb: () => void) => {
        interruptibles.current.set(section, cb);
      },
    }),
    [closeSpinner, openSpinner, setSection]
  );

  const closeModal = useCallback(() => setModal(INITIAL_MODAL), []);

  const openModal = useCallback(
    (title: string, content: string, isClosable = true) => {
      setModal({
        isShown: true,
        isClosable,
        headerTitle: title,
        message: content,
        errorChains: [],
      });
    },
    []
  );

  const showErrors = useCallback((context: string, errors: unknown) => {
    const list = asErrorArray(errors);
    const map = new Map<string, Error>();
    for (const error of list) {
      for (let current: unknown = error; current instanceof Error; current = current.cause) {
        map.set(current.message, current);
      }
    }
    const errorChains = Array.from(map.entries()).map(([message, error], index) => ({
      index,
      message,
      body: JSON.stringify(error, (key, value) => (key === 'cause' ? undefined : value), 2),
    }));
    setModal({
      isShown: true,
      isClosable: true,
      headerTitle: `Oops we had an issue... (${context})`,
      message: '',
      errorChains,
    });
  }, []);

  const showScore = useCallback(
    (detail: {
      whatId: string;
      whatName: string;
      score: number;
      reasonIds?: number[];
    }) => {
      const reasons = (detail.reasonIds ?? [])
        .map(id => Rules.get(id))
        .filter((reason): reason is NonNullable<typeof reason> => Boolean(reason))
        .map(
          reason =>
            `<li><b>${escapeHtml(reason.description)}</b>: <i>${escapeHtml(reason.errorMessage)}</i></li>`
        )
        .join('');
      openModal(
        `Understand the Score of "${escapeHtml(detail.whatName)}" (${escapeHtml(detail.whatId)})`,
        `The component <code><b>${escapeHtml(detail.whatName)}</b></code> (<code>${escapeHtml(detail.whatId)}</code>) has a score of <b><code>${escapeHtml(detail.score)}</code></b> because of the following reasons:<br /><ul class="slds-list_dotted slds-m-top_small">${reasons}</ul>`
      );
    },
    [openModal]
  );

  const namespaceValue = useCallback(
    (current: OrgFilters) => {
      if (current.package === ANY) return ANY;
      if (current.package === EMPTY) return EMPTY;
      return current.package;
    },
    []
  );

  const updateLimits = useCallback((instance: ApiIntf | null) => {
    const darli = instance?.dailyApiRequestLimitInformation;
    if (darli && darli.currentUsagePercentage) {
      setOrgLimit({
        hasInformation: true,
        usage: `Daily API Request Limit: ${darli.currentUsagePercentage}%`,
        theme: darli.isGreenZone
          ? 'success'
          : darli.isYellowZone
            ? 'warning'
            : 'error',
      });
    } else {
      setOrgLimit({ hasInformation: false, usage: '', theme: 'success' });
    }
  }, []);

  const loadFilters = useCallback(
    async (instance: ApiIntf, current: OrgFilters, forceRefresh = false) => {
      setFiltersReady(false);
      if (forceRefresh) {
        instance.clearObjects?.();
        instance.clearPackages?.();
      }
      const [packages, types, objects] = await Promise.all([
        instance.getPackages(),
        instance.getObjectTypes(),
        instance.getObjects(namespaceValue(current), current.sobjectType),
      ]);
      const packageOptions: FilterOption[] = [
        { label: 'All packages', value: ANY },
        { label: 'No package', value: EMPTY },
        ...((packages ?? []) as PackageLike[]).map(item => ({
          label: `${item.name} (api=${item.namespace}, type=${item.type})`,
          value: String(item.namespace ?? ''),
        })),
      ];
      const typeOptions: FilterOption[] = [
        { label: 'All types', value: ANY },
        ...((types ?? []) as TypeLike[]).map(item => ({
          label: String(item.label ?? item.id ?? ''),
          value: String(item.id ?? ''),
        })),
      ];
      const objectList = (objects ?? []) as ObjectLike[];
      setRawObjects(objectList);
      setFilterOptions({
        packages: packageOptions,
        types: typeOptions,
        objects: [
          { label: 'All objects', value: ANY },
          ...objectList.map(item => ({
            label: `${item.label} (api=${item.name}, type=${item.typeRef?.label})`,
            value: String(item.id ?? ''),
          })),
        ],
      });
      setFiltersReady(true);
      updateLimits(instance);
    },
    [namespaceValue, updateLimits]
  );

  const loadPageData = useCallback(
    async (page: NavPage, forceRefresh = false) => {
      const instance = apiRef.current;
      if (!instance) return;
      currentPath.current = page.path;
      setIsLoading(true);
      spinnerApi.open();
      try {
        if (page.dataKey === 'cacheitems') {
          const items = instance.listCacheItems(false).map(item => ({
            ...item,
            renderKey: `${item.name}-${Date.now()}`,
          }));
          setTableData(prev => ({ ...prev, cacheitems: items }));
          return;
        }
        if (page.dataKey === 'userrolestree') {
          const tree = await instance.getRolesAsTree();
          setTableData(prev => ({ ...prev, userrolestree: tree }));
          return;
        }
        if (!page.recipe) return;
        if (page.requiresObject && filters.sobjectApiName === ANY) return;
        if (forceRefresh) {
          instance.cleanData(
            page.recipe,
            namespaceValue(filters),
            filters.sobjectType,
            filters.sobjectApiName
          );
        }
        const alias = instance.cachestampData(
          page.recipe,
          namespaceValue(filters),
          filters.sobjectType,
          filters.sobjectApiName
        );
        const shouldForce = forceRefresh || alias === '-';
        const stampKey = `${page.key}:${alias}`;
        if (!shouldForce && lastAlias.current.get(page.key) === stampKey) return;
        lastAlias.current.set(page.key, stampKey);
        const mixture = await instance.prepareData(
          page.recipe,
          namespaceValue(filters),
          filters.sobjectType,
          filters.sobjectApiName
        );
        const plate = await instance.serveData(page.recipe, mixture);
        const doggyBag = await instance.exportData(page.recipe, plate);
        if (page.storeData && page.dataKey) {
          setStoredData(prev => ({ ...prev, [page.dataKey as string]: mixture }));
        }
        if (page.dataKey) {
          setTableData(prev => ({ ...prev, [page.dataKey as string]: plate }));
          setExportData(prev => ({ ...prev, [page.dataKey as string]: doggyBag }));
          const title = page.label.replace(/^[^\w]+/, '').replaceAll(' ', '');
          setExportBasenames(prev => ({
            ...prev,
            [page.dataKey as string]:
              `${instance.orgId ?? 'org'}-${title}` +
              (filters.package === ANY ? '' : `-${filters.package}`) +
              (filters.sobjectType === ANY ? '' : `-${filters.sobjectType}`) +
              (filters.sobjectApiName === ANY ? '' : `-${filters.sobjectApiName}`),
          }));
        }
      } catch (error) {
        showErrors(`load ${page.path}`, error);
      } finally {
        updateLimits(instance);
        setIsLoading(false);
        spinnerApi.close();
      }
    },
    [filters, namespaceValue, showErrors, spinnerApi, updateLimits]
  );

  const loadBasicInformation = useCallback(
    async (instance: ApiIntf) => {
      const accepted = await instance.checkUsageTerms();
      const manuallyAccepted = instance.wereUsageTermsAcceptedManually();
      setUsage({
        accepted,
        needConfirmation: !accepted,
        manuallyAccepted,
      });
      if (!accepted) return;
      await instance.checkCurrentUserPermissions();
      const orgInfo = await instance.getOrganizationInformation();
      setOrgInformation({
        id: orgInfo.id,
        name: `${orgInfo.name} (${orgInfo.id})`,
        type: orgInfo.type,
        theme: orgInfo.isProduction
          ? 'production'
          : orgInfo.isSandbox
            ? 'sandbox'
            : 'other',
        hasApiAccessControlIssue: false,
      });
      await loadFilters(instance, filters);
    },
    [filters, loadFilters]
  );

  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
      const SECTION = 'Initialize the Org Check API';
      try {
        setInitializing(true);
        if (isOAuthCallbackLocation()) {
          return;
        }
        const session = await resolveSalesforceSession();
        if (!session) {
          setNeedsAuth(true);
          setAuthSource('none');
          return;
        }
        setNeedsAuth(false);
        setAuthSource(session.source);
        spinnerApi.open();
        spinnerApi.sectionLog(SECTION, `C'est parti...`);
        const created = await createOrgCheckApi(session, {
          spinner: spinnerApi,
          modal: { showErrors },
          verbose: false,
          onInvalidSession: () =>
            setOrgInformation(prev => ({ ...prev, hasApiAccessControlIssue: true })),
        });
        if (cancelled) return;
        apiRef.current = created;
        setApi(created);
        setRecipeTitles(created.titlesForAllData());
        setVersion(created.version);
        setSalesforceApiVersion(created.salesforceApiVersion);
        await loadBasicInformation(created);
        spinnerApi.sectionEnded(SECTION, 'Done');
      } catch (error) {
        spinnerApi.sectionFailed(SECTION, error);
        showErrors('initApi', error);
      } finally {
        if (!cancelled) {
          setInitializing(false);
          spinnerApi.close();
        }
      }
    };
    void boot();
    return () => {
      cancelled = true;
    };
    // Boot once on mount. Logger/spinner identities are stable enough for init.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const progress = (onKey as { progress?: number }).progress ?? 0;
      if (event.key === KONAMI_SEQUENCE[progress]) {
        const next = progress + 1;
        (onKey as { progress?: number }).progress = next;
        if (next === KONAMI_SEQUENCE.length) {
          (onKey as { progress?: number }).progress = 0;
          openModal(
            'And now, for something completely different... 🏰🐇⚔️🧙‍♂️🕊️',
            `We improved the loading time but the jokes still are accessible! <br /><ul>${jokes
              .map(
                joke =>
                  `<li><b>${escapeHtml(joke.question)}...</b> &nbsp;&nbsp; <i>${escapeHtml(joke.answer)}</i></li>`
              )
              .join('')}</ul>`
          );
        }
      } else {
        (onKey as { progress?: number }).progress =
          event.key === KONAMI_SEQUENCE[0] ? 1 : 0;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jokes, openModal]);

  const acceptTerms = useCallback(async () => {
    const instance = apiRef.current;
    if (!instance) return;
    instance.acceptUsageTermsManually();
    await loadBasicInformation(instance);
  }, [loadBasicInformation]);

  const applyFilters = useCallback(
    async (next: OrgFilters) => {
      setFilters(next);
      const objectOptions = [
        { label: 'All objects', value: ANY },
        ...rawObjects
          .filter(
            item =>
              (next.package === ANY || next.package === item.package) &&
              (next.sobjectType === ANY || next.sobjectType === item.typeId)
          )
          .map(item => ({
            label: `${item.label} (api=${item.name}, type=${item.typeRef?.label})`,
            value: String(item.id ?? ''),
          })),
      ];
      setFilterOptions(prev => ({ ...prev, objects: objectOptions }));
      const page = findPageByPath(window.location.pathname.replace(/\/$/, '') || '/');
      if (page) await loadPageData(page);
    },
    [loadPageData, rawObjects]
  );

  const refreshFilters = useCallback(async () => {
    if (!apiRef.current) return;
    await loadFilters(apiRef.current, filters, true);
  }, [filters, loadFilters]);

  const refreshCurrentPage = useCallback(async () => {
    const page = findPageByPath(window.location.pathname.replace(/\/$/, '') || '/');
    if (page) await loadPageData(page, true);
  }, [loadPageData]);

  const clearCache = useCallback(() => {
    apiRef.current?.clearCache();
    window.location.reload();
  }, []);

  const getCacheItem = useCallback((name: string) => {
    return apiRef.current?.getCacheItem(name);
  }, []);

  const logout = useCallback(async () => {
    clearOrgInstanceUrl();
    await revokeOAuthSession();
    window.location.replace('/');
  }, []);

  useEffect(() => {
    if (authSource !== 'oauth') return;
    const onActivity = () => touchOAuthActivity();
    window.addEventListener('pointerdown', onActivity);
    window.addEventListener('keydown', onActivity);
    const timer = window.setInterval(() => {
      if (isOAuthSessionIdle()) {
        void logout();
      }
    }, 30_000);
    return () => {
      window.removeEventListener('pointerdown', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.clearInterval(timer);
    };
  }, [authSource, logout]);

  const runAllTests = useCallback(async () => {
    const instance = apiRef.current;
    if (!instance) return;
    const LOG = 'RUN ALL TESTS';
    spinnerApi.open();
    spinnerApi.sectionLog(LOG, 'Launching...');
    try {
      const asyncApexJobId = await instance.runAllTestsAsync();
      spinnerApi.sectionEnded(LOG, 'Done!');
      spinnerApi.close();
      const testQueueHref = toSalesforceHref('/lightning/setup/ApexTestQueue/home');
      openModal(
        'Asynchronous Run All Test Asked',
        'We asked Salesforce to run all the test classes in your org.<br /><br />For more information about the success of these tests, you can:<br /><ul><li>Go <a href="' +
          escapeHtml(testQueueHref) +
          '" target="_blank" rel="external noopener noreferrer">here</a> to see the results of these tests.</li><li>Check with Tooling API the status of the following record: /tooling/sobjects/AsyncApexJob/' +
          escapeHtml(String(asyncApexJobId)) +
          '</li></ul>'
      );
    } catch (error) {
      spinnerApi.sectionFailed(LOG, error);
      showErrors('handleClickRunAllTests', error);
    }
  }, [openModal, showErrors, spinnerApi]);

  const recompile = useCallback(async () => {
    const instance = apiRef.current;
    if (!instance) return;
    const LOG = 'RECOMPILE';
    spinnerApi.open();
    spinnerApi.sectionLog(LOG, 'Processing...');
    const classes = (storedData.apexuncompiled as { id?: string; name?: string }[] | undefined) ?? [];
    const namesById = new Map<string, string>();
    classes.slice(0, 25).forEach(item => {
      const classId = String(item.id ?? '').substring(0, 15);
      namesById.set(classId, String(item.name ?? classId));
      spinnerApi.sectionLog(`${LOG}-${classId}`, `Asking to recompile class: ${item.name}`);
    });
    try {
      const responses = await instance.compileClasses(Array.from(namesById.keys()));
      let noError = true;
      responses.forEach((result, id) => {
        const name = namesById.get(id.substring(0, 15)) ?? id;
        if (result.isSuccess) {
          spinnerApi.sectionEnded(`${LOG}-${id}`, `Recompilation requested for class: ${name} (${id})`);
        } else {
          spinnerApi.sectionFailed(
            `${LOG}-${id}`,
            `Errors for class ${name} (${id}): ${(result.reasons ?? []).join(', ')}`
          );
          noError = false;
        }
      });
      if (noError) {
        spinnerApi.sectionEnded(LOG, 'Done!');
        openModal(
          'Recompilation Requested Successfully',
          'Please hit the Refresh button (in Org Check) to get the latest data from your Org. By the way, in the future, if you need to recompile ALL the classes, go to "Setup > Custom Code > Apex Classes" and click on the link "Compile all classes".'
        );
      } else {
        spinnerApi.sectionFailed(LOG, 'Done but with errors');
      }
    } catch (error) {
      showErrors('handleClickRecompile', error);
    }
  }, [openModal, showErrors, spinnerApi, storedData.apexuncompiled]);

  const value = useMemo<OrgCheckContextValue>(
    () => ({
      api,
      initializing,
      needsAuth,
      authSource,
      isLoading,
      version,
      salesforceApiVersion,
      usage,
      orgInformation,
      orgLimit,
      filters,
      filterOptions,
      filtersReady,
      isObjectSpecified,
      spinner,
      modal,
      jokes,
      tableData,
      exportData,
      exportBasenames,
      storedData,
      recipeTitles,
      acceptTerms,
      applyFilters,
      refreshFilters,
      refreshCurrentPage,
      loadPageData,
      clearCache,
      getCacheItem,
      closeSpinner,
      interruptSection,
      closeModal,
      openModal,
      showErrors,
      showScore,
      runAllTests,
      recompile,
      logout,
    }),
    [
      acceptTerms,
      api,
      applyFilters,
      authSource,
      clearCache,
      closeModal,
      closeSpinner,
      exportBasenames,
      exportData,
      filterOptions,
      filters,
      filtersReady,
      getCacheItem,
      initializing,
      interruptSection,
      isLoading,
      isObjectSpecified,
      jokes,
      loadPageData,
      logout,
      modal,
      needsAuth,
      openModal,
      orgInformation,
      orgLimit,
      recompile,
      recipeTitles,
      refreshCurrentPage,
      refreshFilters,
      runAllTests,
      salesforceApiVersion,
      showErrors,
      showScore,
      spinner,
      storedData,
      tableData,
      usage,
      version,
    ]
  );

  return (
    <OrgCheckContext.Provider value={value}>{children}</OrgCheckContext.Provider>
  );
}

export function useOrgCheck(): OrgCheckContextValue {
  const value = useContext(OrgCheckContext);
  if (!value) {
    throw new Error('useOrgCheck must be used within OrgCheckProvider');
  }
  return value;
}
