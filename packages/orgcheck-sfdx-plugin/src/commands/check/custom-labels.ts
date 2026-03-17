import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcCustomLabel } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckCustomFields extends SfCommand<OrgCheckOutput<SfdcCustomLabel[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.custom-labels.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.custom-labels.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.custom-labels.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean(),
    'package': Flags.string({ 
      char: 'p',
      summary: OrgCheckMessages.getMessage('flags.package.summary')
    })
  }

  public async run(): Promise<OrgCheckOutput<SfdcCustomLabel[]>> {
  
    const { flags } = await this.parse(CheckCustomFields);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getCustomLabels(flags.package)) ?? [];

    return OrgCheckGenerateOutput('custom-labels', flags, orgcheckApi, results);
  }
}