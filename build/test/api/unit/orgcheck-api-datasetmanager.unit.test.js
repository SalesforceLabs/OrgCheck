import { DatasetManager } from "../../../src/api/core/orgcheck-api-datasetmanager-impl";
import { DatasetAliases } from "../../../src/api/core/orgcheck-api-datasets-aliases";
import { SalesforceManagerMock, CacheManagerMock, LoggerMock } from './orgcheck-api-mock.utility';

describe('tests.api.unit.DatasetManager', () => {
  it('checks if the dataset manager implementation runs correctly', async () => {
    const manager = new DatasetManager(
      new SalesforceManagerMock(),
      new CacheManagerMock(),
      new LoggerMock()
    ); 
    const results1 = await manager.run([ DatasetAliases.APEXCLASSES ]);
    expect(results1).toBeDefined();
    expect(results1 instanceof Map).toBeTruthy();
    expect(results1.size).toBe(1);
    expect(results1.has(DatasetAliases.APEXCLASSES)).toBeTruthy();
    const apexClasses = results1.get(DatasetAliases.APEXCLASSES);
    expect(apexClasses instanceof Map).toBeTruthy();
    expect(apexClasses.size).toBe(0);

    const results2 = await manager.run([ DatasetAliases.PROFILEPWDPOLICIES ]);
    expect(results2).toBeDefined();
    expect(results2 instanceof Map).toBeTruthy();
    expect(results2.size).toBe(1);
    expect(results2.has(DatasetAliases.PROFILEPWDPOLICIES)).toBeTruthy();
    const policies = results2.get(DatasetAliases.PROFILEPWDPOLICIES);
    expect(policies instanceof Map).toBeTruthy();
    expect(policies.size).toBe(0);
  });    
});
