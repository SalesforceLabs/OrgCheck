import { describe, it, expect } from "@jest/globals";
import { SalesforceManager } from "../../src/api/core/orgcheck-api-salesforcemanager-impl";
import { SimpleLoggerMock_DoingNothing } from "../utils/orgcheck-api-logger-mock.utility";
import { JsForceMock } from "../utils/orgcheck-api-jsforce-mock.utility";

describe('tests.api.unit.SalesforceManager', () => {
  const simpleLogger = new SimpleLoggerMock_DoingNothing();
  
  describe('soqlQuery use cases', () => {
    const manager = new SalesforceManager(JsForceMock, {});

    it('checks if the salesforce manager implementation runs soqlQuery correctly with a good query', async () => {
      const results = await manager.soqlQuery([{ string: 'SELECT Id FROM Account #Records=10# #Wait900ms#' }], simpleLogger);
      expect(results).toBeDefined();
      expect(results?.length).toBe(1);
      expect(results[0].length).toBe(10);
    });

    it('checks if the salesforce manager implementation runs soqlQuery correctly with a wrong query', async () => {
      let hadError = false;
      let err: any;
      try {
        await manager.soqlQuery([{ string: 'SELECT Id FROM Account #Records=100# #Wait900ms# #Error=Error raised by the query#' }], simpleLogger);
      } catch (error) {
        hadError = true;
        err = error;
      } finally {
        expect(hadError).toBeTruthy();
        expect(err).toBeDefined();
        expect(err?.contextInformation).toBeDefined();
        expect(err?.contextInformation?.Cause).toBe('Error raised by the query');
      }
    });

    it('checks if the salesforce manager implementation runs soqlQuery correctly with multiple good queries', async () => {
      const results = await manager.soqlQuery([
        { string: 'SELECT Id FROM Account #Records=10#' },
        { string: 'SELECT Id FROM Account #Records=100# #Wait500ms#' },
        { string: 'SELECT Id FROM Account #Records=1000# #Wait900ms#' }
      ], simpleLogger);
      expect(results).toBeDefined();
      expect(results?.length).toBe(3);
      expect(results[0].length).toBe(10);
      expect(results[1].length).toBe(100);
      expect(results[2].length).toBe(1000);
    });

    it('checks if the salesforce manager implementation runs soqlQuery correctly with multiple good queries and one wrong query', async () => {
      let hadError = false;
      let err: any;
      try {
        await manager.soqlQuery([
          { string: 'SELECT Id FROM Account #Records=10# #Wait500ms#' },
          { string: 'SELECT Id FROM Account #Records=100# #Wait900ms#  #Error=Error raised by the query#' },
          { string: 'SELECT Id FROM Account #Records=1000# #Wait900ms#' }
        ], simpleLogger);
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
      }], simpleLogger);
      expect(results).toBeDefined();
      expect(results?.length).toBe(1);
      expect(results[0].length).toBe(10012);
    });

    it('checks if the salesforce manager implementation runs soqlQuery correctly with queryMore custom retrieval without aggregate', async () => {
      const results = await manager.soqlQuery([{ 
        string: 'SELECT Id, Name FROM Account #Records=10012# #NoSupportQueryMore,max=2000#',
        queryMoreField: 'Id'
      }], simpleLogger);
      expect(results).toBeDefined();
      expect(results?.length).toBe(1);
      expect(results[0].length).toBe(10012);
    });

    it('checks if the salesforce manager implementation runs soqlQuery correctly with queryMore custom retrieval with aggregate', async () => {
      const results = await manager.soqlQuery([{ 
        string: 'SELECT Name FROM Account #Records=10012# #NoSupportQueryMore,max=2000# GROUP BY Name',
        queryMoreField: 'CreatedDate'
      }], simpleLogger);
      expect(results).toBeDefined();
      expect(results?.length).toBe(1);
      expect(results[0].length).toBe(10012);
    });

    it('checks if the salesforce manager implementation fails when running soqlQuery with queryMore custom retrieval + aggregate + field same as group by', async () => {
      let hadError = false;
      let err: any;
      try {
        await manager.soqlQuery([{ 
          string: 'SELECT Name FROM Account #Records=10012# #NoSupportQueryMore,max=2000# GROUP BY Name',
          queryMoreField: 'Name' // same as the group by of the previous request it should fail!
        }], simpleLogger);
      } catch (error) {
        hadError = true;
        err = error;
      } finally {
        expect(hadError).toBeTruthy();
        expect(err).toBeDefined();
        expect(err.contextInformation).toBeDefined();
        expect(err.contextInformation.Cause).toBe('Field used in GROUP BY');
      }
    });
  });

  describe('metadataApi use cases', () => {
    const manager = new SalesforceManager(JsForceMock, {});

    it('checks if the salesforce manager implementation runs readMetadata correctly with explicit members', async () => {
      const results = await manager.readMetadata([{ type: 'ProfilePasswordPolicy #Members=4#', members: [ 'member0', 'member999' ] }], simpleLogger);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(1);
      const policies: any[] | undefined = results.get('ProfilePasswordPolicy #Members=4#');
      expect(policies instanceof Array).toBeTruthy();
      expect(policies?.length).toBe(1); // member0 exists, but member999 does not
    });

    it('checks if the salesforce manager implementation runs readMetadata correctly with star (*)', async () => {
      const results = await manager.readMetadata([{ type: 'ProfilePasswordPolicy #Members=4#', members: [ '*' ] }], simpleLogger);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(1);
      const policies: any[] | undefined = results.get('ProfilePasswordPolicy #Members=4#');
      expect(policies instanceof Array).toBeTruthy();
      expect(policies?.length).toBe(4); // you put '*' !
    });
  });

  describe('readMetadataAtScale use cases', () => {
    const manager = new SalesforceManager(JsForceMock, {});

    it('checks if the salesforce manager implementation runs readMetadataAtScale correctly', async () => {
      const results = await manager.readMetadataAtScale('PageLayout', ['A','B','C'], [], simpleLogger);
      expect(results).toBeDefined();
      expect(results instanceof Array).toBeTruthy();
      expect(results?.length).toBe(3);
    });
  });
});