import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcLightningWebComponent } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckLightningWebComponents extends SfCommand<OrgCheckOutput<SfdcLightningWebComponent[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.lightning-web-components.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.lightning-web-components.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.lightning-web-components.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean(),
    'package': Flags.string({ 
      char: 'p',
      summary: OrgCheckMessages.getMessage('flags.package.summary')
    })
  }

  public async run(): Promise<OrgCheckOutput<SfdcLightningWebComponent[]>> {
  
    const { flags } = await this.parse(CheckLightningWebComponents);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getLightningWebComponents(flags.package)) ?? [];

    return OrgCheckGenerateOutput('lightning-web-components', flags, orgcheckApi, results);
  }
}