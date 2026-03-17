import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcRecordType } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckRecordTypes extends SfCommand<OrgCheckOutput<SfdcRecordType[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.record-types.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.record-types.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.record-types.examples');
  
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

  public async run(): Promise<OrgCheckOutput<SfdcRecordType[]>> {
  
    const { flags } = await this.parse(CheckRecordTypes);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getRecordTypes(flags.package, flags['sobject-type'], flags.sobject)) ?? [];

    return OrgCheckGenerateOutput('record-types', flags, orgcheckApi, results);
  }
}