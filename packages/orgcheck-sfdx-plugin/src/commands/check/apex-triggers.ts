import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcApexTrigger } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckApexTriggers extends SfCommand<OrgCheckOutput<SfdcApexTrigger[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.apex-triggers.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.apex-triggers.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.apex-triggers.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean(),
    'package': Flags.string({ 
      char: 'p',
      summary: OrgCheckMessages.getMessage('flags.package.summary')
    })
  }

  public async run(): Promise<OrgCheckOutput<SfdcApexTrigger[]>> {
  
    const { flags } = await this.parse(CheckApexTriggers);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getApexTriggers(flags.package)) ?? [];

    return OrgCheckGenerateOutput('apex-triggers', flags, orgcheckApi, results);
  }
}