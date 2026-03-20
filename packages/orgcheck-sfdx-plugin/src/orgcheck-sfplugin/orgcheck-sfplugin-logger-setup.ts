import { Spinner } from '@salesforce/sf-plugins-core';
import orgcheck from '@orgcheck/api';
import { Logger } from '@salesforce/core';

export class OrgCheckSfPluginLoggerSetup implements orgcheck.LoggerSetup {

  private nbSuccesses: number;
  private failures: Array<Error | string>;
  private sections: Set<string>;
  private logger: Logger | undefined;
  
  public constructor(private spinner: Spinner, isVerbose: boolean) {
    spinner.start(`Starting...`);
    if (isVerbose === true) {
      this.logger = Logger.childFromRoot('orgcheck-sfplugin');
    }
    this.sections = new Set();
    this.nbSuccesses = 0;
    this.failures = [];
  }

  public started(section: string): void {
    if (this.logger) {
      this.logger.info(`[${section}] STARTED`);
    }
    this.sections.add(section);
  }
  
  public messageLogged(section: string, message?: string): void {
    if (this.logger) {
      this.logger.info(`[${section}] LOG message: <${message ?? ''}>`);
    }
    this.spinner.status = `[${section}] ${message ?? ''}`;
  }

  public messageSilentlyLogged(section: string, message?: string): void {
    if (this.logger) {
      this.logger.debug(`[${section}] LOG message: <${message ?? ''}>`);
    }
  }
  
  public endedWithError(section: string, error?: Error | string): void {
    const message = error instanceof Error ? error?.message : error ?? 'Unknown error';
    if (this.logger) {
      this.logger.info(`[${section}] FAILURE error: <${JSON.stringify(error ?? {})}>`);
    }
    this.failures.push(error ?? 'Empty error');
    this.spinner.status = `[${section}] ${message}`;
  }
  
  public endedSuccessfully(section: string, message?: string): void {
    if (this.logger) {
      this.logger.info(`[${section}] SUCCESS message: <${message ?? ''}>`);
    }
    this.nbSuccesses++;
    this.spinner.status = `[${section}] ${message ?? ''}`;
  }
  
  public stopped(section: string): void {
    if (this.logger) {
      this.logger.info(`[${section}] STOPPED`);
    }
    this.sections.delete(section);
    if (this.sections.size === 0) {
      this.spinner.stop(`Done! ✅ ${this.nbSuccesses} successful recipes and ❌ ${this.failures.length} failed recipes.`);
    }
  }
}