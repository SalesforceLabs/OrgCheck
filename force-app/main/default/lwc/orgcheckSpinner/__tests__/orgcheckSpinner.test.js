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
    element.open();
    element.sectionStarts('1', 'A');
    return Promise.resolve().then(() => {
      const list = element.shadowRoot.querySelectorAll('.slds-progress__list > li');
      expect(list).toHaveLength(1);
      expect(list[0].classList.contains('slds-is-completed')).toBeTruthy();
      expect(list[0].childNodes[0].classList.contains('progress-marker-started')).toBeTruthy();
      expect(list[0].childNodes[1].innerHTML).toBe('[1] A');

      element.sectionContinues('2', 'B');
      return Promise.resolve().then(() => {
        const list = element.shadowRoot.querySelectorAll('.slds-progress__list > li');
        expect(list).toHaveLength(2);
        expect(list[0].classList.contains('slds-is-completed')).toBeTruthy();
        expect(list[0].childNodes[0].classList.contains('progress-marker-started')).toBeTruthy();
        expect(list[0].childNodes[1].innerHTML).toBe('[1] A');
        expect(list[1].classList.contains('slds-is-completed')).toBeFalsy();
        expect(list[1].childNodes[0].classList.contains('progress-marker-started')).toBeFalsy();
        expect(list[1].childNodes[1].innerHTML).toBe('[2] B');

        element.sectionEnded('1', 'C');
        element.sectionFailed('2', 'Z');
        return Promise.resolve().then(() => {
          const list = element.shadowRoot.querySelectorAll('.slds-progress__list > li');
          expect(list).toHaveLength(2);
          expect(list[0].classList.contains('slds-is-completed')).toBeTruthy();
          expect(list[0].childNodes[0].classList.contains('progress-marker-ended')).toBeTruthy();
          expect(list[0].childNodes[1].innerHTML).toBe('[1] C');
          expect(list[1].classList.contains('slds-has-error')).toBeTruthy();
          expect(list[1].childNodes[0].classList.contains('progress-marker-error')).toBeTruthy();
          expect(list[1].childNodes[1].innerHTML).toBe('[2] Z');
        });
      });
    });
  });  
});