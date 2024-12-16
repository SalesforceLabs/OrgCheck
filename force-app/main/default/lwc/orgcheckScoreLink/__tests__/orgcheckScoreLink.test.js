import { createElement } from 'lwc';
import OrgcheckScoreLink from 'c/orgcheckScoreLink';
    
describe('c-orgcheck-score-link', () => {

  it('Nothing if score is set to zero', async () => {
    const element = createElement('c-orgcheck-score-link', {
      is: OrgcheckScoreLink
    });
    document.body.appendChild(element);
    // element.score not set.
    element.score = 0;
    return Promise.resolve().then(() => {
      // as there is a button shown ONLY if the score is defined and > 0 we should have nothing in the element
      expect(element.shadowRoot.innerHTML).toBe('');
    });
  });

  it('If score is set to one', async () => {
    const element = createElement('c-orgcheck-score-link', {
      is: OrgcheckScoreLink
    });
    document.body.appendChild(element);
    // element.score set to one.
    element.score = 1;
    return Promise.resolve().then(() => {
      // as there is a button shown ONLY if the score is defined and > 0 we should have that button in the element
      expect(element.shadowRoot.innerHTML).not.toBe('');
      expect(element.shadowRoot.querySelector('lightning-button')).not.toBeNull();
    });
  });
});