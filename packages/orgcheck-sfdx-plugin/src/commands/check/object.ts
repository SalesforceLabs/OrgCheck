import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcObject } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckObject extends SfCommand<OrgCheckOutput<SfdcObject>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.object.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.object.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.object.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean(),
    'sobject': Flags.string({ 
      char: 's', 
      required: true,
      summary: OrgCheckMessages.getMessage('flags.sobject.summary')
    })
  }

  public async run(): Promise<OrgCheckOutput<SfdcObject>> {
  
    const { flags } = await this.parse(CheckObject);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getObject(flags.sobject)) ?? [];

    return OrgCheckGenerateOutput('object', flags, orgcheckApi, results);
  }
}