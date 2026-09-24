import { Button } from '@/components/ui/button';
import { useOrgCheck } from '@/context/OrgCheckContext';

export default function TermsAcceptance() {
  const { usage, acceptTerms } = useOrgCheck();
  if (!usage.needConfirmation) return null;

  return (
    <section className="slds-card slds-m-around_medium slds-theme_warning">
      <div className="slds-card__header">
        <h2 className="slds-text-heading_medium">Just to let you know...</h2>
      </div>
      <div className="slds-card__body slds-card__body_inner">
        Using <b>Org Check</b> in this Salesforce organization <b>will</b> increase
        its <b>API Request limit</b>. The number of requests it will make to your org
        really depends on how much metadata you have.
        <h2 className="slds-text-heading_small slds-m-top_medium slds-m-bottom_x-small">
          What is Salesforce saying about this limit?
        </h2>
        If your org reaches or exceeds its daily API request limit, Salesforce still
        lets the operations proceed by a certain amount, if possible.{' '}
        <a
          href="https://developer.salesforce.com/docs/atlas.en-us.salesforce_app_limits_cheatsheet.meta/salesforce_app_limits_cheatsheet/salesforce_app_limits_platform_api.htm"
          target="_blank"
          rel="external noopener noreferrer"
        >
          developer.salesforce.com
        </a>
        <h2 className="slds-text-heading_small slds-m-top_medium slds-m-bottom_x-small">
          How do we manage this limit in Org Check?
        </h2>
        <b>Org Check</b> is monitoring the <b>API Request limit</b> of your org every
        time it uses the Salesforce APIs. It will <b>warn</b> you when the limit
        starts reaching <b>70%</b>, and will <b>stop</b> working when the limit
        reaches <b>90%</b>.
        <h2 className="slds-text-heading_small slds-m-top_medium slds-m-bottom_x-small">
          Some last comments...
        </h2>
        We strongly encourage you to use Org Check in a <b>dedicated Sandbox</b>{' '}
        which is not part of your Salesforce development lifecycle.
        <h2 className="slds-text-heading_small slds-m-top_medium slds-m-bottom_x-small">
          Now... Do you want to use Org Check in this Salesforce org?
        </h2>
        <div className="slds-m-top_small slds-text-align_center">
          <Button onClick={() => void acceptTerms()}>Yes</Button>
          <span className="slds-m-horizontal_x-small" />
          <Button variant="destructive">No</Button>
        </div>
      </div>
    </section>
  );
}
