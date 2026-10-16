import { createElement } from '@lwc/engine-dom';
import OrgcheckApp, { buildRoleBoxInnerHtml, buildRoleBoxOnClickHtml } from '../orgcheckApp';

const MALICIOUS_ROLE_NAME = 'Fake Role Level 7<a href="https://www.google.com">google</a>';
const ESCAPED_ROLE_NAME = 'Fake Role Level 7&lt;a href=&quot;https://www.google.com&quot;&gt;google&lt;/a&gt;';
const MALICIOUS_APINAME = 'Fake_Role<script>alert(1)</script>';
const ESCAPED_APINAME = 'Fake_Role&lt;script&gt;alert(1)&lt;/script&gt;';
const MALICIOUS_MEMBER_NAME = 'User <a href="https://evil.example">click</a>';
const ESCAPED_MEMBER_NAME = 'User &lt;a href=&quot;https://evil.example&quot;&gt;click&lt;/a&gt;';

describe('c-orgcheck-app', () => {

  describe('Accessibility', () => {
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

  describe('Empty Cache', () => {
    it('renders the default empty-cache state without initializing the API', async () => {
      const element = createElement('c-orgcheck-app', {
        is: OrgcheckApp
      });

      document.body.appendChild(element);
      await Promise.resolve();

      expect(element.shadowRoot.textContent).toContain('There is no cached data to display.');
      expect(element.shadowRoot.textContent).not.toContain('undefined');
    });
  });

  describe('Role hierarchy', () => {

    it('returns the static root label without interpolating record data', () => {
      const html = buildRoleBoxInnerHtml(0, {
        record: { name: MALICIOUS_ROLE_NAME, apiname: MALICIOUS_APINAME }
      });

      expect(html).toBe('<center><b>Role Hierarchy</b></center>');
    });

    it('escapes a malicious role name so it is not rendered as HTML', () => {
      const html = buildRoleBoxInnerHtml(1, {
        record: { name: MALICIOUS_ROLE_NAME, apiname: 'Fake_Role' }
      });

      expect(html).not.toContain('<a href=');
      expect(html).toContain(ESCAPED_ROLE_NAME);
      expect(html).toBe(`<center><b>${ESCAPED_ROLE_NAME}</b><br />Fake_Role</center>`);
    });

    it('escapes a malicious developer name so it is not rendered as HTML', () => {
      const html = buildRoleBoxInnerHtml(1, {
        record: { name: 'Safe Role', apiname: MALICIOUS_APINAME }
      });

      expect(html).not.toContain('<script>');
      expect(html).toContain(ESCAPED_APINAME);
      expect(html).toBe(`<center><b>Safe Role</b><br />${ESCAPED_APINAME}</center>`);
    });

    it('returns undefined for the root node', () => {
      expect(buildRoleBoxOnClickHtml(0, { record: { name: MALICIOUS_ROLE_NAME } })).toBeUndefined();
    });

    it('escapes role name, developer name, and member name in the modal HTML', () => {
      const html = buildRoleBoxOnClickHtml(7, {
        record: {
          name: MALICIOUS_ROLE_NAME,
          id: '00E000000000001',
          apiname: MALICIOUS_APINAME,
          activeMembersCount: 1,
          activeMemberRefs: [{ name: MALICIOUS_MEMBER_NAME }]
        }
      });

      expect(html).not.toContain('<a href=');
      expect(html).not.toContain('<script>');
      expect(html).toContain(ESCAPED_ROLE_NAME);
      expect(html).toContain(ESCAPED_APINAME);
      expect(html).toContain(`<li>${ESCAPED_MEMBER_NAME}</li>`);
      expect(html).toContain('No parent');
    });

    it('escapes parent role name in the modal HTML', () => {
      const html = buildRoleBoxOnClickHtml(2, {
        record: {
          name: 'Child Role',
          id: '00E000000000002',
          apiname: 'Child_Role',
          activeMembersCount: 0,
          parentRef: {
            name: MALICIOUS_ROLE_NAME,
            id: '00E000000000001',
            apiname: 'Parent_Role'
          }
        }
      });

      expect(html).not.toContain('<a href=');
      expect(html).toContain(`Parent Role Name: <b>${ESCAPED_ROLE_NAME}</b>`);
    });
  });

});