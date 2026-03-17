import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcField } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckCustomFields extends SfCommand<OrgCheckOutput<SfdcField[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.custom-fields.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.custom-fields.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.custom-fields.examples');
  
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

  public async run(): Promise<OrgCheckOutput<SfdcField[]>> {
  
    const { flags } = await this.parse(CheckCustomFields);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getCustomFields(flags.package, flags['sobject-type'], flags.sobject)) ?? [];

    return OrgCheckGenerateOutput('custom-fields', flags, orgcheckApi, results);
  }
}