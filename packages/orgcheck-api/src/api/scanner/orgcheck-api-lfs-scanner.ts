/**
 * @description Lightning Flow Scanner integration for OrgCheck. Scans flows using the LFS_Core.js static resource
 */
export class LFSScanner {

    /**
     * @description Normalize flow metadata from Tooling API format to LFS-compatible format.
     * The Tooling API returns null for empty node types, while LFS (which uses XML parser)
     * expects those properties to simply be missing. This also handles null elements in arrays.
     * @param {any} metadata - Flow metadata from Tooling API
     * @returns {any} Normalized metadata compatible with LFS
     */
    static normalizeMetadata(metadata: any): any {
        if (metadata == null) return null;
        if (typeof metadata !== 'object') return metadata;
        if (Array.isArray(metadata)) {
            // Filter out null/undefined elements and normalize each remaining element
            return metadata
                .filter(item => item != null)
                .map(item => this.normalizeMetadata(item));
        }
        // For objects, recursively normalize and remove null/undefined properties
        const normalized = {};
        for (const key in metadata) {
            const value = metadata[key];
            if (value != null) {
                const normalizedValue = this.normalizeMetadata(value);
                // Only include non-null normalized values
                // Also skip empty arrays as LFS doesn't expect them
                if (normalizedValue != null && !(Array.isArray(normalizedValue) && normalizedValue?.length === 0)) {
                    normalized[key] = normalizedValue;
                }
            }
        }
        return normalized;
    }

    /**
     * @description Scan flows using Lightning Flow Scanner
     * @param {Array<any>} flowRecords - Flow metadata records from Tooling API
     * @param {Function} CaseSafeId - Function to convert 18-char IDs to 15-char
     * @returns {Promise<Map<string, Array<any>>>} Map of flow version ID to LFS violations
     */
    static async scanFlows(flowRecords: Array<any>, CaseSafeId: Function): Promise<Map<string, Array<any>>> {
        let results = new Map();
        try {
            // @ts-ignore
            const lfsCore = typeof window !== 'undefined' ? window?.lightningflowscanner : globalThis?.lightningflowscanner ?? null;
            if (lfsCore) {
                // Convert flow records to LFS format
                const lfsFlows = flowRecords.filter(record => record.Metadata) // only if flows have metadata!
                    .map(record => {
                        /** @type {string} */
                        const id15: string = CaseSafeId(record.Id);
                        return {
                            uri: id15,
                            flow: new lfsCore.Flow(id15, this.normalizeMetadata(record.Metadata))
                        };
                    });

                // Scan flows
                const scanResults = lfsCore.scan(lfsFlows);

                // Map results: flowVersionId -> violations
                results = this.mapResults(scanResults);
            }

        } catch (error) {
            console.info(`Error scanning flows with LFS: returning an empty map (error: ${error?.message})`);
        }
        return results;
    }

    /**
     * @description Map LFS scan results to OrgCheck format
     * @param {Array<any>} scanResults - LFS scan results
     * @returns {Map<string, Array<string>>} Map of flow version ID to violations
     */
    static mapResults(scanResults: Array<any>): Map<string, Array<string>> {
        const violationsMap = new Map();
        for (const result of scanResults) {
            const violations = result.ruleResults
                .filter((/** @type {any} */ ruleResult: any) => ruleResult.occurs === true)
                .map((/** @type {any} */ ruleResult: any) => ruleResult.ruleName);
            if (violations?.length > 0) {
                violationsMap.set(result.flow.uri, violations);
            }
        }
        return violationsMap;
    }
}
