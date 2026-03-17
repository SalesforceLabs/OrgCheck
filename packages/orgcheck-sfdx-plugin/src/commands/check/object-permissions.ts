import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { DataMatrixIntf } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckObjectPermissionsPerParent extends SfCommand<OrgCheckOutput<DataMatrixIntf>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.object-permissions.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.object-permissions.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.object-permissions.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean(),
    'package': Flags.string({ 
      char: 'p',
      summary: OrgCheckMessages.getMessage('flags.package.summary')
    })
  }

  public async run(): Promise<OrgCheckOutput<DataMatrixIntf>> {
  
    const { flags } = await this.parse(CheckObjectPermissionsPerParent);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getObjectPermissionsPerParent(flags.package)) ?? [];

    return OrgCheckGenerateOutput('object-permissions', flags, orgcheckApi, results);
  }
}