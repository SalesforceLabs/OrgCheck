import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import * as fflate from 'fflate';
import orgcheck from '@orgcheck/api';
import { CreateOrgcheckApi } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';

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
    const orgcheckApi = CreateOrgcheckApi(actionName, flags, this.spinner);
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