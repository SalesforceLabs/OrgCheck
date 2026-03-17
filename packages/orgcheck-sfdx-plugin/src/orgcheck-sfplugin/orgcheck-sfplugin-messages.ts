import { Messages } from "@salesforce/core";

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);

export const OrgCheckMessages = Messages.loadMessages('orgcheck-sfdx-plugin', 'global');
