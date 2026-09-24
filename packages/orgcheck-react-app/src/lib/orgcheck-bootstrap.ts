import { isLocalSalesforceDevHost, rememberSalesforceInstanceUrl } from '@/lib/oauth';
import { setOrgInstanceUrl } from '@/lib/org-instance-url';
import { createOrgScopedStorage } from '@/lib/org-cache-storage';
import * as XLSX from 'xlsx';
import * as fflate from 'fflate';
import {
  ApiFactory,
  Recipes,
  Rules,
  TableUtils,
  type ApiIntf,
  type ExportedTable,
  type LoggerSetup,
  type Table,
} from '@orgcheck/api';

export { Recipes, Rules, TableUtils };
export type { ApiIntf, ExportedTable, Table };

type SpinnerLike = {
  open: () => void;
  close: (waitBeforeClosing?: number) => void;
  sectionLog: (section: string, message: string) => void;
  sectionEnded: (section: string, message: string) => void;
  sectionFailed: (section: string, error: unknown) => void;
  registerInterruptibleSection: (
    section: string,
    interruptCallback: () => void
  ) => void;
};

type ModalLike = {
  showErrors: (context: string, errors: unknown) => void;
};

export type OrgCheckLoggers = {
  spinner: SpinnerLike;
  modal: ModalLike;
  verbose: boolean;
  onInvalidSession?: () => void;
};

type JsForceConnection = {
  query?: (soql: string) => Promise<{ records?: Array<{ Id?: string }> }>;
};

type JsForceLib = {
  Connection: new (options: {
    accessToken: string;
    instanceUrl: string;
    maxRequest?: number;
  }) => JsForceConnection;
};

function attachGlobals(): void {
  const root = globalThis as typeof globalThis & {
    jsforce?: JsForceLib;
    orgcheck?: unknown;
    XLSX?: unknown;
    fflate?: unknown;
  };
  if (!root.jsforce) {
    throw new Error(
      'jsforce browser bundle is not loaded. Ensure public/jsforce.min.js is included before the app.'
    );
  }
  root.XLSX = XLSX;
  root.fflate = fflate;
}

function orgIdFromAccessToken(accessToken: string): string | undefined {
  const prefix = accessToken.split('!')[0] ?? '';
  if (/^00D[a-zA-Z0-9]{12}$/.test(prefix)) return prefix;
  if (/^00D[a-zA-Z0-9]{15}$/.test(prefix)) return prefix;
  return undefined;
}

async function resolveSalesforceOrgId(
  connection: JsForceConnection,
  accessToken: string
): Promise<string> {
  const fromToken = orgIdFromAccessToken(accessToken);
  if (fromToken) return fromToken;

  const result = await connection.query?.('SELECT Id FROM Organization LIMIT 1');
  const orgId = result?.records?.[0]?.Id;
  if (!orgId) {
    throw new Error(
      'Unable to resolve the Salesforce organization Id, so the data cache cannot be isolated.'
    );
  }
  return orgId;
}

export async function createOrgCheckApi(
  session: { accessToken: string; instanceUrl: string },
  loggers: OrgCheckLoggers
): Promise<ApiIntf> {
  attachGlobals();
  const jsforce = (globalThis as typeof globalThis & { jsforce?: JsForceLib }).jsforce;
  if (!jsforce?.Connection) {
    throw new Error('jsforce.Connection is not available.');
  }

  setOrgInstanceUrl(session.instanceUrl);
  if (isLocalSalesforceDevHost()) {
    rememberSalesforceInstanceUrl(session.instanceUrl);
  }

  const auth = {
    accessToken: session.accessToken,
    instanceUrl: isLocalSalesforceDevHost() ? window.location.origin : session.instanceUrl,
  };

  const logSettings: LoggerSetup = {
    started: section => {
      loggers.spinner.sectionLog(section, 'Starting...');
      if (loggers.verbose) console.log(`Org Check [${section}] BEGIN`);
    },
    messageLogged: (section, message) => {
      loggers.spinner.sectionLog(section, message ?? '');
      if (loggers.verbose) console.log(`Org Check [${section}] LOG: ${message}`);
    },
    endedWithErrors: (section, errors) => {
      loggers.spinner.sectionEnded(section, 'There was an error...');
      loggers.modal.showErrors(section, errors ?? []);
      const list = errors ?? [];
      if (
        list.some(
          error =>
            error instanceof Error && error.message.includes('INVALID_SESSION_ID')
        )
      ) {
        loggers.onInvalidSession?.();
      }
      if (loggers.verbose) {
        console.error(`Org Check [${section}] ERROR: `, errors);
      }
    },
    endedSuccessfully: section => {
      loggers.spinner.sectionEnded(section, 'Done.');
      if (loggers.verbose) console.log(`Org Check [${section}] SUCCESS`);
    },
    stopped: section => {
      if (loggers.verbose) console.log(`Org Check [${section}] END`);
    },
    canBeInterrupted: (section, interruptCallback) => {
      loggers.spinner.registerInterruptibleSection(section, interruptCallback);
      if (loggers.verbose) {
        console.log(`Org Check [${section}] CAN BE INTERRUPTED`);
      }
    },
  };

  try {
    const connection = new jsforce.Connection({
      accessToken: auth.accessToken,
      instanceUrl: auth.instanceUrl,
      maxRequest: 15,
    });
    const orgId = await resolveSalesforceOrgId(connection, session.accessToken);
    return ApiFactory.create({
      salesforce: { connection },
      storage: createOrgScopedStorage(orgId),
      logSettings,
    });
  } finally {
    auth.accessToken = '';
  }
}
