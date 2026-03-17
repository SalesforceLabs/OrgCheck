import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { DataCollectionStatisticsIntf } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckHardCodedURLs extends SfCommand<OrgCheckOutput<DataCollectionStatisticsIntf[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.hardcoded-urls.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.hardcoded-urls.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.hardcoded-urls.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean()
  }

  public async run(): Promise<OrgCheckOutput<DataCollectionStatisticsIntf[]>> {
  
    const { flags } = await this.parse(CheckHardCodedURLs);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getHardcodedURLsView()) ?? [];

    return OrgCheckGenerateOutput('hardcoded-urls', flags, orgcheckApi, results);
  }
}