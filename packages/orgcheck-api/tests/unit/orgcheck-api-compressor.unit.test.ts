import { describe, it, expect } from "@jest/globals";
import { Compressor } from "../../src/api/core/orgcheck-api-compressor-impl";
import * as fflate from "fflate";

describe('tests.api.unit.Compressor', () => {
    // @ts-ignore    
    globalThis.fflate = fflate;
    it('checks if the compression implementation runs correctly', async () => {
        const compressor = new Compressor();
        const compressed = compressor.compress('This is a test string');
        expect(compressed).toBe('78DA0BC9C82C5600A2448592D4E21285E292A2CCBC7400514907AD');
        const decompressed = compressor.decompress(compressed);
        expect(decompressed).toBe('This is a test string');
    });
});