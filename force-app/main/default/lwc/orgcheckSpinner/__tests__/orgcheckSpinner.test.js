import { createElement } from 'lwc';
import { error } from "console";
import OrgcheckSpinner from 'c/orgcheckSpinner';
    
describe('c-orgcheck-spinner', () => {

  it('spinner is initially invisible', () => {
    const element = createElement('c-orgcheck-spinner', {
      is: OrgcheckSpinner
    });
    document.body.appendChild(element);    
    expect(element.shadowRoot.innerHTML).toBe('');
  });

  it('spinner is shown after calling open(), by default without the closing icon', () => {
    const element = createElement('c-orgcheck-spinner', {
      is: OrgcheckSpinner
    });
    document.body.appendChild(element);   
    element.open(); 
    return Promise.resolve().then(() => {
      expect(element.shadowRoot.innerHTML).not.toBe('');
      const closeIcon = element.shadowRoot.querySelector('lightning-icon[title=Close]');
      expect(closeIcon).toBeNull();
    });
  });

  it('spinner is shown with closing icon after calling canBeClosed(), and click on that icon closes the spinner', () => {
    const element = createElement('c-orgcheck-spinner', {
      is: OrgcheckSpinner
    });
    document.body.appendChild(element);   
    element.open();
    element.canBeClosed();
    return Promise.resolve().then(() => {
      const closeIcon = element.shadowRoot.querySelector('lightning-icon[title=Close]');
      expect(closeIcon).not.toBeNull();

      closeIcon.dispatchEvent(new CustomEvent('click'));
      return Promise.resolve().then(() => {
        expect(element.shadowRoot.innerHTML).toBe('');
      });
    });
  });

  it('spinner is showing messages by sections and do not mix them', () => {
    const element = createElement('c-orgcheck-spinner', {
      is: OrgcheckSpinner
    });
    document.body.appendChild(element);
    // Opening the spinner
    element.open();
    // Add a new section called "1" with a message "A"
    element.sectionStarts('1', 'A');
    return Promise.resolve().then(() => {
      const list = element.shadowRoot.querySelectorAll('.slds-progress__list > li');
      // list should have only one element (because only one section at this time)
      expect(list).toHaveLength(1);
      // the only section should be setup as follow:
      expect(list[0].classList.contains('slds-is-completed')).toBeTruthy();
      expect(list[0].childNodes[0].classList.contains('progress-marker-started')).toBeTruthy();
      expect(list[0].childNodes[1].innerHTML).toMatch(/<b [a-z0-9-]+=\"\">1<\/b> +A/);

      // Add a new section called "21" with a message "B"
      element.sectionContinues('2', 'B');
      return Promise.resolve().then(() => {
        const list = element.shadowRoot.querySelectorAll('.slds-progress__list > li');
        // list should have now two elements (because we added a second one)
        expect(list).toHaveLength(2);
        // the first section (1) should be setup as follow:
        expect(list[0].classList.contains('slds-is-completed')).toBeTruthy();
        expect(list[0].childNodes[0].classList.contains('progress-marker-started')).toBeTruthy();
        expect(list[0].childNodes[1].innerHTML).toMatch(/<b [a-z0-9-]+=\"\">1<\/b> +A/);
        // the first section (2) should be setup as follow:
        expect(list[1].classList.contains('slds-is-completed')).toBeTruthy();
        expect(list[1].childNodes[0].classList.contains('progress-marker-started')).toBeTruthy();
        expect(list[1].childNodes[1].innerHTML).toMatch(/<b [a-z0-9-]+=\"\">2<\/b> +B/);

        // Setting the message of an existing section (1)
        element.sectionEnded('1', 'C');
        // Setting an error message to an existing section (2)
        element.sectionFailed('2', 'Z');
        return Promise.resolve().then(() => {
          const list = element.shadowRoot.querySelectorAll('.slds-progress__list > li');
          // list should still have two elements (because we did not add new ones)
          expect(list).toHaveLength(2);
          // the first section (1) should be setup as follow:
          expect(list[0].classList.contains('slds-is-completed')).toBeTruthy();
          expect(list[0].childNodes[0].classList.contains('progress-marker-ended')).toBeTruthy();
          expect(list[0].childNodes[1].innerHTML).toMatch(/<b [a-z0-9-]+=\"\">1<\/b> +C/);
          // the first section (2) should be setup as follow:
          expect(list[1].classList.contains('slds-has-error')).toBeTruthy();
          expect(list[1].childNodes[0].classList.contains('progress-marker-error')).toBeTruthy();
          expect(list[1].childNodes[1].innerHTML).toMatch(/<b [a-z0-9-]+=\"\">2<\/b> +Z/);
        });
      });
    });
  });  
});