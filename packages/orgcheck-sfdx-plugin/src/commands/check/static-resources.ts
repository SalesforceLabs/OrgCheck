import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcStaticResource } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckStaticResources extends SfCommand<OrgCheckOutput<SfdcStaticResource[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.static-resources.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.static-resources.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.static-resources.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean(),
    'package': Flags.string({ 
      char: 'p',
      summary: OrgCheckMessages.getMessage('flags.package.summary')
    })
  }

  public async run(): Promise<OrgCheckOutput<SfdcStaticResource[]>> {
  
    const { flags } = await this.parse(CheckStaticResources);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getStaticResources(flags.package)) ?? [];

    return OrgCheckGenerateOutput('static-resources', flags, orgcheckApi, results);
  }
}