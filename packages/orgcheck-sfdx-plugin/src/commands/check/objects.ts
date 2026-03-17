import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcObject } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckObjects extends SfCommand<OrgCheckOutput<SfdcObject[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.objects.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.objects.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.objects.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean(),
    'package': Flags.string({ 
      char: 'p',
      summary: OrgCheckMessages.getMessage('flags.package.summary')
    }),
    'sobject-type': Flags.string({ 
      char: 't',
      summary: OrgCheckMessages.getMessage('flags.sobject-type.summary')
    })
  }

  public async run(): Promise<OrgCheckOutput<SfdcObject[]>> {
  
    const { flags } = await this.parse(CheckObjects);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getObjects(flags.package, flags['sobject-type'])) ?? [];

    return OrgCheckGenerateOutput('objects', flags, orgcheckApi, results);
  }
}