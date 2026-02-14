import { CompressorIntf } from "../../src/api/core/orgcheck-api-compressor";

export class CompressorMock_IdemPotent implements CompressorIntf {
  compress(/** @type {string} */ d: string) { return `[${d}]`; }
  decompress(/** @type {string} */ d: string) { return d.substring(1, d?.length - 1); }
};