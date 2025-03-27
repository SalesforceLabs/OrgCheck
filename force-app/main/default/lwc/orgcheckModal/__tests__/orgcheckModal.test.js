// @ts-ignore
import { createElement } from '@lwc/engine-dom';
import OrgcheckModal from '../orgcheckModal';
    
describe('c-orgcheck-modal', () => {

  it('Modal should be closed when it has been initialized', async () => {
    const element = createElement('c-orgcheck-modal', {
      is: OrgcheckModal
    });
    document.body.appendChild(element);
    // do not call open()...
    return Promise.resolve().then(() => {
      // as we did not call open() yet, the modal should be invisible
      expect(element.shadowRoot.innerHTML).toBe('');
    });
  });

  it('Modal should be open after we call open() method', async () => {
    const element = createElement('c-orgcheck-modal', {
      is: OrgcheckModal
    });
    document.body.appendChild(element);
    // call open()
    element.open('title', '<b>C</b>onte&acute;nt');

    return Promise.resolve().then(async () => {
      // as we did not call open() yet, the modal should be invisible
      expect(element.shadowRoot.innerHTML).not.toBe('');
      expect(element.shadowRoot.querySelector('h1').innerHTML).toBe('title');
      const closeIcon = element.shadowRoot.querySelector('lightning-icon[title=Close]');
      expect(closeIcon).not.toBeNull();
      // Let's click on the close button
      await closeIcon.click();
      // it should close the modal
      expect(element.shadowRoot.innerHTML).toBe('');
    });
  });
});