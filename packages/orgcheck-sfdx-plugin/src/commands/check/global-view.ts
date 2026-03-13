import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('orgcheck-sfdx-plugin', 'check.global-view');

export type GlobalViewResult = {
  version: string
};

export default class CheckGlobalView extends SfCommand<GlobalViewResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly flags = {
    'target-org': Flags.requiredOrg()
  }
  public async run(): Promise<GlobalViewResult> {
    
    const { flags } = await this.parse(CheckGlobalView);
    
    const orgId = flags['target-org'].getOrgId();
    const connection = flags['target-org'].getConnection();
    this.log(`Connected to ${flags['target-org'].getUsername()} (${orgId}) with API version ${connection.version}`);

    return {
      version: connection.getApiVersion()
    };
  }
}
