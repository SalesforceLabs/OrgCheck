import { ApiFactory } from 'src/orgcheck';
import { LoggerSetupMock_DoingNothing } from 'tests/utils/orgcheck-api-logger-mock.utility';
import { StorageSetupMock_BasedOnMap } from 'tests/utils/orgcheck-api-storage-mock.utility';

export const createAPIforUnitTests = () => {
  return ApiFactory.create({ 
    logSettings: new LoggerSetupMock_DoingNothing(),
    salesforce: { 
      authenticationOptions: {
        accessToken: 'UNIT_TEST'
      } 
    },
    storage: new StorageSetupMock_BasedOnMap()
  });
}