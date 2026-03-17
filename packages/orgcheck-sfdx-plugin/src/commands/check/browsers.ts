import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcBrowser } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckBrowsers extends SfCommand<OrgCheckOutput<SfdcBrowser[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.browsers.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.browsers.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.browsers.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean()
  }

  public async run(): Promise<OrgCheckOutput<SfdcBrowser[]>> {
  
    const { flags } = await this.parse(CheckBrowsers);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getBrowsers()) ?? [];

    return OrgCheckGenerateOutput('browsers', flags, orgcheckApi, results);
  }
}