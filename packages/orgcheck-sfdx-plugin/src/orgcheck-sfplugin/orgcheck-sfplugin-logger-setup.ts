import orgcheck from '@orgcheck/api';
import { Logger } from '@salesforce/core';
import { Spinner } from '@salesforce/sf-plugins-core';

export class OrgCheckSfPluginLoggerSetup implements orgcheck.LoggerSetup {
  private nbSuccesses: number;
  private failures: Array<Error | string>;
  private sections: Set<string>;

  public constructor(private readonly logger: Logger, private readonly spinner: Spinner) {
    this.sections = new Set();
    this.nbSuccesses = 0;
    this.failures = [];
  }

  public started(section: string): void {
    this.logger.info(`[${section}] STARTED`);
    this.sections.add(section);
  }

  public messageLogged(section: string, message?: string): void {
    const msg = `[${section}] ${message ?? ''}`;
    this.logger.info(msg);
    this.spinner.status = msg;
  }

  /**
   * @description Debug message. Called by @orgcheck/api 8.0.1, the published version.
   * @param {string} section - the name of the operation
   * @param {string} [message] - the message to log for debugging
   */
  public messageSilentlyLogged(section: string, message?: string): void {
    this.logger.debug(`[${section}] ${message ?? ''}`);
  }

  /**
   * @description The operation ended with one error. Called by @orgcheck/api 8.0.1, the published
   *   version, which calls endedWithError (singular) and not endedWithErrors.
   * @param {string} section - the name of the operation
   * @param {Error | string} [error] - the error
   */
  public endedWithError(section: string, error?: Error | string): void {
    this.logger.warn(`[${section}] ${error}`);
    if (error) this.failures.push(error);
  }

  public endedWithErrors(section: string, errors?: Error []): void {
    this.logger.warn(`[${section}] ${errors}`);
    if (errors) this.failures.push(... errors);
  }

  public endedSuccessfully(section: string, message?: string): void {
    const msg = `[${section}] ${message ?? ''}`;
    this.logger.info(msg);
    this.spinner.status = msg;
    this.nbSuccesses++;
  }

  public stopped(section: string): void {
    this.logger.info(`[${section}] STOPPED`);
    this.sections.delete(section);
  }

  public canBeInterrupted(section: string, interruptCallback: () => void): void {
    this.logger.info(`[${section}] CAN BE INTERRUPTED`);
    interruptCallback();
    this.logger.info(`[${section}] WAS INTERRUPTED`);
  }
}
