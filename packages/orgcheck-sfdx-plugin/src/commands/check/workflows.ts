import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcWorkflow } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckWorkflows extends SfCommand<OrgCheckOutput<SfdcWorkflow[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.workflows.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.workflows.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.workflows.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean()
  }

  public async run(): Promise<OrgCheckOutput<SfdcWorkflow[]>> {
  
    const { flags } = await this.parse(CheckWorkflows);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getWorkflows()) ?? [];

    return OrgCheckGenerateOutput('workflows', flags, orgcheckApi, results);
  }
}