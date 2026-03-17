import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcProfileRestrictions } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckProfileRestrictions extends SfCommand<OrgCheckOutput<SfdcProfileRestrictions[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.profile-restrictions.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.profile-restrictions.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.profile-restrictions.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean(),
    'package': Flags.string({ 
      char: 'p',
      summary: OrgCheckMessages.getMessage('flags.package.summary')
    })
  }

  public async run(): Promise<OrgCheckOutput<SfdcProfileRestrictions[]>> {
  
    const { flags } = await this.parse(CheckProfileRestrictions);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getProfileRestrictions(flags.package)) ?? [];

    return OrgCheckGenerateOutput('profile-restrictions', flags, orgcheckApi, results);
  }
}