import { Spinner } from '@salesforce/sf-plugins-core';
import orgcheck from '@orgcheck/api';

export class LoggerSetup implements orgcheck.LoggerSetup {

  private nbSuccesses: number;
  private nbFailures: number;
  private sections: Set<string>;
  
  public constructor(actionName: string, private spinner: Spinner) {

    this.spinner.start(`Performing action: ${actionName}...`);
    this.sections = new Set();
    this.nbSuccesses = 0;
    this.nbFailures = 0;
  }

  public started(section: string): void {
    this.sections.add(section);
  }
  
  public messageLogged(section: string, message?: string): void {
    this.spinner.status = `[${section}] ${message ?? ''}`;
  }
  
  public endedWithError(section: string, error?: Error | string): void {
    this.nbFailures++;
    this.spinner.status = `[${section}] ${error instanceof Error ? error?.message : error ?? 'Unknown error'}`;
  }
  
  public endedSuccessfully(section: string, message?: string): void {
    this.nbSuccesses++;
    this.spinner.status = `[${section}] ${message ?? 'Success'}`;
  }
  
  public stopped(section: string): void {
    this.sections.delete(section);
    if (this.sections.size === 0) {
      this.spinner.stop(`Done! ✅ ${this.nbSuccesses} successful recipes and ❌ ${this.nbFailures} failed recipes.`);
    }
  }
}