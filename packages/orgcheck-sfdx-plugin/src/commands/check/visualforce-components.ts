import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcVisualForceComponent } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckVisualForceComponents extends SfCommand<OrgCheckOutput<SfdcVisualForceComponent[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.visualforce-components.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.visualforce-components.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.visualforce-components.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean(),
    'package': Flags.string({ 
      char: 'p',
      summary: OrgCheckMessages.getMessage('flags.package.summary')
    })
  }

  public async run(): Promise<OrgCheckOutput<SfdcVisualForceComponent[]>> {
  
    const { flags } = await this.parse(CheckVisualForceComponents);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getVisualForceComponents(flags.package)) ?? [];

    return OrgCheckGenerateOutput('visualforce-components', flags, orgcheckApi, results);
  }
}