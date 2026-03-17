import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcGroup } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckQueues extends SfCommand<OrgCheckOutput<SfdcGroup[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.queues.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.queues.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.queues.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean()
  }

  public async run(): Promise<OrgCheckOutput<SfdcGroup[]>> {
  
    const { flags } = await this.parse(CheckQueues);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getQueues()) ?? [];

    return OrgCheckGenerateOutput('queues', flags, orgcheckApi, results);
  }
}