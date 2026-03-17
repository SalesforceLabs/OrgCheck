import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcApexClass } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckApexClasses extends SfCommand<OrgCheckOutput<SfdcApexClass[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.apex-classes.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.apex-classes.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.apex-classes.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean(),
    'package': Flags.string({ 
      char: 'p',
      summary: OrgCheckMessages.getMessage('flags.package.summary')
    })
  }

  public async run(): Promise<OrgCheckOutput<SfdcApexClass[]>> {
  
    const { flags } = await this.parse(CheckApexClasses);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getApexClasses(flags.package)) ?? [];

    return OrgCheckGenerateOutput('apex-classes', flags, orgcheckApi, results);
  }
}