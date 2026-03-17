import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { DataCollectionStatisticsIntf } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckGlobalView extends SfCommand<OrgCheckOutput<DataCollectionStatisticsIntf[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.global-view.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.global-view.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.global-view.examples');

  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean()
  }

  public async run(): Promise<OrgCheckOutput<DataCollectionStatisticsIntf[]>> {
  
    const { flags } = await this.parse(CheckGlobalView);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getGlobalView()) ?? [];

    return OrgCheckGenerateOutput('global-view', flags, orgcheckApi, results);
  }
}