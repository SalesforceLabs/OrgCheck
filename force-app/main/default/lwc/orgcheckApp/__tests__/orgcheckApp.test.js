// @ts-ignore
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

  it('checks if the app component has no XSS Vulnerabilities', async () => {
    const element = createElement('c-orgcheck-app', {
      is: OrgcheckApp   
    });
    document.body.appendChild(element);
    
    const mainTab = element.shadowRoot.querySelector('lightning-tabset');
    const firstTab = mainTab.firstElementChild;

    // Reset the main tab value
    mainTab.activeTabValue = undefined;
    // Simulate a user selecting the first tab
    firstTab.dispatchEvent(new CustomEvent('active'));
    // Wait for the DOM to be updated
    await Promise.resolve().then(() => {
      // Main tab should have been updated to something defined
      expect(mainTab.activeTabValue).not.toBeUndefined(); 
      // 'home' is the value of the first tab which is copied in the mainTab active tab value
      expect(mainTab.activeTabValue).toBe('home'); 
    });

    // Reset the main tab value and inject some bad value in the first tab
    mainTab.activeTabValue = undefined;
    firstTab.value = '<script>alert("XSS")</script>';
    // Verify that the first tab value has been changed for real
    expect(firstTab.value).not.toBe('home');
    expect(firstTab.value).toBe('<script>alert("XSS")</script>');
    // Suppress console error output for this test
    console.error = jest.fn();
    // Simulate a user selecting the first tab again but with altered value to simulate XSS attack
    firstTab.dispatchEvent(new CustomEvent('active'));
    // Wait for the DOM to be updated
    await Promise.resolve().then(() => {
      // Main tab should not have been updated -- so it should be undefined at this point
      expect(mainTab.activeTabValue).toBeUndefined(); 
    });

    // Reset the main tab value and inject some good value in the first tab
    mainTab.activeTabValue = undefined;
    firstTab.value = 'code';
    // Verify that the first tab value has been changed for real
    expect(firstTab.value).not.toBe('home');
    expect(firstTab.value).toBe('code');
    // Simulate a user selecting the first tab again but with another value which is expected
    firstTab.dispatchEvent(new CustomEvent('active'));
    // Wait for the DOM to be updated
    await Promise.resolve().then(() => {
      // Value should be the same as the value is not an expected one and should be ignored
      expect(mainTab.activeTabValue).toBe('code');
    });
  });
});