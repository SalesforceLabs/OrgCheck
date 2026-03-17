import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { DataMatrixIntf } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckApplicationPermissionsPerParent extends SfCommand<OrgCheckOutput<DataMatrixIntf>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.app-permissions.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.app-permissions.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.app-permissions.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean(),
    'package': Flags.string({ 
      char: 'p',
      summary: OrgCheckMessages.getMessage('flags.package.summary')
    })
  }

  public async run(): Promise<OrgCheckOutput<DataMatrixIntf>> {
  
    const { flags } = await this.parse(CheckApplicationPermissionsPerParent);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getApplicationPermissionsPerParent(flags.package)) ?? [];

    return OrgCheckGenerateOutput('app-permissions', flags, orgcheckApi, results);
  }
}