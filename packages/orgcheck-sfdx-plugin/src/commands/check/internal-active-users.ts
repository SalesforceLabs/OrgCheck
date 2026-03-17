import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcUser } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckInternalActiveUsers extends SfCommand<OrgCheckOutput<SfdcUser[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.internal-active-users.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.internal-active-users.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.internal-active-users.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean()
  }

  public async run(): Promise<OrgCheckOutput<SfdcUser[]>> {
  
    const { flags } = await this.parse(CheckInternalActiveUsers);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getActiveUsers()) ?? [];

    return OrgCheckGenerateOutput('internal-active-users', flags, orgcheckApi, results);
  }
}