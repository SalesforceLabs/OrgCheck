import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';
import { CheckResult } from '../../../src/commands/check/global-view.js';

let testSession: TestSession;

describe('check global-view NUTs', () => {
  before('prepare session', async () => {
    testSession = await TestSession.create();
  });

  after(async () => {
    await testSession?.clean();
  });

  it('should run', () => {
    const result = execCmd<CheckResult>('check global-view --json', {
      ensureExitCode: 0,
    }).jsonOutput?.result;
    expect(result?.length).to.be.greaterThan(0);
  });
});
