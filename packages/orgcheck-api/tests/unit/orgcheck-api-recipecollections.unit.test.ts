import { describe, it, expect } from "@jest/globals";
import { RecipeGlobalView } from "../../src/api/recipecollection/orgcheck-api-recipe-globalview";
import { RecipeHardcodedURLsView } from "../../src/api/recipecollection/orgcheck-api-recipe-hardcodedurlsview";
import { SimpleLoggerMock_DoingNothing } from "../utils/orgcheck-api-logger-mock.utility";

describe('tests.api.unit.RecipeCollections', () => {
  describe('checks if all recipe collections are working fine', () => {
    [
      /*  1 */ RecipeGlobalView,
      /*  2 */ RecipeHardcodedURLsView
    ].forEach((recipeClass, index) => {
      it(`checks if the recipe collection "${recipeClass.name}" extracts and transforms correctly`, async () => {
        expect(`${index+1}: ${typeof recipeClass}`).toBe(`${index+1}: function`);
        const recipes = new recipeClass().extract(new SimpleLoggerMock_DoingNothing());
        expect(recipes).toBeDefined();
        expect(recipes instanceof Array).toBeTruthy();
        expect(recipes?.length).toBeDefined();
        const data = new Map();
        recipes.forEach((recipe) => {
          data.set(recipe , new Array());
        });
      });
    });
  });
});