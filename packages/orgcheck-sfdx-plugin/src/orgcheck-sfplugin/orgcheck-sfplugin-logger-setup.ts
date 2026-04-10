import orgcheck from '@orgcheck/api';
import { Logger } from '@salesforce/core';

export class OrgCheckSfPluginLoggerSetup implements orgcheck.LoggerSetup {
  private nbSuccesses: number;
  private failures: Array<Error | string>;
  private sections: Set<string>;

  public constructor(private readonly logger: Logger) {
    this.sections = new Set();
    this.nbSuccesses = 0;
    this.failures = [];
  }

  public started(section: string): void {
    this.logger.info(`[${section}] STARTED`);
    this.sections.add(section);
  }

  public messageLogged(section: string, message?: string): void {
    this.logger.info(`[${section}] ${message ?? ''}`);
  }

  public messageSilentlyLogged(section: string, message?: string): void {
    this.logger.info(`[${section}] ${message ?? ''}`);
  }

  public endedWithError(section: string, error?: Error | string): void {
    this.logger.warn(`[${section}] ${JSON.stringify(error ?? {})}`);
    this.failures.push(error ?? 'Empty error');
  }

  public endedSuccessfully(section: string, message?: string): void {
    this.logger.info(`[${section}] ${message ?? ''}`);
    this.nbSuccesses++;
  }

  public stopped(section: string): void {
    this.logger.info(`[${section}] STOPPED`);
    this.sections.delete(section);
  }
}
