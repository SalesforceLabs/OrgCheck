import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { Connection } from '@salesforce/core';
import { SfdcCollaborationGroup } from '@orgcheck/api';
import orgcheck from '@orgcheck/api';
import { OrgCheckSfPluginOutput, OrgCheckSfPluginGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckSfPluginMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckSfPluginLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';
import { OrgCheckSfPluginLoggerSetup } from '../../orgcheck-sfplugin/orgcheck-sfplugin-logger-setup.js';
import { OrgCheckSfPluginStorageSetup } from '../../orgcheck-sfplugin/orgcheck-sfplugin-storage-setup.js';

OrgCheckSfPluginLoadThirdParties();

export default class CheckCollaborationGroups extends SfCommand<OrgCheckSfPluginOutput<SfdcCollaborationGroup[]>> {
  
  public static readonly summary = OrgCheckSfPluginMessages.getMessage('check.collaboration-groups.summary');
  public static readonly description = OrgCheckSfPluginMessages.getMessage('check.collaboration-groups.description');
  public static readonly examples = OrgCheckSfPluginMessages.getMessages('check.collaboration-groups.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean()
  }

  public async run(): Promise<OrgCheckSfPluginOutput<SfdcCollaborationGroup[]>> {
  
    const { flags } = await this.parse(CheckCollaborationGroups);
    const connection: Connection = flags['target-org'].getConnection(undefined);
    const storageSetup: OrgCheckSfPluginStorageSetup = new OrgCheckSfPluginStorageSetup();
    const loggerSetup: OrgCheckSfPluginLoggerSetup = new OrgCheckSfPluginLoggerSetup(this.spinner, flags['verbose'])
    const orgcheckApi = orgcheck.ApiFactory.create({ 
      salesforce: { connection }, 
      storage: storageSetup, 
      logSettings: loggerSetup 
    });
    const results = (await orgcheckApi.getChatterGroups()) ?? [];
    return OrgCheckSfPluginGenerateOutput('collaboration-groups', orgcheckApi, results);
  }
}