import { ApiFactory } from 'src/orgcheck';
import { LoggerSetupMock_DoingNothing } from 'tests/utils/orgcheck-api-logger-mock.utility';
import { StorageSetupMock_BasedOnMap } from 'tests/utils/orgcheck-api-storage-mock.utility';
import jsforce from './orgcheck-api-jsforce-mock.utility';

export const createAPIforUnitTests = (isProduction: boolean, dailyApiLimit?: number) => {
  const connection = jsforce.Connection();
  connection.setOrgType(isProduction);
  connection.setDailyApiUsage(dailyApiLimit ?? 0);
  const api = ApiFactory.create({ 
    logSettings: new LoggerSetupMock_DoingNothing(),
    salesforce: { connection },
    storage: new StorageSetupMock_BasedOnMap()
  });
  return api;
}