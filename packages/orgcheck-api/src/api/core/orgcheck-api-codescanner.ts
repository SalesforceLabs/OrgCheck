const REGEX_APEXCODE_ISINTERFACE = new RegExp("(?:public|global)\\s+(?:interface)\\s+\\w+(\\s+(?:extends)\\s+\\w+)?\\s*\\{", 'i');
const REGEX_APEXCODE_ISENUM = new RegExp("(?:public|global)\\s+(?:enum)\\s+\\w+\\s*\\{", 'i');
const REGEX_APEXCODE_ISTESTSEEALLDATA = new RegExp("@IsTest\\s*\\(.*SeeAllData=true.*\\)", 'i');
const REGEX_APEXCODE_TESTNBASSERTS = new RegExp("(System.assert(Equals|NotEquals|)\\s*\\(|Assert\\.[a-zA-Z]*\\s*\\()", 'ig');
const REGEX_APEXCODE_HASSOQL = new RegExp("\\[\\s*(?:SELECT|FIND)");
const REGEX_APEXCODE_HASDML = new RegExp("\\b(?:insert|update|delete)\\s*(?:\\s\\w+|\\(|\\[)");
const REGEX_ALLCODE_COMMENTS_AND_NEWLINES = new RegExp('(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/.*\\n|\\/\\/[^\\n]*|\\n)', 'gi');
const REGEX_XML_COMMENTS_AND_NEWLINES = new RegExp('(<!--[\\s\\S]*?-->|\\n)', 'gi');
const REGEX_HARDCODEDURLS = new RegExp("([A-Za-z0-9-]{1,63}\\.)+[A-Za-z]{2,6}", 'ig');
const REGEX_HARDCODEDIDS = new RegExp("[,\"'\\s][a-zA-Z0-9]{5}0[a-zA-Z0-9]{9}([a-zA-Z0-9]{3})?[,\"'\\s]", 'ig');
const SALESFORCE_DOMAINS = [ 'salesforce.com', '.force.' ];
const SALESFORCE_MY_DOMAIN = '.my.salesforce.com';

/**
 * @description Code Scanner class
 */ 
export class CodeScanner {

    /**
     * @description Remove comments from a source code in Javascript, Apex, or any other language that uses similar comment syntax.
     * @param {string} sourceCode - the source code to remove comments from.
     * @returns {string} Returns the source code without comments and new lines.
     * @public
     * @static
     */
    static RemoveCommentsFromCode(sourceCode: string): string {
        return sourceCode?.replaceAll(REGEX_ALLCODE_COMMENTS_AND_NEWLINES, ' ') || '';
    }

    /**
     * @description Remove comments from a source code in XML, HTML, or any other language that uses similar comment syntax.
     * @param {string} sourceCode - the source code to remove comments from.
     * @returns {string} Returns the source code without comments and new lines.
     * @public
     * @static
     */
    static RemoveCommentsFromXML(sourceCode: string): string {
        return sourceCode?.replaceAll(REGEX_XML_COMMENTS_AND_NEWLINES, ' ') || '';
    }

    /**
     * @description Check if the given source code is an interface in Apex code.
     * @param {string} sourceCode - the source code to check.
     * @returns {boolean} Returns true if the source code is an interface in Apex code, false otherwise.
     * @public
     * @static
     */
    static IsInterfaceFromApexCode(sourceCode: string): boolean {
        return sourceCode?.match(REGEX_APEXCODE_ISINTERFACE) !== null || false;
    }

    /**
     * @description Check if the given source code is an enum in Apex code.
     * @param {string} sourceCode - the source code to check.
     * @returns {boolean} Returns true if the source code is an enum in Apex code, false otherwise.
     * @public
     * @static
     */
    static IsEnumFromApexCode(sourceCode: string): boolean {
        return sourceCode?.match(REGEX_APEXCODE_ISENUM) !== null || false;
    }

    /**
     * @description Find hard-coded URLs in the given source code.
     * @param {string} sourceCode - the source code to search for hard-coded URLs.
     * @returns {Array<string>} Returns an array of hard-coded URLs found in the source code.
     * @public
     * @static
     */
    static FindHardCodedURLs(sourceCode: string): string[] {
        return sourceCode?.match(REGEX_HARDCODEDURLS) // extract the domains
            ?.filter((domain) => SALESFORCE_DOMAINS.findIndex((sfdomain) => domain.indexOf(sfdomain) >= 0) >= 0)  // filter only the salesforce domains
            .sort() // sorting the domains (if any)
            .filter((e, i, s) => i === s.indexOf(e)) // unique domains
            .filter((domain) => domain.indexOf(SALESFORCE_MY_DOMAIN) < 0) // remove the my.salesforce.com domains
            ?? []; // return an empty array if undefined
    }

    /**
     * @description Find hard-coded Salesforce IDs in the given source code.
     * @param {string} sourceCode - the source code to search for hard-coded Salesforce IDs.
     * @returns {Array<string>} Returns an array of hard-coded Salesforce IDs found in the source code.
     * @public
     * @static
     */
    static FindHardCodedIDs(sourceCode: string): string[] {
        return sourceCode?.match(REGEX_HARDCODEDIDS) // extract the salesforce ids
            ?.map(id => id?.substring(1, id?.length-1)) // remove the surrounding quotes or so
            .sort() // sorting the domains (if any)
            .filter((e, i, s) => i === s.indexOf(e)) // unique domains
            || []; // empty array if no ids found
    }

    /**
     * @description Check if the given source code is an Apex test class that has the @IsTest(SeeAllData=true) annotation.
     * @param {string} sourceCode - the source code to check.
     * @returns {boolean} Returns true if the source code is an Apex test class with the @IsTest(SeeAllData=true) annotation, false otherwise.
     * @public
     * @static
     */
    static IsTestSeeAllDataFromApexCode(sourceCode: string): boolean {
        return sourceCode?.match(REGEX_APEXCODE_ISTESTSEEALLDATA) !== null || false;
    }

    /**
     * @description Count the number of asserts in an Apex test class source code.
     * @param {string} sourceCode - the source code of the Apex test class to analyze.
     * @returns {number} Returns the number of asserts found in the Apex test class source code.
     * @public
     * @static
     */
    static CountOfAssertsFromApexCode(sourceCode: string): number {
        return sourceCode?.match(REGEX_APEXCODE_TESTNBASSERTS)?.length || 0;
    }

    /**
     * @description Check if the given source code contains SOQL queries.
     * @param {string} sourceCode - the source code to check.
     * @returns {boolean} Returns true if the source code contains SOQL queries, false otherwise.
     * @public
     * @static
     */
    static HasSOQLFromApexCode(sourceCode: string): boolean {
        return sourceCode?.match(REGEX_APEXCODE_HASSOQL) !== null || false; 
    }

    /**
     * @description Check if the given source code contains DML operations.
     * @param {string} sourceCode - the source code to check.
     * @returns {boolean} Returns true if the source code contains DML operations, false otherwise.
     * @public
     * @static
     */
    static HasDMLFromApexCode(sourceCode: string): boolean {
        return sourceCode?.match(REGEX_APEXCODE_HASDML) !== null || false;
    }
}