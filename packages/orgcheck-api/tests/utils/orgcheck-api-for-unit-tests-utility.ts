import { DataAliases } from 'src/api/core/orgcheck-api-data-aliases';
import { ApiFactory, SfdcOrganization } from 'src/orgcheck';
import { LoggerSetupMock_DoingNothing } from 'tests/utils/orgcheck-api-logger-mock.utility';
import { StorageSetupMock_BasedOnMap } from 'tests/utils/orgcheck-api-storage-mock.utility';

export const createAPIforUnitTests = (isProduction: boolean) => {
  const api = ApiFactory.create({ 
    logSettings: new LoggerSetupMock_DoingNothing(),
    salesforce: { 
      authenticationOptions: {
        accessToken: 'UNIT_TEST'
      } 
    },
    storage: new StorageSetupMock_BasedOnMap()
  });
  api.getOrganizationInformation = jest.fn(async function (): Promise<SfdcOrganization> {
    return Promise.resolve({ 
      dataType: DataAliases.SfdcOrganization,
      id: '00D00000000TEST',
      name: isProduction ? 'Production Org' : 'Sandbox Org',
      type: isProduction ? 'Production' : 'Sandbox',
      isDeveloperEdition: false, 
      isSandbox: isProduction ? false : true, 
      isTrial: false, 
      isProduction : isProduction ? true : false, 
      localNamespace: 'test'
    });
  });
  return api;
}


