import { describe, it, expect } from '@jest/globals';
import { DatasetManager } from 'src/api/core/dataset/orgcheck-api-datasetmanager-impl';
import { DatasetAliases } from 'src/api/core/dataset/orgcheck-api-datasets-aliases';
import { SalesforceManagerMock_DoingNothing } from 'tests/utils/orgcheck-api-salesforce-mock.utility';
import { CacheManagerMock_UsingMap } from 'tests/utils/orgcheck-api-cache-mock.utility';
import { LoggerFactoryMock_DoingNothing } from 'tests/utils/orgcheck-api-logger-mock.utility';

describe('tests.api.unit.DatasetManager', () => {
  it('checks if the dataset manager implementation runs correctly', async () => {
    const manager = new DatasetManager(
      new SalesforceManagerMock_DoingNothing(),
      new CacheManagerMock_UsingMap(),
      new LoggerFactoryMock_DoingNothing()
    ); 
    const results1 = await manager.run([ DatasetAliases.APEXCLASSES ]);
    expect(results1).toBeDefined();
    expect(results1 instanceof Map).toBeTruthy();
    expect(results1.size).toBe(1);
    expect(results1.has(DatasetAliases.APEXCLASSES)).toBeTruthy();
    const apexClasses = results1.get(DatasetAliases.APEXCLASSES);
    expect(apexClasses).toBeDefined();
    expect(apexClasses instanceof Map).toBeTruthy();
    expect(apexClasses instanceof Map && apexClasses?.size === 0).toBeTruthy();

    const results2 = await manager.run([ DatasetAliases.PROFILEPWDPOLICIES ]);
    expect(results2).toBeDefined();
    expect(results2 instanceof Map).toBeTruthy();
    expect(results2.size).toBe(1);
    expect(results2.has(DatasetAliases.PROFILEPWDPOLICIES)).toBeTruthy();
    const policies = results2.get(DatasetAliases.PROFILEPWDPOLICIES);
    expect(policies).toBeDefined();
    expect(policies instanceof Map).toBeTruthy();
    expect(policies instanceof Map && policies.size === 0).toBeTruthy();
  });    
});
