import { describe, it, expect } from '@jest/globals';
import { RecipeManager } from 'src/api/core/recipe/orgcheck-api-recipemanager-impl';
import { LoggerFactoryMock_DoingNothing } from 'tests/utils/orgcheck-api-logger-mock.utility';
import { DatasetManagerMock_DoingNothing } from 'tests/utils/orgcheck-api-dataset-mock.utility';

describe('tests.api.unit.RecipeManager', () => {
  it('checks if the recipe manager implementation runs correctly', async () => {
    const manager = new RecipeManager(
      new DatasetManagerMock_DoingNothing(),
      new LoggerFactoryMock_DoingNothing()
    ); 
    expect(manager).toBeDefined();     
    expect(manager instanceof RecipeManager).toBeTruthy();     
  });
});
