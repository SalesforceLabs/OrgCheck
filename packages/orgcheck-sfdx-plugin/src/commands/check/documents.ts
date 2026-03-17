import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcDocument } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckDocuments extends SfCommand<OrgCheckOutput<SfdcDocument[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.documents.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.documents.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.documents.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean(),
    'package': Flags.string({ 
      char: 'p',
      summary: OrgCheckMessages.getMessage('flags.package.summary')
    })
  }

  public async run(): Promise<OrgCheckOutput<SfdcDocument[]>> {
  
    const { flags } = await this.parse(CheckDocuments);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getDocuments(flags.package)) ?? [];

    return OrgCheckGenerateOutput('documents', flags, orgcheckApi, results);
  }
}