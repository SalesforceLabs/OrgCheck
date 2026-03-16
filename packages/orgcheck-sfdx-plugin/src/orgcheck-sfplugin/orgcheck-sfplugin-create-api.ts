import { Spinner } from '@salesforce/sf-plugins-core';
import { Connection, Org } from '@salesforce/core';
import orgcheck from '@orgcheck/api';
import { StorageSetup } from './orgcheck-sfplugin-storage-setup.js';
import { LoggerSetup } from './orgcheck-sfplugin-logger-setup.js';

export const CreateOrgcheckApi = (actionName: string, flags: { 'target-org': Org }, spinner: Spinner): orgcheck.ApiIntf => {
    const connection: Connection = flags['target-org'].getConnection(undefined);
    const storage: StorageSetup = new StorageSetup();
    const logSettings: LoggerSetup = new LoggerSetup(actionName, spinner)
    return orgcheck.ApiFactory.create({ salesforce: { connection }, storage, logSettings });
}