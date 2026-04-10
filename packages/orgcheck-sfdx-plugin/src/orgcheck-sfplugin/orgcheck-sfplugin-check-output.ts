import { ApiIntf, SfdcOrganization } from '@orgcheck/api';

export type OrgCheckSfPluginResult<T> = {
  length: number;
  items: T;
};

export type OrgCheckSfPluginOutput<T> = {
  orgCheck: { version: string };
  salesforceOrganization: { id: string; name: string; type: string; requestAPIUsage: string };
  dateCheck: string;
  action: string;
  results: OrgCheckSfPluginResult<T>;
};

export async function OrgCheckSfPluginGenerateOutput<T>(
  actionName: string,
  orgcheckApi: ApiIntf,
  items: T,
): Promise<OrgCheckSfPluginOutput<T>> {
  let length = 1;
  if (items instanceof Map) length = items.size;
  if (Array.isArray(items) === true) length = items.length;
  const org: SfdcOrganization = await orgcheckApi.getOrganizationInformation();
  return {
    orgCheck: {
      version: orgcheckApi.version,
    },
    salesforceOrganization: {
      id: org.id,
      name: org.name,
      type: org.type,
      requestAPIUsage: `${orgcheckApi.dailyApiRequestLimitInformation?.currentUsagePercentage ?? 0} %`,
    },
    dateCheck: new Date().toISOString(),
    action: actionName,
    results: { length, items },
  };
}
