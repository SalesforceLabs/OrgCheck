import { useOrgCheck } from '@/context/OrgCheckContext';
import ModalCloseButton from '@/components/orgcheck/ModalCloseButton';

export default function OrgCheckModal() {
  const { modal, closeModal } = useOrgCheck();
  if (!modal.isShown) return null;

  return (
    <div>
      <button
        type="button"
        className="slds-backdrop slds-backdrop_open"
        aria-label="Close dialog backdrop"
        onClick={() => {
          if (modal.isClosable) closeModal();
        }}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="orgcheck-modal-title"
        className="slds-modal slds-fade-in-open slds-modal_medium"
      >
        <div className="slds-modal__container">
          {modal.isClosable ? <ModalCloseButton onClick={closeModal} /> : null}
          <header className="slds-modal__header">
            <h1 id="orgcheck-modal-title" className="slds-modal__title slds-hyphenate">
              {modal.headerTitle}
            </h1>
          </header>
          <div className="slds-modal__content slds-p-around_medium">
            {modal.message ? (
              <div dangerouslySetInnerHTML={{ __html: modal.message }} />
            ) : null}
            {modal.errorChains.length > 0 ? (
              <div>
                <div className="slds-scoped-notification slds-media slds-media_center slds-theme_warning" role="status">
                  <div className="slds-media__body">
                    <p>
                      Please review our{' '}
                      <a
                        href="http://sfdc.co/OrgCheck-FAQ"
                        target="_blank"
                        rel="external noopener noreferrer"
                      >
                        Org Check FAQ
                      </a>{' '}
                      and try to resolve this issue in your Org.
                    </p>
                    <p>
                      If the FAQ is not helping, consider creating an issue on{' '}
                      <a
                        href="http://sfdc.co/OrgCheck-Backlog"
                        target="_blank"
                        rel="external noopener noreferrer"
                      >
                        Org Check Issues tracker
                      </a>
                      .
                    </p>
                  </div>
                </div>
                <ul className="slds-list_dotted slds-m-top_small">
                  {modal.errorChains.map(chain => (
                    <li key={chain.index}>
                      <b>
                        Error #{chain.index}: {chain.message}
                      </b>
                      <pre className="slds-box slds-theme_shade slds-m-top_x-small slds-scrollable_x">
                        {chain.body}
                      </pre>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
