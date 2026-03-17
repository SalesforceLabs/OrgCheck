import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcCustomTab } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckCustomTabs extends SfCommand<OrgCheckOutput<SfdcCustomTab[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.custom-tabs.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.custom-tabs.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.custom-tabs.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean(),
    'package': Flags.string({ 
      char: 'p',
      summary: OrgCheckMessages.getMessage('flags.package.summary')
    })
  }

  public async run(): Promise<OrgCheckOutput<SfdcCustomTab[]>> {
  
    const { flags } = await this.parse(CheckCustomTabs);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getCustomTabs(flags.package)) ?? [];

    return OrgCheckGenerateOutput('custom-tabs', flags, orgcheckApi, results);
  }
}