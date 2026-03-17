import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcUserRole } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckRoles extends SfCommand<OrgCheckOutput<SfdcUserRole[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.user-roles.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.user-roles.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.user-roles.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean(),
    'package': Flags.string({ 
      char: 'p',
      summary: OrgCheckMessages.getMessage('flags.package.summary')
    }),
    'sobject-type': Flags.string({ 
      char: 't',
      summary: OrgCheckMessages.getMessage('flags.sobject-type.summary')
    }),
    'sobject': Flags.string({ 
      char: 's',
      summary: OrgCheckMessages.getMessage('flags.sobject.summary')
    })
  }

  public async run(): Promise<OrgCheckOutput<SfdcUserRole[]>> {
  
    const { flags } = await this.parse(CheckRoles);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getRoles()) ?? [];

    return OrgCheckGenerateOutput('user-roles', flags, orgcheckApi, results);
  }
}