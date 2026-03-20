import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { Connection } from '@salesforce/core';
import { SfdcLightningAuraComponent } from '@orgcheck/api';
import orgcheck from '@orgcheck/api';
import { OrgCheckSfPluginOutput, OrgCheckSfPluginGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckSfPluginMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckSfPluginLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';
import { OrgCheckSfPluginLoggerSetup } from '../../orgcheck-sfplugin/orgcheck-sfplugin-logger-setup.js';
import { OrgCheckSfPluginStorageSetup } from '../../orgcheck-sfplugin/orgcheck-sfplugin-storage-setup.js';

OrgCheckSfPluginLoadThirdParties();

export default class CheckLightningAuraComponents extends SfCommand<OrgCheckSfPluginOutput<SfdcLightningAuraComponent[]>> {
  
  public static readonly summary = OrgCheckSfPluginMessages.getMessage('check.lightning-aura-components.summary');
  public static readonly description = OrgCheckSfPluginMessages.getMessage('check.lightning-aura-components.description');
  public static readonly examples = OrgCheckSfPluginMessages.getMessages('check.lightning-aura-components.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean(),
    'package': Flags.string({ 
      char: 'p',
      summary: OrgCheckSfPluginMessages.getMessage('flags.package.summary')
    })
  }

  public async run(): Promise<OrgCheckSfPluginOutput<SfdcLightningAuraComponent[]>> {
  
    const { flags } = await this.parse(CheckLightningAuraComponents);
    const connection: Connection = flags['target-org'].getConnection(undefined);
    const storageSetup: OrgCheckSfPluginStorageSetup = new OrgCheckSfPluginStorageSetup();
    const loggerSetup: OrgCheckSfPluginLoggerSetup = new OrgCheckSfPluginLoggerSetup(this.spinner, flags['verbose'])
    const orgcheckApi = orgcheck.ApiFactory.create({ 
      salesforce: { connection }, 
      storage: storageSetup, 
      logSettings: loggerSetup 
    });
    const results = (await orgcheckApi.getLightningAuraComponents(flags.package)) ?? [];
    return OrgCheckSfPluginGenerateOutput('lightning-aura-components', orgcheckApi, results);
  }
}