import { CellFactory } from '../../../dist/orgcheck/orgcheck-ui';

describe('tests.api.bundled.UI', () => {
  describe('Test UI once it has been bundled', () => {

    it('CellFactory should be usable', () => {
      expect(CellFactory.create).not.toBeNull();
    });    
  });
});