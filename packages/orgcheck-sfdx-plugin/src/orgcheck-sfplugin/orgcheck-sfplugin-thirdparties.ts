import * as fflate from 'fflate';
import * as lightningflowscanner from '@flow-scanner/lightning-flow-scanner-core';

export const OrgCheckSfPluginLoadThirdParties = (): void => {
    // @ts-expect-error Make fflate available to orgcheck (used for cache compression)
    globalThis.fflate = fflate;
    
    // @ts-expect-error Make lightningflowscanner available to orgcheck (used for additional flow analysis)
    globalThis.lightningflowscanner = lightningflowscanner;
}