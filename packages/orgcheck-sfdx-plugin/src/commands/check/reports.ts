import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcReport } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckReports extends SfCommand<OrgCheckOutput<SfdcReport[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.reports.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.reports.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.reports.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean()
  }

  public async run(): Promise<OrgCheckOutput<SfdcReport[]>> {
  
    const { flags } = await this.parse(CheckReports);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getReports()) ?? [];

    return OrgCheckGenerateOutput('reports', flags, orgcheckApi, results);
  }
}