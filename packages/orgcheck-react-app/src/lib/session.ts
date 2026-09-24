import { getOAuthSession } from '@/lib/oauth';
import { getRouterBasename } from '@/lib/paths';

export { getRouterBasename };

export type SalesforceSession = {
  accessToken: string;
  instanceUrl: string;
  source: 'platform' | 'env' | 'oauth';
};

function readSfdcEnv(): Window['SFDC_ENV'] {
  return window.SFDC_ENV ?? (globalThis as typeof globalThis & Window).SFDC_ENV;
}

export async function resolveSalesforceSession(): Promise<SalesforceSession | undefined> {
  const env = readSfdcEnv();
  const platformInstanceUrl =
    (typeof env?.instanceUrl === 'string' && env.instanceUrl) || window.location.origin;

  const fromEnvToken = env?.accessToken ?? env?.sessionId;
  if (typeof fromEnvToken === 'string' && fromEnvToken.length > 0) {
    return {
      accessToken: fromEnvToken,
      instanceUrl: platformInstanceUrl,
      source: 'platform',
    };
  }

  const fromVite = import.meta.env.VITE_SF_ACCESS_TOKEN;
  const fromViteInstance = import.meta.env.VITE_SF_INSTANCE_URL;
  if (typeof fromVite === 'string' && fromVite.length > 0) {
    if (typeof fromViteInstance !== 'string' || !fromViteInstance.startsWith('https://')) {
      throw new Error(
        'VITE_SF_ACCESS_TOKEN requires VITE_SF_INSTANCE_URL (https://your-domain.my.salesforce.com).'
      );
    }
    return {
      accessToken: fromVite,
      instanceUrl: fromViteInstance,
      source: 'env',
    };
  }

  const oauth = getOAuthSession();
  if (oauth) {
    return {
      accessToken: oauth.accessToken,
      instanceUrl: oauth.instanceUrl,
      source: 'oauth',
    };
  }

  return undefined;
}
