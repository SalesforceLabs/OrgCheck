import { DataFactoryIntf } from "../../src/api/core/orgcheck-api-datafactory";

export class DataFactoryMock_AllIsOK implements DataFactoryIntf { 

  getScoreRule(_id: any) { return null; }

  getInstance(_dataClass: any) {
    return {
      create: (setup: { properties: any; }) => { return setup.properties; },
      createWithScore: (setup: { score: number; properties: any; }) => { setup.score = 0; return setup.properties; },
      computeScore: (row: { score: number; }) => { row.score = 0; return row; }
    }
  }
};