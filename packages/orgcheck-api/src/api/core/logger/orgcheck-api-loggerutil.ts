export class LoggerUtil {
    public static JSONstringifyWithoutRef(json: any): string {
        if (json) {
            try {
                return JSON.stringify(json, (k: string, v: any) => ( k.endsWith('Ref') ? undefined : v ))
            } catch (error) {
                return json.toString() ?? '';
            }
        }
        return '';
    }
    public static MapToArraysWithoutRef(map: Map<string, any>) {
        return Array.from(map.entries()).filter(t => t[0]?.endsWith('Ref') === false)
    }
}