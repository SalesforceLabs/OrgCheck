import { SfCommand } from '@salesforce/sf-plugins-core';
import orgcheck from '@orgcheck/api';

export class OrgCheckSfPluginLoggerSetup<T> implements orgcheck.LoggerSetup {

  private nbSuccesses: number;
  private failures: Array<Error | string>;
  private sections: Set<string>;
  
  public constructor(private command: SfCommand<T>) {
    this.sections = new Set();
    this.nbSuccesses = 0;
    this.failures = [];
  }

  public started(section: string): void {
    this.command.info(`[${section}] STARTED`);
    this.sections.add(section);
  }
  
  public messageLogged(section: string, message?: string): void {
    this.command.info(`[${section}] ${message ?? ''}`);
  }

  public messageSilentlyLogged(section: string, message?: string): void {
    this.command.warn(`[${section}] ${message ?? ''}`);
  }
  
  public endedWithError(section: string, error?: Error | string): void {
    this.command.warn(`[${section}] ${JSON.stringify(error ?? {})}`);
    this.failures.push(error ?? 'Empty error');
  }
  
  public endedSuccessfully(section: string, message?: string): void {
    this.command.logSuccess(`[${section}] ${message ?? ''}`);
    this.nbSuccesses++;
  }
  
  public stopped(section: string): void {
    this.command.info(`[${section}] STOPPED`);
    this.sections.delete(section);
  }
}