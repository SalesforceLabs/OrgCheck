// @ts-ignore
import { createElement } from '@lwc/engine-dom';
import OrgcheckSpinner from '../orgcheckSpinner';
    
describe('c-orgcheck-spinner', () => {

  it('makes sure the component can be added in the document with no error and checks for its accessibility', async () => {
    let hadError = false;
    try {
      const element = createElement('c-orgcheck-spinner', {
        is: OrgcheckSpinner   
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

  it('makes sure the spinner is invisible by default', () => {
    const element = createElement('c-orgcheck-spinner', {
      is: OrgcheckSpinner
    });
    document.body.appendChild(element);
    const section = element.shadowRoot.querySelector('section');
    expect(section.classList.contains('slds-hide')).toBeTruthy();
  });

  it('makes sure the spinner is shown after calling open(), by default without the closing icon', async () => {
    const element = createElement('c-orgcheck-spinner', {
      is: OrgcheckSpinner
    });
    document.body.appendChild(element);   
    element.open(); 
    return Promise.resolve().then(() => {
      const section = element.shadowRoot.querySelector('section');
      expect(section.classList.contains('slds-hide')).toBeFalsy();
      expect(element.shadowRoot.element).not.toBe('');
      const closeIcon = element.shadowRoot.querySelector('lightning-icon[title=Close]');
      expect(closeIcon).toBeNull();
    });
  });

  it('makes sure the spinner is shown with closing icon if at least one section failed, and clicking on that icon closes the spinner', async () => {
    const element = createElement('c-orgcheck-spinner', {
      is: OrgcheckSpinner
    });
    document.body.appendChild(element);
    element.sectionLog('1', '...');
    element.sectionLog('2', '...');
    element.sectionLog('3', '...');
    element.sectionEnded('1', 'OK');
    element.sectionFailed('2', 'Failed'); 
    element.sectionEnded('3', 'OK'); 
    return Promise.resolve().then(async () => {
      const closeIcon = element.shadowRoot.querySelector('lightning-icon[title=Close]');
      expect(closeIcon).not.toBeNull();
      closeIcon.dispatchEvent(new CustomEvent('click'));
      return Promise.resolve().then(() => {
        const section = element.shadowRoot.querySelector('section');
        expect(section.classList.contains('slds-hide')).toBeTruthy();
      });
    });
  });

  it('makes sure the spinner is showing messages by sections and do not mix them', async () => {
    const element = createElement('c-orgcheck-spinner', {
      is: OrgcheckSpinner
    });
    document.body.appendChild(element);
    // Opening the spinner
    element.open();
    // Add a new section called "1" with a message "A"
    element.sectionLog('1', 'A');
    return Promise.resolve().then(() => {
      const list = element.shadowRoot.querySelectorAll('.slds-progress__list > li');
      // list should have only one element (because only one section at this time)
      expect(list).toHaveLength(1);
      // the only section should be setup as follow:
      expect(list[0].classList.contains('slds-is-completed')).toBeTruthy();
      expect(list[0].childNodes[0].classList.contains('progress-marker-started')).toBeTruthy();
      expect(list[0].childNodes[1].textContent).toMatch(/1 A/);

      // Add a new section called "21" with a message "B"
      element.sectionLog('2', 'B');
      return Promise.resolve().then(() => {
        const list2 = element.shadowRoot.querySelectorAll('.slds-progress__list > li');
        // list should have now two elements (because we added a second one)
        expect(list2).toHaveLength(2);
        // the first section (1) should be setup as follow:
        expect(list2[0].classList.contains('slds-is-completed')).toBeTruthy();
        expect(list2[0].childNodes[0].classList.contains('progress-marker-started')).toBeTruthy();
        expect(list2[0].childNodes[1].textContent).toMatch(/1 A/);
        // the first section (2) should be setup as follow:
        expect(list2[1].classList.contains('slds-is-completed')).toBeTruthy();
        expect(list2[1].childNodes[0].classList.contains('progress-marker-started')).toBeTruthy();
        expect(list2[1].childNodes[1].textContent).toMatch(/2 B/);

        // Setting the message of an existing section (1)
        element.sectionEnded('1', 'C');
        // Setting an error message to an existing section (2)
        element.sectionFailed('2', 'Z');
        return Promise.resolve().then(() => {
          const closeIcon = element.shadowRoot.querySelector('lightning-icon[title=Close]');
          const list3 = element.shadowRoot.querySelectorAll('.slds-progress__list > li');
          // as all the pending sections are either ended or failed, and we got one error, the spinner should stay open with the close icon
          expect(closeIcon).not.toBeNull();
          expect(list3).toHaveLength(2);
        });
      });
    });
  });  
});