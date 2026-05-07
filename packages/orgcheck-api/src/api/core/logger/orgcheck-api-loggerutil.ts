export class LoggerUtil {
    public static JSONstringifyWithoutRef(json: unknown): string {
        if (json) {
            try {
                return JSON.stringify(json, (k: string, v: unknown) => ( k.endsWith('Ref') ? undefined : v ))
            } catch {
                return (json as { toString(): string }).toString() ?? '';
            }
        }
        return '';
    }
    public static MapToArraysWithoutRef(map: Map<string, unknown>) {
        return Array.from(map.entries()).filter(t => t[0]?.endsWith('Ref') === false)
    }
}