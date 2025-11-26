import { RecipeManager } from "../../../src/api/core/orgcheck-api-recipemanager-impl";
import { DatasetManagerMock, LoggerMock } from './orgcheck-api-mock.utility';

describe('tests.api.unit.RecipeManager', () => {
  it('checks if the recipe manager implementation runs correctly', async () => {
    const manager = new RecipeManager(
      new DatasetManagerMock(),
      new LoggerMock()
    ); 
    expect(manager).toBeDefined();     
    expect(manager instanceof RecipeManager).toBeTruthy();     
  });
});
