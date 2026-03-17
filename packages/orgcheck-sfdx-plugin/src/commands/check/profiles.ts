import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcProfile } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckProfiles extends SfCommand<OrgCheckOutput<SfdcProfile[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.profiles.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.profiles.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.profiles.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean(),
    'package': Flags.string({ 
      char: 'p',
      summary: OrgCheckMessages.getMessage('flags.package.summary')
    })
  }

  public async run(): Promise<OrgCheckOutput<SfdcProfile[]>> {
  
    const { flags } = await this.parse(CheckProfiles);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getProfiles(flags.package)) ?? [];

    return OrgCheckGenerateOutput('profiles', flags, orgcheckApi, results);
  }
}