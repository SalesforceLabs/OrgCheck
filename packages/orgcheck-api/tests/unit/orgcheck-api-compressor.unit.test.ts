import { Compressor } from 'src/api/core/cache/orgcheck-api-compressor-impl';
import fflate from 'fflate';

describe('tests.api.unit.Compressor', () => {

    globalThis.fflate = fflate;

    it('checks if the compression implementation runs correctly', async () => {
        const compressor = new Compressor();
        const compressed = compressor.compress('This is a test string');
        expect(compressed).toBe('78DA0BC9C82C5600A2448592D4E21285E292A2CCBC7400514907AD');
    });

    it('checks if the decompression implementation runs correctly', async () => {
        const compressor = new Compressor();
        const decompressed = compressor.decompress('78DA0BC9C82C5600A2448592D4E21285E292A2CCBC7400514907AD');
        expect(decompressed).toBe('This is a test string');
    });

});