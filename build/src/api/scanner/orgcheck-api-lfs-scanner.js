/**
 * @description Lightning Flow Scanner integration for OrgCheck. Scans flows using the LFS_Core.js static resource
 */
export class LFSScanner {

    /**
     * @description Scan flows using Lightning Flow Scanner
     * @param {Array<any>} flowRecords - Flow metadata records from Tooling API
     * @returns {Promise<Map<string, Array<any>>>} Map of flow version ID to LFS violations
     */
    static async scanFlows(flowRecords) {
        try {
            // @ts-ignore
            const lfsCore = window?.lightningflowscanner ?? null;

            if (!lfsCore) {
                // console.warn('LFS_Core.js not available, skipping LFS scanning');
                return new Map();
            }

            const { Flow, scan } = lfsCore;

console.warn('scanFlows: --------------------------');;
console.warn(`scanFlows: flowRecords(size)=${flowRecords.length}`);
console.warn(`scanFlows: flowRecords(json)=${JSON.stringify(flowRecords)}`);
flowRecords.forEach((record, index) => {
    console.warn(`scanFlows: flowRecords[${index}]: Id=${record.Id}, FullName=${record.FullName}, Metadata=${JSON.stringify(record.Metadata)}`);
})
console.warn('scanFlows: --------------------------');

            // Convert flow records to LFS format
            const lfsFlows = flowRecords.filter(record => record.Metadata) // only if flows have metadata!
                .map(record => ({
                    uri: record.Id,
                    flow: new Flow(record.FullName, record.Metadata)
                }));

            // Scan flows
            const scanResults = scan(lfsFlows);

            // Map results: flowVersionId -> violations
            return this.mapResults(scanResults);

        } catch (error) {
            console.error('Error scanning flows with LFS: ', error?.message || JSON.stringify(error));
            return new Map();
        }
    }

    /**
     * @description Map LFS scan results to OrgCheck format
     * @param {Array<any>} scanResults - LFS scan results
     * @returns {Map<string, Array<string>>} Map of flow version ID to violations
     */
    static mapResults(scanResults) {
        const violationsMap = new Map();
        for (const result of scanResults) {
            const violations = result.ruleResults
                .filter((/** @type {any} */ ruleResult) => ruleResult.occurs === true)
                .map((/** @type {any} */ ruleResult) => ruleResult.ruleName);
            if (violations.length > 0) {
                violationsMap.set(result.flow.uri, violations);
            }
        }
        return violationsMap;
    }
}
