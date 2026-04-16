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

  public messageSilentlyLogged(section: string, message?: string): void {
    const msg = `[${section}] ${message ?? ''}`;
    this.logger.info(msg);
    this.spinner.status = msg;
  }

  public endedWithError(section: string, error?: Error | string): void {
    this.logger.warn(`[${section}] ${JSON.stringify(error ?? {})}`);
    this.failures.push(error ?? 'Empty error');
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
}
