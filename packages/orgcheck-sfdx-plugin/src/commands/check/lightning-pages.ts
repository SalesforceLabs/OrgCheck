import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcLightningPage } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckLightningPages extends SfCommand<OrgCheckOutput<SfdcLightningPage[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.lightning-pages.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.lightning-pages.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.lightning-pages.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean(),
    'package': Flags.string({ 
      char: 'p',
      summary: OrgCheckMessages.getMessage('flags.package.summary')
    })
  }

  public async run(): Promise<OrgCheckOutput<SfdcLightningPage[]>> {
  
    const { flags } = await this.parse(CheckLightningPages);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getLightningPages(flags.package)) ?? [];

    return OrgCheckGenerateOutput('lightning-pages', flags, orgcheckApi, results);
  }
}