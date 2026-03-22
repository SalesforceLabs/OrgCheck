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

export default class CheckObject extends SfCommand<OrgCheckSfPluginOutput<SfdcObject>> {
  
  public static readonly summary = OrgCheckSfPluginMessages.getMessage('check.object.summary');
  public static readonly description = OrgCheckSfPluginMessages.getMessage('check.object.description');
  public static readonly examples = OrgCheckSfPluginMessages.getMessages('check.object.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean(),
    'accept-the-terms': Flags.boolean({ 
      char: 'y',
      summary: OrgCheckSfPluginMessages.getMessage('flags.accept-the-terms.summary')
    }),
    'sobject': Flags.string({ 
      char: 's', 
      required: true,
      summary: OrgCheckSfPluginMessages.getMessage('flags.sobject.summary')
    })
  }

  public async run(): Promise<OrgCheckSfPluginOutput<SfdcObject>> {
  
    const { flags } = await this.parse(CheckObject);
    const connection: Connection = flags['target-org'].getConnection(undefined);
    const storageSetup: OrgCheckSfPluginStorageSetup = new OrgCheckSfPluginStorageSetup();
    const loggerSetup: OrgCheckSfPluginLoggerSetup = new OrgCheckSfPluginLoggerSetup(this.spinner, flags['verbose'])
    const orgcheckApi = orgcheck.ApiFactory.create({ 
      salesforce: { connection }, 
      storage: storageSetup, 
      logSettings: loggerSetup 
    });
    if (await orgcheckApi.checkUsageTerms() === false) {
      if (flags['accept-the-terms'] === true) {
        orgcheckApi.acceptUsageTermsManually();
      } else {
        throw new Error('Ooppps');
      }
    }
    const results = (await orgcheckApi.getObject(flags.sobject)) ?? [];
    return OrgCheckSfPluginGenerateOutput('workflows', orgcheckApi, results);
  }
}