import { ApiFactory } from 'dist/orgcheck';
import { LoggerSetupMock_DoingNothing } from 'tests/utils/orgcheck-api-logger-mock.utility';
import { StorageSetupMock_BasedOnMap } from 'tests/utils/orgcheck-api-storage-mock.utility';

export const createAPIforBundeledTests = () => {
  return ApiFactory.create({ 
    logSettings: new LoggerSetupMock_DoingNothing(),
    salesforce: { 
      authenticationOptions: {
        accessToken: 'BUNDLED_TEST'
      } 
    },
    storage: new StorageSetupMock_BasedOnMap()
  });
}