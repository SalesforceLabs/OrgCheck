// @ts-ignore
import { createElement } from '@lwc/engine-dom';
import OrgcheckApp from '../orgcheckApp';

describe('c-orgcheck-app', () => {

  it('Should work', async () => {
    const element = createElement('c-orgcheck-app', {
      is: OrgcheckApp   
    });
    document.body.appendChild(element);
  });
});