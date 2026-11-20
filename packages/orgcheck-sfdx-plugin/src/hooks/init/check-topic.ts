import { Hook } from '@oclif/core';
import { Messages } from '@salesforce/core';

/**
 * @description Import messages directory from meta URL and load them
 */
Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@orgcheck/sfdx-plugin', 'global');

/**
 * @description Set the check topic description from check.summary before help is shown
 */
const hook: Hook<'init'> = async function () {
  const topic = this.config.topics.find((entry) => entry.name === 'check');
  if (topic) {
    topic.description = messages.getMessage('check.summary');
  }
};

export default hook;
