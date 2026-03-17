import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcCollaborationGroup } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckCollaborationGroups extends SfCommand<OrgCheckOutput<SfdcCollaborationGroup[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.collaboration-groups.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.collaboration-groups.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.collaboration-groups.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean()
  }

  public async run(): Promise<OrgCheckOutput<SfdcCollaborationGroup[]>> {
  
    const { flags } = await this.parse(CheckCollaborationGroups);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getChatterGroups()) ?? [];

    return OrgCheckGenerateOutput('collaboration-groups', flags, orgcheckApi, results);
  }
}