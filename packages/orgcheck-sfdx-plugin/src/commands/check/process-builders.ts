import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcFlow } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckProcessBuilders extends SfCommand<OrgCheckOutput<SfdcFlow[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.process-builders.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.process-builders.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.process-builders.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean()
  }

  public async run(): Promise<OrgCheckOutput<SfdcFlow[]>> {
  
    const { flags } = await this.parse(CheckProcessBuilders);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getProcessBuilders()) ?? [];

    return OrgCheckGenerateOutput('process-builders', flags, orgcheckApi, results);
  }
}