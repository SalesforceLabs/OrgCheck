import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcPermissionSet } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckPermissionSets extends SfCommand<OrgCheckOutput<SfdcPermissionSet[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.permission-sets.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.permission-sets.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.permission-sets.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean(),
    'package': Flags.string({ 
      char: 'p',
      summary: OrgCheckMessages.getMessage('flags.package.summary')
    })
  }

  public async run(): Promise<OrgCheckOutput<SfdcPermissionSet[]>> {
  
    const { flags } = await this.parse(CheckPermissionSets);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getPermissionSets(flags.package)) ?? [];

    return OrgCheckGenerateOutput('permission-sets', flags, orgcheckApi, results);
  }
}