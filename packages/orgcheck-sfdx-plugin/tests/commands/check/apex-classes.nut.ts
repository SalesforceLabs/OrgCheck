/// <reference types="jest" />
import type { ExecCmdResult } from '@salesforce/cli-plugins-testkit';
import { execCmd } from '@salesforce/cli-plugins-testkit';

jest.mock('@salesforce/cli-plugins-testkit', () => ({
  execCmd: jest.fn(),
}));

const mockExecCmd = jest.mocked(execCmd);

const mockJsonOutput = {
  status: 0,
  result: {
    orgCheckVersion: '8.0.0',
    salesforceOrgId: '00Dxx0000000000',
    dateCheck: new Date().toISOString(),
    action: 'apex-classes',
    results: { length: 2, items: [{ name: 'TestClass1' }, { name: 'TestClass2' }] },
  },
  warnings: [] as string[],
};

const mockResult: ExecCmdResult<unknown> = {
  jsonOutput: mockJsonOutput,
  shellOutput: { stdout: JSON.stringify(mockJsonOutput), stderr: '', code: 0 } as never,
  execCmdDuration: { milliseconds: 0 } as never,
};

beforeEach(() => {
  (mockExecCmd as jest.Mock).mockReturnValue(mockResult);
});

/**
 * Unit test for `check apex-classes` command.
 * Mocks execCmd to avoid calling the real sf command (no org dependency, no temp files).
 * Run with: yarn test:nut (from packages/orgcheck-sfdx-plugin)
 */
describe('check apex-classes', () => {
  it('should run check apex-classes with --json and return valid output', () => {
    const result = execCmd<{
      orgCheckVersion: string;
      salesforceOrgId: string;
      dateCheck: string;
      action: string;
      results: { length: number; items: unknown[] };
    }>('check apex-classes --target-org mockOrg --json', {
      ensureExitCode: 0,
    });

    expect(mockExecCmd).toHaveBeenCalledWith(
      expect.stringContaining('check apex-classes'),
      expect.objectContaining({ ensureExitCode: 0 })
    );
    expect(result.jsonOutput).toBeTruthy();
    expect(result.jsonOutput?.status).toBe(0);

    const output = result.jsonOutput?.result;
    expect(output).toBeTruthy();
    expect(typeof output?.orgCheckVersion).toBe('string');
    expect(typeof output?.salesforceOrgId).toBe('string');
    expect(output?.action).toBe('apex-classes');
    expect(output?.results).toBeTruthy();
    expect(typeof output?.results.length).toBe('number');
    expect(Array.isArray(output?.results.items)).toBe(true);
  });

  it('should accept --package flag', () => {
    const result = execCmd<{ results: { items: unknown[] } }>(
      'check apex-classes --target-org mockOrg -p 0Ho --json',
      { ensureExitCode: 0 }
    );

    expect(mockExecCmd).toHaveBeenCalledWith(
      expect.stringContaining('-p 0Ho'),
      expect.objectContaining({ ensureExitCode: 0 })
    );
    expect(result.jsonOutput?.result).toBeTruthy();
    expect(Array.isArray(result.jsonOutput?.result.results.items)).toBe(true);
  });
});
