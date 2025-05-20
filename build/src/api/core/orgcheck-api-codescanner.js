const REGEX_APEXCODE_ISINTERFACE = new RegExp("(?:public|global)\\s+(?:interface)\\s+\\w+(\\s+(?:extends)\\s+\\w+)?\\s*\\{", 'i');
const REGEX_APEXCODE_ISENUM = new RegExp("(?:public|global)\\s+(?:enum)\\s+\\w+\\s*\\{", 'i');
const REGEX_APEXCODE_ISTESTSEEALLDATA = new RegExp("@IsTest\\s*\\(.*SeeAllData=true.*\\)", 'i');
const REGEX_APEXCODE_TESTNBASSERTS = new RegExp("(System.assert(Equals|NotEquals|)\\s*\\(|Assert\\.[a-zA-Z]*\\s*\\()", 'ig');
const REGEX_APEXCODE_HASSOQL = new RegExp("\\[\\s*(?:SELECT|FIND)");
const REGEX_APEXCODE_HASDML = new RegExp("(?:insert|update|delete)\\s*(?:\\s\\w+|\\(|\\[)");
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

    static RemoveCommentsFromCode(sourceCode) {
        return sourceCode?.replaceAll(REGEX_ALLCODE_COMMENTS_AND_NEWLINES, ' ') || '';
    }

    static RemoveCommentsFromXML(sourceCode) {
        return sourceCode?.replaceAll(REGEX_XML_COMMENTS_AND_NEWLINES, ' ') || '';
    }

    static IsInterfaceFromApexCode(sourceCode) {
        return sourceCode?.match(REGEX_APEXCODE_ISINTERFACE) !== null || false;
    }

    static IsEnumFromApexCode(sourceCode) {
        return sourceCode?.match(REGEX_APEXCODE_ISENUM) !== null || false;
    }

    static FindHardCodedURLs(sourceCode) {
        return sourceCode?.match(REGEX_HARDCODEDURLS) // extract the domains
            ?.filter((domain) => SALESFORCE_DOMAINS.findIndex((sfdomain) => domain.indexOf(sfdomain) >= 0) >= 0)  // filter only the salesforce domains
            .sort() // sorting the domains (if any)
            .filter((e, i, s) => i === s.indexOf(e)) // unique domains
            .filter((domain) => domain.indexOf(SALESFORCE_MY_DOMAIN) < 0); // remove the my.salesforce.com domains
    }

    static FindHardCodedIDs(sourceCode) {
        return sourceCode?.match(REGEX_HARDCODEDIDS) // extract the salesforce ids
            ?.map(id => id?.substring(1, id?.length-1)) // remove the surrounding quotes or so
            .sort() // sorting the domains (if any)
            .filter((e, i, s) => i === s.indexOf(e)) // unique domains
            || []; // empty array if no ids found
    }

    static IsTestSeeAllDataFromApexCode(sourceCode) {
        return sourceCode?.match(REGEX_APEXCODE_ISTESTSEEALLDATA) !== null || false;
    }

    static CountOfAssertsFromApexCode(sourceCode) {
        return sourceCode?.match(REGEX_APEXCODE_TESTNBASSERTS)?.length || 0;
    }

    static HasSOQLFromApexCode(sourceCode) {
        return sourceCode?.match(REGEX_APEXCODE_HASSOQL) !== null || false; 
    }

    static HasDMLFromApexCode(sourceCode) {
        return sourceCode?.match(REGEX_APEXCODE_HASDML) !== null || false;
    }
}