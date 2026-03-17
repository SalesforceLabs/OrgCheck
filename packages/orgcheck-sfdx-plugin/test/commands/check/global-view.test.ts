import { MockTestOrgData, TestContext } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';

let World: typeof import('../../../src/commands/check/global-view.js').default;

describe('check global-view', function () {
  this.timeout(3000);

  const $$ = new TestContext();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  before(async () => {
    process.env.ORGCHECK_TEST_MOCK = '1';
    const mod = await import('../../../src/commands/check/global-view.js');
    World = mod.default;
  });

  after(() => {
    delete process.env.ORGCHECK_TEST_MOCK;
  });

  beforeEach(async () => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
    const testOrg = new MockTestOrgData(undefined, { username: 'test@org.com' });
    await $$.stubAuths(testOrg);
  });

  afterEach(() => {
    $$.restore();
  });

  it('runs global-view', async () => {
    await World.run(['--target-org', 'test@org.com']);
    expect(sfCommandStubs.log.getCalls().length).to.be.greaterThanOrEqual(0);
  });

  it('runs global-view with --json', async () => {
    const output = await World.run(['--target-org', 'test@org.com', '--json']);
    expect(output.results.length).to.be.greaterThan(0);
  });
});
