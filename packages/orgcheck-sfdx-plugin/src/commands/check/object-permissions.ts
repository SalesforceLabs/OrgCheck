import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { Connection } from '@salesforce/core';
import { DataMatrixIntf } from '@orgcheck/api';
import orgcheck from '@orgcheck/api';
import { OrgCheckSfPluginOutput, OrgCheckSfPluginGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckSfPluginMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckSfPluginLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';
import { OrgCheckSfPluginLoggerSetup } from '../../orgcheck-sfplugin/orgcheck-sfplugin-logger-setup.js';
import { OrgCheckSfPluginStorageSetup } from '../../orgcheck-sfplugin/orgcheck-sfplugin-storage-setup.js';

OrgCheckSfPluginLoadThirdParties();

export default class CheckObjectPermissionsPerParent extends SfCommand<OrgCheckSfPluginOutput<DataMatrixIntf>> {
  
  public static readonly summary = OrgCheckSfPluginMessages.getMessage('check.object-permissions.summary');
  public static readonly description = OrgCheckSfPluginMessages.getMessage('check.object-permissions.description');
  public static readonly examples = OrgCheckSfPluginMessages.getMessages('check.object-permissions.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean(),
    'package': Flags.string({ 
      char: 'p',
      summary: OrgCheckSfPluginMessages.getMessage('flags.package.summary')
    })
  }

  public async run(): Promise<OrgCheckSfPluginOutput<DataMatrixIntf>> {
  
    const { flags } = await this.parse(CheckObjectPermissionsPerParent);
    const connection: Connection = flags['target-org'].getConnection(undefined);
    const storageSetup: OrgCheckSfPluginStorageSetup = new OrgCheckSfPluginStorageSetup();
    const loggerSetup: OrgCheckSfPluginLoggerSetup = new OrgCheckSfPluginLoggerSetup(this.spinner, flags['verbose'])
    const orgcheckApi = orgcheck.ApiFactory.create({ 
      salesforce: { connection }, 
      storage: storageSetup, 
      logSettings: loggerSetup 
    });
    const results = (await orgcheckApi.getObjectPermissionsPerParent(flags.package)) ?? [];
    return OrgCheckSfPluginGenerateOutput('object-permissions', orgcheckApi, results);
  }
}