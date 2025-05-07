const REGEX_COMMENTS_AND_NEWLINES = new RegExp('(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/.*\\n|\\/\\/[^\\n]*|\\n)', 'gi');
const REGEX_ISINTERFACE = new RegExp("(?:public|global)\\s+(?:interface)\\s+\\w+(\\s+(?:extends)\\s+\\w+)?\\s*\\{", 'i');
const REGEX_ISENUM = new RegExp("(?:public|global)\\s+(?:enum)\\s+\\w+\\s*\\{", 'i');
const REGEX_ISTESTSEEALLDATA = new RegExp("@IsTest\\s*\\(.*SeeAllData=true.*\\)", 'i');
const REGEX_TESTNBASSERTS = new RegExp("(System.assert(Equals|NotEquals|)\\s*\\(|Assert\\.[a-zA-Z]*\\s*\\()", 'ig');
const REGEX_HARDCODEDURLS = new RegExp("([A-Za-z0-9-]{1,63}\\.)+[A-Za-z]{2,6}", 'ig');
const REGEX_HARDCODEDIDS = new RegExp("[,\"'\\s][a-zA-Z0-9]{5}0[a-zA-Z0-9]{9}([a-zA-Z0-9]{3})?[,\"'\\s]", 'ig');
const REGEX_HASSOQL = new RegExp("\\[\\s*(?:SELECT|FIND)");
const REGEX_HASDML = new RegExp("(?:insert|update|delete)\\s*(?:\\s\\w+|\\(|\\[)");
const SALESFORCE_DOMAINS = [ 'salesforce.com', '.force.' ];
const SALESFORCE_MY_DOMAIN = '.my.salesforce.com';

/**
 * @description Code Scanner class
 */ 
export class CodeScanner {

    static RemoveComments(sourceCode) {
        return sourceCode?.replaceAll(REGEX_COMMENTS_AND_NEWLINES, ' ') || '';
    }

    static IsInterface(sourceCode) {
        return sourceCode?.match(REGEX_ISINTERFACE) !== null || false;
    }

    static IsEnum(sourceCode) {
        return sourceCode?.match(REGEX_ISENUM) !== null || false;
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

    static IsTestSeeAllData(sourceCode) {
        return sourceCode?.match(REGEX_ISTESTSEEALLDATA) !== null || false;
    }

    static CountOfAsserts(sourceCode) {
        return sourceCode?.match(REGEX_TESTNBASSERTS)?.length || 0;
    }

    static HasSOQL(sourceCode) {
        return sourceCode?.match(REGEX_HASSOQL) !== null || false; 
    }

    static HasDML(sourceCode) {
        return sourceCode?.match(REGEX_HASDML) !== null || false;
    }
}