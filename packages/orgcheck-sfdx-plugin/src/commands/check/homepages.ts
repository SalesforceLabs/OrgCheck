import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcHomePageComponent } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckHomePageComponents extends SfCommand<OrgCheckOutput<SfdcHomePageComponent[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.homepages.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.homepages.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.homepages.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean()
  }

  public async run(): Promise<OrgCheckOutput<SfdcHomePageComponent[]>> {
  
    const { flags } = await this.parse(CheckHomePageComponents);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getHomePageComponents()) ?? [];

    return OrgCheckGenerateOutput('homepages', flags, orgcheckApi, results);
  }
}