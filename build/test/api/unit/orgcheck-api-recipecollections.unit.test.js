import { RecipeCollection } from '../../../src/api/core/orgcheck-api-recipecollection';
import { RecipeGlobalView } from "../../../src/api/recipecollection/orgcheck-api-recipe-globalview";
import { RecipeHardcodedURLsView } from "../../../src/api/recipecollection/orgcheck-api-recipe-hardcodedurlsview";
import { SimpleLoggerIntf } from "../../../src/api/core/orgcheck-api-logger";

class SimpleLoggerMock extends SimpleLoggerIntf {
  log() {}
  debug() {}
}

describe('tests.api.unit.RecipeCollections', () => {
  describe('checks if all recipe collections are working fine', () => {
    [
      /*  1 */ RecipeGlobalView,
      /*  2 */ RecipeHardcodedURLsView
    ].forEach((recipeClass, index) => {
      it(`checks if the recipe collection "${recipeClass.name}" extracts and transforms correctly`, async () => {
        expect(`${index+1}: ${typeof recipeClass}`).toBe(`${index+1}: function`);
        const recipe = new recipeClass();
        const logger = new SimpleLoggerMock();
        expect(recipe instanceof RecipeCollection).toBeTruthy();
        const recipes = recipe.extract(logger);
        expect(recipes).toBeDefined();
        expect(recipes instanceof Array).toBeTruthy();
        expect(recipes.length).toBeDefined();
        const data = new Map();
        recipes.forEach((recipe) => {
          data.set(recipe , new Array());
        });
      });
    });
  });
});