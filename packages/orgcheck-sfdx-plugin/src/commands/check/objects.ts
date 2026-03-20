import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { Connection } from '@salesforce/core';
import { SfdcObject } from '@orgcheck/api';
import orgcheck from '@orgcheck/api';
import { OrgCheckSfPluginOutput, OrgCheckSfPluginGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckSfPluginMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckSfPluginLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';
import { OrgCheckSfPluginLoggerSetup } from '../../orgcheck-sfplugin/orgcheck-sfplugin-logger-setup.js';
import { OrgCheckSfPluginStorageSetup } from '../../orgcheck-sfplugin/orgcheck-sfplugin-storage-setup.js';

OrgCheckSfPluginLoadThirdParties();

export default class CheckObjects extends SfCommand<OrgCheckSfPluginOutput<SfdcObject[]>> {
  
  public static readonly summary = OrgCheckSfPluginMessages.getMessage('check.objects.summary');
  public static readonly description = OrgCheckSfPluginMessages.getMessage('check.objects.description');
  public static readonly examples = OrgCheckSfPluginMessages.getMessages('check.objects.examples');
  
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
    })
  }

  public async run(): Promise<OrgCheckSfPluginOutput<SfdcObject[]>> {
  
    const { flags } = await this.parse(CheckObjects);
    const connection: Connection = flags['target-org'].getConnection(undefined);
    const storageSetup: OrgCheckSfPluginStorageSetup = new OrgCheckSfPluginStorageSetup();
    const loggerSetup: OrgCheckSfPluginLoggerSetup = new OrgCheckSfPluginLoggerSetup(this.spinner, flags['verbose'])
    const orgcheckApi = orgcheck.ApiFactory.create({ 
      salesforce: { connection }, 
      storage: storageSetup, 
      logSettings: loggerSetup 
    });
    const results = (await orgcheckApi.getObjects(flags.package, flags['sobject-type'])) ?? [];
    return OrgCheckSfPluginGenerateOutput('objects', orgcheckApi, results);
  }
}