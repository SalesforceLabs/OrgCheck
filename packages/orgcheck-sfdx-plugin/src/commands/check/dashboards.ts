import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcDashboard } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckDashboards extends SfCommand<OrgCheckOutput<SfdcDashboard[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.dashboards.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.dashboards.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.dashboards.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean()
  }

  public async run(): Promise<OrgCheckOutput<SfdcDashboard[]>> {
  
    const { flags } = await this.parse(CheckDashboards);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getDashboards()) ?? [];

    return OrgCheckGenerateOutput('dashboards', flags, orgcheckApi, results);
  }
}