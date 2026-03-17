import { ApiIntf } from "@orgcheck/api";
import { Org } from "@salesforce/core";

export type OrgCheckResult<T> = {
  length: number;
  items: T;
}

export type OrgCheckOutput<T> = {
  orgCheckVersion: string;
  orgId: string;
  requestAPIUsage: string;
  dateCheck: string;
  action: string;
  results: OrgCheckResult<T>;
};

export function OrgCheckGenerateOutput<T>(actionName: string, flags: { 'target-org': Org }, orgcheckApi: ApiIntf,  items: T): OrgCheckOutput<T> {
  let length = 1;
  if (items instanceof Map) length = items.size;
  if (Array.isArray(items) === true) length = items.length;
  return {
    orgCheckVersion: orgcheckApi.version,
    orgId: flags['target-org'].getOrgId(),
    requestAPIUsage: `${orgcheckApi.dailyApiRequestLimitInformation?.currentUsagePercentage ?? 0} %`,
    dateCheck: new Date().toISOString(),
    action: actionName,
    results: { length, items }
  }
}