import { SimpleLoggerIntf } from "../../src/api/core/orgcheck-api-logger";
import { SalesforceUsageInformation } from "../../src/api/core/orgcheck-api-salesforce-watchdog";
import { SalesforceManagerIntf, SalesforceMetadataRequest, SalesforceQueryRequest } from "../../src/api/core/orgcheck-api-salesforcemanager";

export class SalesforceManagerMock_DoingNothing implements SalesforceManagerIntf {
    get apiVersion() { return 53; }
    caseSafeId(id: string | undefined) { return id; }
    setupUrl(_id: string, _type: string, _parentId?: string, _parentType?: string): string | undefined { return '/'; }
    getObjectType(_objectName: any, isCustomSetting: any) { return isCustomSetting ? 'CustomSetting' : 'StandardObject'; }
    get dailyApiRequestLimitInformation(): SalesforceUsageInformation | undefined { return { currentUsageRatio: 0, currentUsagePercentage: "0%", 
      yellowThresholdPercentage: 0, redThresholdPercentage: 0, isGreenZone: true, isYellowZone: false,isRedZone: false }; }
    async soqlQuery(_queries: Array<SalesforceQueryRequest | any>, _logger: SimpleLoggerIntf): Promise<Array<Array<any>>> { return [[]]; }
    async soslQuery(_queries: Array<SalesforceQueryRequest | any>, _logger: SimpleLoggerIntf): Promise<Array<Array<any>>> { return [[]]; }
    async dependenciesQuery(_ids: Array<string>, _logger: SimpleLoggerIntf): Promise<{ records: Array<any>; errors: Array<string>; }> { return { records: [], errors: [] }; }
    async readMetadata(_metadatas: Array<SalesforceMetadataRequest>, _logger: SimpleLoggerIntf): Promise<Map<string, Array<any>>> { return new Map(); }
    async readMetadataAtScale(_type: string, _ids: any[], _byPasses: string[], _logger: SimpleLoggerIntf): Promise<Array<any>> { return []; }
    async describeGlobal(_logger: SimpleLoggerIntf): Promise<Array<any>> { return []; }
    async describe(_sobjectDevName: string, _logger: SimpleLoggerIntf): Promise<any> { return {}; }
    async recordCount(_sobjectDevName: string, _logger: SimpleLoggerIntf): Promise<number> { return 0; }
    async runAllTests(_logger: SimpleLoggerIntf): Promise<string> { return ''; }
    async compileClasses(_apexClassIds: Array<string>, _logger: SimpleLoggerIntf): Promise<Map<string, { isSuccess: boolean; reasons?: Array<string>; }>> { return new Map(); }
}

export class SalesforceManagerMock_SoqlQuery extends SalesforceManagerMock_DoingNothing {

  #soqlQueryResponses: Map<string, any> = new Map();
  #describeGlobal: any[] = [];

  addSoqlQueryResponse(/** @type {string} */ queryMatch: string, /** @type {Array<any>} */ response: any[]) {
    this.#soqlQueryResponses.set(queryMatch, response);
  }

  setDescribeGolbal(describeGlobal: any[]) {
    this.#describeGlobal = describeGlobal;
  }

  async soqlQuery(queries: any[], _logger: SimpleLoggerIntf) { 
    const soqlQueryResponsesKeys = Array.from(this.#soqlQueryResponses.keys());
    return queries.map((query: { string: string; }) => { 
      const key = soqlQueryResponsesKeys.find((p) => query?.string?.indexOf(p) !== -1);
      if (key) {
        const response = this.#soqlQueryResponses.get(key);
        return response ?? [];
      }
      return [];
    });
  }
  async describeGlobal(_logger: SimpleLoggerIntf) { return this.#describeGlobal; }
}