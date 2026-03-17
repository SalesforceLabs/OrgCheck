import { Spinner } from '@salesforce/sf-plugins-core';
import { Connection, Org } from '@salesforce/core';
import orgcheck from '@orgcheck/api';
import { StorageSetup } from './orgcheck-sfplugin-storage-setup.js';
import { LoggerSetup } from './orgcheck-sfplugin-logger-setup.js';

export const OrgCheckCreateAPI = (flags: { 'target-org': Org, 'verbose': boolean }, spinner: Spinner): orgcheck.ApiIntf => {
    const connection: Connection = flags['target-org'].getConnection(undefined);
    const storage: StorageSetup = new StorageSetup();
    const logSettings: LoggerSetup = new LoggerSetup(spinner, flags['verbose'])
    return orgcheck.ApiFactory.create({ salesforce: { connection }, storage, logSettings });
}