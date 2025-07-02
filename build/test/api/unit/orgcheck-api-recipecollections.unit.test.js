import { RecipeCollection } from '../../../src/api/core/orgcheck-api-recipecollection';
import { RecipeGlobalView } from "../../../src/api/recipecollection/orgcheck-api-recipe-globalview";
import { RecipeHardcodedURLsView } from "../../../src/api/recipecollection/orgcheck-api-recipe-hardcodedurlsview";
import { SimpleLoggerIntf } from "../../../src/api/core/orgcheck-api-logger";

class SimpleLoggerMock extends SimpleLoggerIntf {
  log() {}
  debug() {}
}

describe('tests.api.unit.RecipeCollections', () => {
  describe('Basic test for all recipe collections', () => {
    [
      /*  1 */ RecipeGlobalView,
      /*  2 */ RecipeHardcodedURLsView
    ].forEach((recipeClass, index) => {
      expect(`${index+1}: ${typeof recipeClass}`).toBe(`${index+1}: function`);
      const recipe = new recipeClass();
      const logger = new SimpleLoggerMock();
      expect(recipe instanceof RecipeCollection).toBeTruthy();
      it(`checks if the recipe collection "${recipe.constructor.name}" extracts and transforms correctly`, async () => {
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