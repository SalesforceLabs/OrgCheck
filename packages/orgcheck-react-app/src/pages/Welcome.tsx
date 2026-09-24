export default function Welcome() {
  return (
    <article className="slds-text-longform">
      <p>
        Introducing <b>Org Check</b>. An easy-to-install and easy-to-use Salesforce
        application in order to quickly analyze your org and its technical debt.
      </p>
      <h2 className="slds-text-heading_small">Support and feedback</h2>
      <ul className="slds-list_dotted">
        <li>
          <b>Issues or new ideas?</b> Track them at{' '}
          <a
            href="https://sfdc.co/OrgCheck-Backlog"
            target="_blank"
            rel="external noopener noreferrer"
          >
            sfdc.co/OrgCheck-Backlog
          </a>
        </li>
        <li>
          <b>Want to chat with other users?</b> Join us on the Trailblazer Community
          at{' '}
          <a
            href="https://sfdc.co/OrgCheck-Community"
            target="_blank"
            rel="external noopener noreferrer"
          >
            sfdc.co/OrgCheck-Community
          </a>
        </li>
        <li>
          <b>Social Media</b> Like and share posts on{' '}
          <a
            href="https://www.linkedin.com/company/OrgChecksfdc"
            target="_blank"
            rel="external noopener noreferrer"
          >
            LinkedIn
          </a>
          !
        </li>
      </ul>
      <p>
        <b>Org Check is free to use, but is not an official Salesforce product.</b>{' '}
        Org Check has not been officially tested or documented. Salesforce support
        is not available for Org Check.
      </p>
      <h2 className="slds-text-heading_small">Third party components</h2>
      <ul className="slds-list_dotted">
        <li>
          <b>D3js</b>: ISC license,{' '}
          <a href="https://d3js.org" target="_blank" rel="external noopener noreferrer">
            d3js.org
          </a>
        </li>
        <li>
          <b>fflate</b>: MIT license
        </li>
        <li>
          <b>JsForce</b>: MIT license,{' '}
          <a href="https://jsforce.github.io" target="_blank" rel="external noopener noreferrer">
            jsforce.github.io
          </a>
        </li>
        <li>
          <b>SheetJS</b>: Apache license v2.0
        </li>
        <li>
          <b>Lightning Flow Scanner</b>: MIT License
        </li>
      </ul>
    </article>
  );
}
