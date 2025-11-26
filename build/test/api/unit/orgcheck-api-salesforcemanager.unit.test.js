import { SalesforceManager } from "../../../src/api/core/orgcheck-api-salesforcemanager-impl";
import { JsForceMock, LoggerMock, ProfilePasswordPolicy } from './orgcheck-api-mock.utility';

describe('tests.api.unit.SalesforceManager', () => {

  const manager = new SalesforceManager(JsForceMock, '');
  const logger = new LoggerMock();

  it('checks if the salesforce manager implementation runs soqlQuery correctly with a good query', async () => {
    const results = await manager.soqlQuery([{ string: 'SELECT Id FROM Account #Records=10# #Wait900ms#' }]);
    expect(results).toBeDefined();
    expect(results.length).toBe(1);
    expect(results[0].length).toBe(10);
  });

  it('checks if the salesforce manager implementation runs soqlQuery correctly with a wrong query', async () => {
    let hadError = false;
    let err;
    try {
      await manager.soqlQuery([{ string: 'SELECT Id FROM Account #Records=100# #Wait900ms# #Error=Error raised by the query#' }]);      
    } catch (error) {
      hadError = true;
      err = error;
    } finally {
      expect(hadError).toBeTruthy();
      expect(err).toBeDefined();
      expect(err.contextInformation).toBeDefined();
      expect(err.contextInformation.Cause).toBe('Error raised by the query');
    }
  });

  it('checks if the salesforce manager implementation runs soqlQuery correctly with multiple good queries', async () => {
    const results = await manager.soqlQuery([
      { string: 'SELECT Id FROM Account #Records=10#' },
      { string: 'SELECT Id FROM Account #Records=100# #Wait500ms#' },
      { string: 'SELECT Id FROM Account #Records=1000# #Wait900ms#' }
    ]);
    expect(results).toBeDefined();
    expect(results.length).toBe(3);
    expect(results[0].length).toBe(10);
    expect(results[1].length).toBe(100);
    expect(results[2].length).toBe(1000);
  });

  it('checks if the salesforce manager implementation runs soqlQuery correctly with multiple good queries and one wrong query', async () => {
    let hadError = false;
    let err;
    try {
      await manager.soqlQuery([
        { string: 'SELECT Id FROM Account #Records=10# #Wait500ms#' },
        { string: 'SELECT Id FROM Account #Records=100# #Wait900ms#  #Error=Error raised by the query#' },
        { string: 'SELECT Id FROM Account #Records=1000# #Wait900ms#' }
      ]);
    } catch (error) {
      hadError = true;
      err = error;
    } finally {
      expect(hadError).toBeTruthy();
      expect(err).toBeDefined();
      expect(err.contextInformation).toBeDefined();
      expect(err.contextInformation.Cause).toBe('Error raised by the query');
    }
  });

  it('checks if the salesforce manager implementation runs soqlQuery correctly with queryMore standard retrieval', async () => {
    const results = await manager.soqlQuery([{ 
      string: 'SELECT Id, Name FROM Account #Records=10012# #SupportQueryMore,size=200#'
    }]);
    expect(results).toBeDefined();
    expect(results.length).toBe(1);
    expect(results[0].length).toBe(10012);
  });

  it('checks if the salesforce manager implementation runs soqlQuery correctly with queryMore custom retrieval without aggregate', async () => {
    const results = await manager.soqlQuery([{ 
      string: 'SELECT Id, Name FROM Account #Records=10012# #NoSupportQueryMore,max=2000#',
      queryMoreField: 'Id'
    }]);
    expect(results).toBeDefined();
    expect(results.length).toBe(1);
    expect(results[0].length).toBe(10012);
  });

  it('checks if the salesforce manager implementation runs soqlQuery correctly with queryMore custom retrieval withv aggregate', async () => {
    const results = await manager.soqlQuery([{ 
      string: 'SELECT Name FROM Account #Records=10012# #NoSupportQueryMore,max=2000# GROUP BY Name',
      queryMoreField: 'CreatedDate'
    }]);
    expect(results).toBeDefined();
    expect(results.length).toBe(1);
    expect(results[0].length).toBe(10012);
  });

  it('checks if the salesforce manager implementation runs readMetadata correctly', async () => {
    const readMetadataResults = await manager.readMetadata([{ type: ProfilePasswordPolicy, members: ['*'] }], logger.toSimpleLogger());
    expect(readMetadataResults).toBeDefined();
    expect(readMetadataResults instanceof Map).toBeTruthy();
    expect(readMetadataResults.size).toBe(1);
    expect(readMetadataResults.has(ProfilePasswordPolicy)).toBeTruthy();
    const policies = readMetadataResults.get(ProfilePasswordPolicy);
    expect(policies instanceof Array).toBeTruthy();
    expect(policies.length).toBe(4);
  });
});