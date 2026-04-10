import { createElement } from '@lwc/engine-dom';
import OrgcheckApp from '../orgcheckApp';

describe('c-orgcheck-app', () => {

  it('checks if the app component can be added with no error and checks for its accessibility', async () => {
    let elementAdded = false;
    try {
      const element = createElement('c-orgcheck-app', {
        is: OrgcheckApp   
      });
      
      // Check if the component can be created
      expect(element).toBeDefined();
      document.body.appendChild(element);
      elementAdded = true;
      
      // Check accessibility
      // @ts-ignore
      expect(element).toBeAccessible();

    } finally {
      expect(elementAdded).toBeTruthy();
    }
  });
});