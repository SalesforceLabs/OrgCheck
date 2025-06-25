// @ts-ignore
import { createElement } from '@lwc/engine-dom';
import OrgcheckExtendedDatatable from '../orgcheckExtendedDatatable';

describe('c-orgcheck-extended-database', () => {

  it('makes sure the component can be added in the document with no error and checks for its accessibility', async () => {
    try {
      const element = createElement('c-orgcheck-extended-database', {
        is: OrgcheckExtendedDatatable   
      });
      
      // Check if the component can be created
      expect(element).toBeDefined();
      document.body.appendChild(element);

      // Check accessibility
      // @ts-ignore
      await expect(element).toBeAccessible();

    } catch (e) {
      // Check if there is no erros while creating nor inserting the compoent in the dom
      expect(e).toBeUndefined();
    }
  });
});