import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcFlow } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckFlows extends SfCommand<OrgCheckOutput<SfdcFlow[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.flows.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.flows.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.flows.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean()
  }

  public async run(): Promise<OrgCheckOutput<SfdcFlow[]>> {
  
    const { flags } = await this.parse(CheckFlows);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getFlows()) ?? [];

    return OrgCheckGenerateOutput('flows', flags, orgcheckApi, results);
  }
}