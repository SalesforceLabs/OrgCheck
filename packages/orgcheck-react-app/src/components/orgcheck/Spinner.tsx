import { CircleStop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrgCheck } from '@/context/OrgCheckContext';
import ModalCloseButton from '@/components/orgcheck/ModalCloseButton';
import mascotUrl from '@/assets/orgcheck/MascotAnimated.svg';

export default function OrgCheckSpinner() {
  const { spinner, closeSpinner, interruptSection } = useOrgCheck();
  if (!spinner.isOpen) return null;

  const sections = [
    ...spinner.sections.filter(section => section.status !== 'ended'),
    ...spinner.sections.filter(section => section.status === 'ended'),
  ];

  return (
    <div>
      <div className="slds-backdrop slds-backdrop_open" />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="orgcheck-spinner-title"
        className="slds-modal slds-fade-in-open slds-modal_large"
      >
        <div className="slds-modal__container">
          {spinner.isClosable ? <ModalCloseButton onClick={closeSpinner} /> : null}
          <header className="slds-modal__header">
            <h1 id="orgcheck-spinner-title" className="slds-modal__title slds-hyphenate">
              Org Check is spinning around for {Math.round(spinner.waitingTime)} seconds...
            </h1>
          </header>
          <div className="slds-modal__content slds-p-around_medium">
            <div className="slds-grid slds-gutters slds-wrap">
              <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-3 slds-text-align_center">
                <img
                  src={mascotUrl}
                  alt="Org Check mascot is spinning"
                  width={256}
                  height={256}
                />
              </div>
              <div className="slds-col slds-size_1-of-1 slds-medium-size_2-of-3">
                {spinner.hadError ? (
                  <div className="slds-scoped-notification slds-media slds-media_center slds-theme_error" role="status">
                    <div className="slds-media__body">
                      <p>
                        <b>We really apologize for this error.</b>
                        <br />
                        Please consider{' '}
                        <a
                          href="https://sfdc.co/OrgCheck-Backlog"
                          target="_blank"
                          rel="external noopener noreferrer"
                        >
                          logging a new issue
                        </a>{' '}
                        with all information that may help to reproduce the error.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="slds-m-bottom_x-small">{spinner.inProgressMessage}</p>
                    <div
                      className="slds-progress-bar slds-progress-bar_circular"
                      aria-label={spinner.inProgressMessage || 'Loading progress'}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={spinner.inProgressPercentage}
                      role="progressbar"
                    >
                      <span
                        className="slds-progress-bar__value"
                        style={{ width: `${spinner.inProgressPercentage}%` }}
                      >
                        <span className="slds-assistive-text">Progress: {spinner.inProgressPercentage}%</span>
                      </span>
                    </div>
                  </>
                )}
                <ol className="slds-m-top_small slds-list_dotted" style={{ maxHeight: '16rem', overflow: 'auto' }}>
                  {sections.map(section => (
                    <li key={section.id}>
                      <span
                        className={
                          section.status === 'failed'
                            ? 'slds-text-color_error'
                            : section.status === 'ended'
                              ? 'slds-text-color_success'
                              : 'slds-text-color_default'
                        }
                      >
                        ●
                      </span>{' '}
                      <b>{section.id}</b> {section.label}
                      {section.showInterruptButton && section.status === 'in-progress' ? (
                        <>
                          {' '}
                          <Button
                            type="button"
                            variant="destructive"
                            size="xs"
                            className="slds-m-left_xx-small"
                            title="Interrupt this long-running process"
                            onClick={() => interruptSection(section.id)}
                          >
                            <CircleStop width={12} height={12} aria-hidden="true" /> Too long? Interrupt!
                          </Button>
                        </>
                      ) : null}
                      {section.contextInformation ? (
                        <ol className="slds-list_dotted slds-m-left_medium">
                          {section.contextInformation.map(item => (
                            <li key={item.key}>
                              <b>{item.key}</b>: {item.value}
                            </li>
                          ))}
                        </ol>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
