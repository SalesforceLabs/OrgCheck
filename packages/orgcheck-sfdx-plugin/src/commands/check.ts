import { writeFileSync } from 'node:fs';
import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages, Connection } from '@salesforce/core';
import orgcheck, { Data, DataCollectionStatisticsIntf, DataMatrixIntf } from '@orgcheck/api';
import { OrgCheckSfPluginLoggerSetup } from '../orgcheck-sfplugin/orgcheck-sfplugin-logger-setup.js';
import { OrgCheckSfPluginStorageSetup } from '../orgcheck-sfplugin/orgcheck-sfplugin-storage-setup.js';
import { OrgCheckSfPluginLoadThirdParties } from '../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('orgcheck-sfdx-plugin', 'global');

OrgCheckSfPluginLoadThirdParties();

export class Check extends SfCommand<void> {
  
  public static readonly summary = messages.getMessage('check.summary');
  public static readonly description = messages.getMessage('check.description');
  public static readonly examples = messages.getMessages('check.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean({
        char: 'v',
        required: false,
        summary: messages.getMessage('flags.verbose.summary')
    }),
    'accept-the-terms': Flags.boolean({ 
        char: 'y',
        required: false,
        summary: messages.getMessage('flags.accept-the-terms.summary')
    }),
    'json-file': Flags.file({ 
        char: 'j',
        required: false,
        summary: messages.getMessage('flags.json-file.summary')
    }),
    'xslx-file': Flags.file({ 
        char: 'x',
        required: false,
        summary: messages.getMessage('flags.xslx-file.summary')
    }),
    'action': Flags.string({ 
        char: 'a',
        required: true,
        summary: messages.getMessage('flags.action.summary')
    }),
    'package': Flags.string({ 
        char: 'p',
        required: false,
        summary: messages.getMessage('flags.package.summary')
    }),
    'sobject-type': Flags.string({ 
        char: 't',
        required: false,
        summary: messages.getMessage('flags.sobject-type.summary')
    }),
    'sobject': Flags.string({ 
        char: 's',
        required: false,
        summary: messages.getMessage('flags.sobject.summary')
    })
  };

  public async run(): Promise<void> {
  
    const { flags } = await this.parse(Check);

    const actionName: string = flags['action'];

    const connection: Connection = flags['target-org'].getConnection(undefined);
    const storageSetup: OrgCheckSfPluginStorageSetup = new OrgCheckSfPluginStorageSetup();
    const loggerSetup: OrgCheckSfPluginLoggerSetup = new OrgCheckSfPluginLoggerSetup(this.spinner, flags['verbose'])
    const orgcheckApi = orgcheck.ApiFactory.create({ 
        salesforce: { connection }, 
        storage: storageSetup, 
        logSettings: loggerSetup 
    });

    if (await orgcheckApi.checkUsageTerms() === false) {
        if (flags['accept-the-terms'] === true) {
            orgcheckApi.acceptUsageTermsManually();
        } else {
            throw new Error(`You need to accept the terms before (using the 'accept-the-terms' flag)`);
        }
    }

    const results: Data | DataMatrixIntf | Data[] | DataCollectionStatisticsIntf[] | undefined = await orgcheck.ApiFactory.callGetter(
        orgcheckApi, 
        actionName, 
        { namespace: flags['package'] ?? '', type: flags['sobject-type'] ?? '', sobject: flags['sobject'] ?? ''}
    );

    if (flags['json-file']) {
        writeFileSync(
            flags['json-file'], 
            JSON.stringify(
                {
                    orgCheck: { 
                        version: orgcheckApi.version
                    },
                    salesforceOrganization: {
                        id: orgcheckApi.orgId,
                        requestAPIUsage: `${orgcheckApi.dailyApiRequestLimitInformation?.currentUsagePercentage ?? 0} %`
                    },
                    dateCheck: new Date().toISOString(),
                    action: actionName,
                    length: (Array.isArray(results) ? results.length : 0),
                    results
                }, 
                (key, value): unknown => ( key.endsWith('Ref') ? undefined : value ), 
                5
            ), 
            { flag: 'w' }
        );
    }
  }
}