// @ts-ignore
import { createElement } from '@lwc/engine-dom';
import OrgcheckGraphics from '../orgcheckGraphics';

describe('c-orgcheck-graphics', () => {

  it('makes sure the component can be added in the document with no error and checks for its accessibility', async () => {
    let hadError = false;
    try {
      const element = createElement('c-orgcheck-graphics', {
        is: OrgcheckGraphics   
      });
      
      // Check if the component can be created
      expect(element).toBeDefined();
      document.body.appendChild(element);

      // Check accessibility
      // @ts-ignore
      await expect(element).toBeAccessible();

    } catch (e) {
      console.error(e);
      hadError = true;
    } finally {
      // Check if there is no erros while creating nor inserting the compoent in the dom
      expect(hadError).toBeFalsy();
    }
  });
});