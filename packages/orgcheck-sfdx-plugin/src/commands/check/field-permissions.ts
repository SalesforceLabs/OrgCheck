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

export default class CheckFieldPermissionsPerParent extends SfCommand<OrgCheckSfPluginOutput<DataMatrixIntf>> {
  
  public static readonly summary = OrgCheckSfPluginMessages.getMessage('check.field-permissions.summary');
  public static readonly description = OrgCheckSfPluginMessages.getMessage('check.field-permissions.description');
  public static readonly examples = OrgCheckSfPluginMessages.getMessages('check.field-permissions.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean(),
    'package': Flags.string({ 
      char: 'p',
      summary: OrgCheckSfPluginMessages.getMessage('flags.package.summary')
    }),
    'sobject-type': Flags.string({ 
      char: 't',
      summary: OrgCheckSfPluginMessages.getMessage('flags.sobject-type.summary')
    }),
    'sobject': Flags.string({ 
      char: 's',
      required: true,
      summary: OrgCheckSfPluginMessages.getMessage('flags.sobject.summary')
    })
  }

  public async run(): Promise<OrgCheckSfPluginOutput<DataMatrixIntf>> {
  
    const { flags } = await this.parse(CheckFieldPermissionsPerParent);
    const connection: Connection = flags['target-org'].getConnection(undefined);
    const storageSetup: OrgCheckSfPluginStorageSetup = new OrgCheckSfPluginStorageSetup();
    const loggerSetup: OrgCheckSfPluginLoggerSetup = new OrgCheckSfPluginLoggerSetup(this.spinner, flags['verbose'])
    const orgcheckApi = orgcheck.ApiFactory.create({ 
      salesforce: { connection }, 
      storage: storageSetup, 
      logSettings: loggerSetup 
    });
    const results = (await orgcheckApi.getFieldPermissionsPerParent(flags.sobject, flags.package)) ?? [];
    return OrgCheckSfPluginGenerateOutput('field-permissions', orgcheckApi, results);
  }
}