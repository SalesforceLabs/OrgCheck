import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';
import * as orgcheck from '@orgcheck/api';
import { OrgCheckOutput } from '../../../src/orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';

let testSession: TestSession;

describe('check global-view NUTs', () => {
  before('prepare session', async () => {
    testSession = await TestSession.create();
  });

  after(async () => {
    await testSession?.clean();
  });

  it('should run', () => {
    const output = execCmd<OrgCheckOutput<orgcheck.DataCollectionStatisticsIntf[]>>('check global-view --json', {
      ensureExitCode: 0,
    }).jsonOutput?.result;
    expect(output?.results?.length).to.be.greaterThan(0);
  });
});
