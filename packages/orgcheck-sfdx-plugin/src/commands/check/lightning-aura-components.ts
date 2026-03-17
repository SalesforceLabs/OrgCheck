import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcLightningAuraComponent } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckLightningAuraComponents extends SfCommand<OrgCheckOutput<SfdcLightningAuraComponent[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.lightning-aura-components.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.lightning-aura-components.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.lightning-aura-components.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean(),
    'package': Flags.string({ 
      char: 'p',
      summary: OrgCheckMessages.getMessage('flags.package.summary')
    })
  }

  public async run(): Promise<OrgCheckOutput<SfdcLightningAuraComponent[]>> {
  
    const { flags } = await this.parse(CheckLightningAuraComponents);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getLightningAuraComponents(flags.package)) ?? [];

    return OrgCheckGenerateOutput('lightning-aura-components', flags, orgcheckApi, results);
  }
}