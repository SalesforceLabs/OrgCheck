import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcPageLayout } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckPageLayouts extends SfCommand<OrgCheckOutput<SfdcPageLayout[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.page-layouts.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.page-layouts.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.page-layouts.examples');
  
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

  public async run(): Promise<OrgCheckOutput<SfdcPageLayout[]>> {
  
    const { flags } = await this.parse(CheckPageLayouts);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getPageLayouts(flags.package, flags['sobject-type'], flags.sobject)) ?? [];

    return OrgCheckGenerateOutput('page-layouts', flags, orgcheckApi, results);
  }
}