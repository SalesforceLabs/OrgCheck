import { Messages } from '@salesforce/core';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);

export const OrgCheckSfPluginMessages = Messages.loadMessages('orgcheck-sfdx-plugin', 'global');
