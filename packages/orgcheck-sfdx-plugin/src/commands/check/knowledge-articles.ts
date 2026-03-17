import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { SfdcKnowledgeArticle } from '@orgcheck/api';
import { OrgCheckCreateAPI } from '../../orgcheck-sfplugin/orgcheck-sfplugin-create-api.js';
import { OrgCheckOutput, OrgCheckGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

OrgCheckLoadThirdParties();

export default class CheckKnowledgeArticles extends SfCommand<OrgCheckOutput<SfdcKnowledgeArticle[]>> {
  
  public static readonly summary = OrgCheckMessages.getMessage('check.knowledge-articles.summary');
  public static readonly description = OrgCheckMessages.getMessage('check.knowledge-articles.description');
  public static readonly examples = OrgCheckMessages.getMessages('check.knowledge-articles.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean()
  }

  public async run(): Promise<OrgCheckOutput<SfdcKnowledgeArticle[]>> {
  
    const { flags } = await this.parse(CheckKnowledgeArticles);
    const orgcheckApi = OrgCheckCreateAPI(flags, this.spinner);
    const results = (await orgcheckApi.getKnowledgeArticles()) ?? [];

    return OrgCheckGenerateOutput('knowledge-articles', flags, orgcheckApi, results);
  }
}