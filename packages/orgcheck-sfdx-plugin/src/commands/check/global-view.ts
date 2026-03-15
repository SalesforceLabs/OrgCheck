import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import * as fflate from 'fflate';
import orgcheck from '@orgcheck/api';

// Make fflate available to orgcheck (used for cache compression)
(globalThis as any).fflate = fflate;

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('orgcheck-sfdx-plugin', 'check.global-view');

export type GlobalViewResult = {
  version: string,
  action: string,
  size: number,
  data: any
};

export default class CheckGlobalView extends SfCommand<GlobalViewResult> {
  
  public static readonly summary = messages.getMessage('summary');
  
  public static readonly description = messages.getMessage('description');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg()
  }
  
  public async run(): Promise<GlobalViewResult> {
  
    const { flags } = await this.parse(CheckGlobalView);
  
    const orgcheckApi = orgcheck.ApiFactory.create({
      salesforce: {
        connection: flags['target-org'].getConnection()
      },
      storage: new InMemoryStorage(),
      logSettings: new SfCommandLogger(this)
    });

    const action = 'global-view';
    const results = await orgcheckApi.getGlobalView();
    const size = results.size ?? 0;
    const data: any = {};
    results.forEach((value: orgcheck.DataCollectionStatisticsIntf, key: string) => {
      data[key] = value;
    });

    return {
      version: orgcheckApi.version,
      action: action,
      size: size,
      data: data
    };
  }
}

class SfCommandLogger implements orgcheck.LoggerSetup {

  private sfCommand: SfCommand<any>;

  constructor(sfCommand: SfCommand<any>) {
    this.sfCommand = sfCommand;
  }

  isConsoleFallback(): boolean {
    return true;
  }

  log(section: string, message: string): void {
    this.sfCommand.log(section, message);
  }

  ended(section: string, message: string): void {
    this.sfCommand.log(section, message);
  }

  failed(section: string, error: Error): void {
    this.sfCommand.error(section, error);
  }
}

class InMemoryStorage implements orgcheck.StorageSetup {
  
  private map: Map<string, string>;
  
  constructor() {
    this.map = new Map<string, string>();
  }
  
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
  
  getItem(key: string): string {
    return this.map.get(key) ?? '';
  }
  
  removeItem(key: string): void {
    this.map.delete(key);
  }
  
  key(n: number): string {
    return Array.from(this.map.keys())[n] ?? '';
  }
  
  length(): number {
    return this.map.size;
  }
}