// @ts-ignore
import { createElement } from '@lwc/engine-dom';
import OrgcheckModal from '../orgcheckModal';
    
describe('c-orgcheck-modal', () => {

  it('makes sure the component can be added in the document with no error and checks for its accessibility', async () => {
    let hadError = false;
    try {
      const element = createElement('c-orgcheck-modal', {
        is: OrgcheckModal   
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

  it('makes sure the modal is hidden by default', async () => {
    const element = createElement('c-orgcheck-modal', {
      is: OrgcheckModal
    });
    document.body.appendChild(element);
    // do not call open()...
    return Promise.resolve().then(() => {
      // as we did not call open() yet, the modal should be invisible
      expect(element.shadowRoot.textContent).toBe('');
    });
  });

  it('makes sure the modal is shown after calling the open() method', async () => {
    const element = createElement('c-orgcheck-modal', {
      is: OrgcheckModal
    });
    document.body.appendChild(element);
    // call open()
    element.open('title', '<b>C</b>onte&acute;nt');

    return Promise.resolve().then(async () => {
      // as we did not call open() yet, the modal should be invisible
      expect(element.shadowRoot.textContent).not.toBe('');
      expect(element.shadowRoot.querySelector('h1').textContent).toBe('title');
      const closeIcon = element.shadowRoot.querySelector('lightning-icon[title=Close]');
      expect(closeIcon).not.toBeNull();
      // Let's click on the close button
      await closeIcon.click();
      // it should close the modal
      expect(element.shadowRoot.textContent).toBe('');
    });
  });
});