import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcPackage } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckPackages extends SfCommand<OrgCheckOutput<SfdcPackage[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.packages.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.packages.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.packages.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean()
  }

  public async run(): Promise<OrgCheckOutput<SfdcPackage[]>> {
  
    const { flags } = await this.parse(CheckPackages);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getPackages()) ?? [];

    return OrgCheckGenerateOutput('packages', flags, orgcheckApi, results);
  }
}