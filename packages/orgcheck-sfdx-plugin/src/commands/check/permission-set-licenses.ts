import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcPermissionSetLicense } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckPermissionSetLicenses extends SfCommand<OrgCheckOutput<SfdcPermissionSetLicense[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.permission-set-licenses.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.permission-set-licenses.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.permission-set-licenses.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean()
  }

  public async run(): Promise<OrgCheckOutput<SfdcPermissionSetLicense[]>> {
  
    const { flags } = await this.parse(CheckPermissionSetLicenses);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getPermissionSetLicenses()) ?? [];

    return OrgCheckGenerateOutput('permission-set-licenses', flags, orgcheckApi, results);
  }
}