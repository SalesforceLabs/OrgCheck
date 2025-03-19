const REGEX_COMMENTS_AND_NEWLINES = new RegExp('(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/.*\\n|\\n)', 'gi');
const REGEX_ISINTERFACE = new RegExp("(?:public|global)\\s+(?:interface)\\s+\\w+(\\s+(?:extends)\\s+\\w+)?\\s*\\{", 'i');
const REGEX_ISENUM = new RegExp("(?:public|global)\\s+(?:enum)\\s+\\w+\\s*\\{", 'i');
const REGEX_ISTESTSEEALLDATA = new RegExp("@IsTest\\s*\\(.*SeeAllData=true.*\\)", 'i');
const REGEX_TESTNBASSERTS = new RegExp("(System.assert(Equals|NotEquals|)\\s*\\(|Assert\\.[a-zA-Z]*\\s*\\()", 'ig');
const REGEX_HARDCODEDURLS = new RegExp("(\\.salesforce\\.com|\\.force\\.)", 'ig');
const REGEX_HARDCODEDIDS = new RegExp("[a-zA-Z0-9]{5}0[a-zA-Z0-9]{9}([a-zA-Z0-9]{3})?", 'ig');
const REGEX_HASSOQL = new RegExp("\\[\\s*(?:SELECT|FIND)");
const REGEX_HASDML = new RegExp("(?:insert|update|delete)\\s*(?:\\s\\w+|\\(|\\[)");

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

    static CountOfHardCodedURLs(sourceCode) {
        return sourceCode?.match(REGEX_HARDCODEDURLS)?.length || 0;
    }

    static CountOfHardCodedIDs(sourceCode) {
        return sourceCode?.match(REGEX_HARDCODEDIDS)?.length || 0;
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