import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { DataMatrixIntf } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckFieldPermissionsPerParent extends SfCommand<OrgCheckOutput<DataMatrixIntf>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.field-permissions.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.field-permissions.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.field-permissions.examples');
  
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
      required: true,
      summary: OrgCheckMessages.getMessage('flags.sobject.summary')
    })
  }

  public async run(): Promise<OrgCheckOutput<DataMatrixIntf>> {
  
    const { flags } = await this.parse(CheckFieldPermissionsPerParent);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getFieldPermissionsPerParent(flags.sobject, flags.package)) ?? [];

    return OrgCheckGenerateOutput('field-permissions', flags, orgcheckApi, results);
  }
}