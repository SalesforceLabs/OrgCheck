import { CompressorIntf } from 'src/api/core/cache/orgcheck-api-compressor';

export class CompressorMock_IdemPotent implements CompressorIntf {
  compress(d: string) { return `[${d}]`; }
  decompress(d: string) { return d.substring(1, d?.length - 1); }
};