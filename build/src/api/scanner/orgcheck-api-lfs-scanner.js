/**
 * @description Lightning Flow Scanner integration for OrgCheck
 * Scans flows using the LFS_Core.js static resource
 */

// LFS rule name to OrgCheck rule ID mapping (starting at 100 to avoid conflicts)
const LFS_RULE_TO_ORGCHECK_ID = {
    'InactiveFlow': 100,
    'ProcessBuilder': 101,
    'FlowDescription': 102,
    'APIVersion': 103,
    'UnsafeRunningContext': 104,
    'SOQLQueryInLoop': 105,
    'DMLStatementInLoop': 106,
    'ActionCallsInLoop': 107,
    'HardcodedId': 108,
    'HardcodedUrl': 109,
    'MissingNullHandler': 110,
    'MissingFaultPath': 111,
    'RecursiveAfterUpdate': 112,
    'DuplicateDMLOperation': 113,
    'GetRecordAllFields': 114,
    'RecordIdAsString': 115,
    'UnconnectedElement': 116,
    'UnusedVariable': 117,
    'CopyAPIName': 118,
    'CyclomaticComplexity': 119,
    'SameRecordFieldUpdates': 120,
    'TriggerOrder': 121,
    'MissingMetadataDescription': 122,
    'MissingFilterRecordTrigger': 123,
    'TransformInsteadOfLoop': 124,
    'AutoLayout': 125
};

export class LFSScanner {

    /**
     * @description Normalize flow metadata from Tooling API format to LFS-compatible format.
     * The Tooling API returns null for empty node types, while LFS (which uses XML parser)
     * expects those properties to simply be missing. This also handles null elements in arrays.
     * @param {any} metadata - Flow metadata from Tooling API
     * @returns {any} Normalized metadata compatible with LFS
     */
    static normalizeMetadata(metadata) {
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
                if (normalizedValue != null && !(Array.isArray(normalizedValue) && normalizedValue.length === 0)) {
                    normalized[key] = normalizedValue;
                }
            }
        }
        return normalized;
    }

    /**
     * @description Scan flows using Lightning Flow Scanner
     * @param {Array<any>} flowRecords - Flow metadata records from Tooling API
     * @param {any} sfdcManager - Salesforce manager instance
     * @returns {Promise<Map<string, Array<any>>>} Map of flow version ID to LFS violations
     */
    static async scanFlows(flowRecords, sfdcManager) {
        try {
            // Load LFS_Core.js from static resource
            const lfsCore = await this.loadLFSCore(sfdcManager);
            if (!lfsCore) {
                console.warn('LFS_Core.js not available, skipping LFS scanning');
                return new Map();
            }

            const { Flow, scan } = lfsCore;

            // Filter out records with null metadata (can happen with UNKNOWN_EXCEPTION errors)
            const validFlowRecords = flowRecords.filter(record => record.Metadata != null);

            // Convert flow records to LFS format
            // Normalize metadata to match LFS expectations (Tooling API vs XML parser differences)
            const lfsFlows = [];
            for (const record of validFlowRecords) {
                try {
                    const normalizedMetadata = this.normalizeMetadata(record.Metadata);
                    const flow = new Flow(record.FullName, normalizedMetadata);
                    // Use 15-char ID to match flowDefinition.currentVersionId format
                    const flowId15 = sfdcManager.caseSafeId(record.Id);
                    lfsFlows.push({ uri: flowId15, flow });
                } catch (flowError) {
                    console.error(`LFS: Error creating Flow for ${record.FullName}:`, flowError?.message || flowError);
                }
            }

            // Scan flows
            const scanResults = scan(lfsFlows);

            // Map results: flowVersionId -> violations
            return this.mapResults(scanResults, sfdcManager);

        } catch (error) {
            console.error('Error scanning flows with LFS:', error);
            return new Map();
        }
    }

    /**
     * @description Load LFS_Core.js static resource
     * @param {any} sfdcManager - Salesforce manager instance
     * @returns {Promise<any>} LFS core module or null
     */
    static async loadLFSCore(sfdcManager) {
        try {
            // In browser environment, check if LFS is already loaded
            if (typeof window !== 'undefined' && window.lightningflowscanner) {
                return window.lightningflowscanner;
            }

            // In Node.js/Salesforce backend, we'd load from static resource
            // For now, return null as this needs platform-specific implementation
            return null;

        } catch (error) {
            console.error('Error loading LFS_Core:', error);
            return null;
        }
    }

    /**
     * @description Map LFS scan results to OrgCheck format
     * @param {Array<any>} scanResults - LFS scan results
     * @param {any} sfdcManager - Salesforce manager instance
     * @returns {Map<string, Array<any>>} Map of flow version ID to violations
     */
    static mapResults(scanResults, sfdcManager) {
        const violationsMap = new Map();

        for (const result of scanResults) {
            const flowId = result.flow.uri;
            const violations = [];

            for (const ruleResult of result.ruleResults) {
                if (!ruleResult.occurs) continue;

                const ruleId = LFS_RULE_TO_ORGCHECK_ID[ruleResult.ruleName];
                if (!ruleId) continue; // Skip unmapped rules

                for (const detail of ruleResult.details || []) {
                    violations.push({
                        ruleId: ruleId,
                        ruleName: ruleResult.ruleName,
                        severity: ruleResult.severity,
                        element: detail.name,
                        type: detail.type,
                        description: ruleResult.ruleDefinition?.description || ruleResult.errorMessage
                    });
                }
            }

            if (violations.length > 0) {
                violationsMap.set(flowId, violations);
            }
        }

        return violationsMap;
    }

    /**
     * @description Apply LFS violations to flow definition score
     * @param {any} flowDefinition - SFDC_Flow instance
     * @param {Array<any>} violations - LFS violations for this flow
     */
    static applyViolations(flowDefinition, violations) {
        if (!violations || violations.length === 0) return;

        for (const violation of violations) {
            flowDefinition.score++;
            flowDefinition.badReasonIds.push(violation.ruleId);

            // Map element to field if possible
            const fieldName = violation.element || 'lfs_violation';
            if (!flowDefinition.badFields.includes(fieldName)) {
                flowDefinition.badFields.push(fieldName);
            }
        }
    }
}
