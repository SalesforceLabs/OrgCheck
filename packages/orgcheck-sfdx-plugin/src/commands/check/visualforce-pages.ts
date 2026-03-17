import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcVisualForcePage } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckVisualForcePages extends SfCommand<OrgCheckOutput<SfdcVisualForcePage[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.visualforce-pages.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.visualforce-pages.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.visualforce-pages.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean(),
    'package': Flags.string({ 
      char: 'p',
      summary: OrgCheckMessages.getMessage('flags.package.summary')
    })
  }

  public async run(): Promise<OrgCheckOutput<SfdcVisualForcePage[]>> {
  
    const { flags } = await this.parse(CheckVisualForcePages);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getVisualForcePages(flags.package)) ?? [];

    return OrgCheckGenerateOutput('visualforce-pages', flags, orgcheckApi, results);
  }
}