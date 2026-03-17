import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcProfilePasswordPolicy } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckProfilePasswordPolicies extends SfCommand<OrgCheckOutput<SfdcProfilePasswordPolicy[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.profile-password-policies.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.profile-password-policies.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.profile-password-policies.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean()
  }

  public async run(): Promise<OrgCheckOutput<SfdcProfilePasswordPolicy[]>> {
  
    const { flags } = await this.parse(CheckProfilePasswordPolicies);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getProfilePasswordPolicies()) ?? [];

    return OrgCheckGenerateOutput('profile-password-policies', flags, orgcheckApi, results);
  }
}