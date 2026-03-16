import { Flags, Progress, SfCommand, Spinner } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import * as fflate from 'fflate';
import orgcheck from '@orgcheck/api';

// Make fflate available to orgcheck (used for cache compression)
// @ts-expect-error Fflate loaded from globalThis
globalThis.fflate = fflate;

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('orgcheck-sfdx-plugin', 'check.global-view');

export type CheckResult = {
  length: number;
  statistics: orgcheck.DataCollectionStatisticsIntf[];
}

export type CheckOutput = {
  orgCheckVersion: string;
  dateCheck: string;
  action: string;
  result: CheckResult;
};

export default class CheckGlobalView extends SfCommand<CheckOutput> {
  
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg()
  }
  
  public async run(): Promise<CheckOutput> {
  
    const { flags } = await this.parse(CheckGlobalView);
  
    const actionName = 'global-view';
    const orgcheckApi =
      process.env.ORGCHECK_TEST_MOCK === '1'
        ? createMockApi()
        : orgcheck.ApiFactory.create({
            salesforce: {
              connection: flags['target-org'].getConnection(undefined)
            },
            storage: new StorageSetup(),
            logSettings: new LoggerSetup(actionName, this.spinner, this.progress)
          });

    const results = (await orgcheckApi.getGlobalView()) ?? [];

    return {
      orgCheckVersion: orgcheckApi.version,
      dateCheck: new Date().toISOString(),
      action: actionName,
      result: {
        length: results.length,
        statistics: results
      }
    };
  }
}

class LoggerSetup implements orgcheck.LoggerSetup {

  private sections: Set<string>;
  private nbSuccesses: number;
  private nbFailures: number;
  private nbStopped: number;
  
  public constructor(actionName: string, private spinner: Spinner, private progress: Progress) {

    this.spinner.start(`Performing action: ${actionName}...`);
    this.progress.start(0, {}, { title: 'Progress'  });
    this.sections = new Set();
    this.nbSuccesses = 0;
    this.nbFailures = 0;
    this.nbStopped = 0;
  }

  public started(section: string): void {
    this.sections.add(section);
    this.progress.setTotal(this.sections.size);
  }
  
  public messageLogged(section: string, message?: string): void {
    this.spinner.status = `[${section}] ${message ?? ''}`;
  }
  
  public endedWithError(section: string, error?: Error | string): void {
    this.nbFailures++;
    const errorMessage = error instanceof Error ? error?.message : error;
    this.spinner.status = `[${section}] ${errorMessage ?? 'Unknown error'}`;
  }
  
  public endedSuccessfully(section: string, message?: string): void {
    this.nbSuccesses++;
    this.spinner.status = `[${section}] ${message ?? 'Success'}`;
  }
  
  public stopped(): void {
    this.nbStopped = this.nbSuccesses + this.nbFailures;
    this.progress.update(this.nbStopped);
    if (this.nbStopped >= this.sections.size) {
      this.progress.finish();
      this.spinner.stop();
    }
  }
}

class StorageSetup implements orgcheck.StorageSetup {
  
  private map: Map<string, string>;
  
  public constructor() {
    this.map = new Map<string, string>();
  }
  
  public setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
  
  public getItem(key: string): string {
    return this.map.get(key) ?? '';
  }
  
  public removeItem(key: string): void {
    this.map.delete(key);
  }
  
  public key(n: number): string {
    return Array.from(this.map.keys())[n] ?? '';
  }
  
  public length(): number {
    return this.map.size;
  }
}

function createMockApi(): orgcheck.ApiIntf {
  const mockStats: orgcheck.DataCollectionStatisticsIntf[] = [
    { recipeName: 'apex-classes', hadError: false, lastErrorMessage: '', countAll: 10, countBad: 2, countGood: 8, countBadByRule: [], data: [] },
    { recipeName: 'custom-fields', hadError: false, lastErrorMessage: '', countAll: 5, countBad: 0, countGood: 5, countBadByRule: [], data: [] },
  ];
  return {
    version: '8.0.0',
    getGlobalView: () => Promise.resolve(mockStats),
  } as orgcheck.ApiIntf;
}