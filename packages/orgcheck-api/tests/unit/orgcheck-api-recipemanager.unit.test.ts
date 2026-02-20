import { RecipeManager } from "../../src/api/core/orgcheck-api-recipemanager-impl";
import { LoggerMock_DoingNothing } from "../utils/orgcheck-api-logger-mock.utility";
import { DatasetManagerMock_DoingNothing } from "../utils/orgcheck-api-dataset-mock.utility";

describe('tests.api.unit.RecipeManager', () => {
  it('checks if the recipe manager implementation runs correctly', async () => {
    const manager = new RecipeManager(
      new DatasetManagerMock_DoingNothing(),
      new LoggerMock_DoingNothing()
    ); 
    expect(manager).toBeDefined();     
    expect(manager instanceof RecipeManager).toBeTruthy();     
  });
});
