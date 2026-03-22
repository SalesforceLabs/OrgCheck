import * as fflate from 'fflate';
// import * as lightningflowscanner from '@flow-scanner/lightning-flow-scanner-core';

export const OrgCheckSfPluginLoadThirdParties = (): void => {
    // @ts-expect-error Make fflate available to orgcheck (used for cache compression)
    globalThis.fflate = fflate;

    // lightningflowscanner disabled - uncomment when @flow-scanner/lightning-flow-scanner-core is available
    // globalThis.lightningflowscanner = lightningflowscanner;
};