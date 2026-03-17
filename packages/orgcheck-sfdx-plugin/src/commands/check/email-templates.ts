import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcEmailTemplate } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckEmailTemplates extends SfCommand<OrgCheckOutput<SfdcEmailTemplate[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.email-templates.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.email-templates.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.email-templates.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean(),
    'package': Flags.string({ 
      char: 'p',
      summary: OrgCheckMessages.getMessage('flags.package.summary')
    })
  }

  public async run(): Promise<OrgCheckOutput<SfdcEmailTemplate[]>> {
  
    const { flags } = await this.parse(CheckEmailTemplates);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getEmailTemplates(flags.package)) ?? [];

    return OrgCheckGenerateOutput('email-templates', flags, orgcheckApi, results);
  }
}