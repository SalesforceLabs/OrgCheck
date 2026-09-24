import { Link } from 'react-router';

export default function NotFound() {
  return (
    <div className="slds-text-align_center slds-p-around_large">
      <h1 className="slds-text-heading_large slds-m-bottom_small">404</h1>
      <p className="slds-m-bottom_medium">Page not found</p>
      <Link to="/" className="slds-button slds-button_neutral">
        Go to Welcome
      </Link>
    </div>
  );
}
