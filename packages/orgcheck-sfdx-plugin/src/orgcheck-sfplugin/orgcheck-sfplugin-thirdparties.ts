import * as fflate from 'fflate';
import * as XLSX from 'xlsx';

// import * as lightningflowscanner from '@flow-scanner/lightning-flow-scanner-core';

export const OrgCheckSfPluginLoadThirdParties = (): void => {
    // @ts-expect-error Make fflate available to orgcheck (used for cache compression)
    globalThis.fflate = fflate;

    // @ts-expect-error Make XSLX available to orgcheck (used for excel export)
    globalThis.XLSX = XLSX;

    // lightningflowscanner disabled - uncomment when @flow-scanner/lightning-flow-scanner-core is available
    // globalThis.lightningflowscanner = lightningflowscanner;
};