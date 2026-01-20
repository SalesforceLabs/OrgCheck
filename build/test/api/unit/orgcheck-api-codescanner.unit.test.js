import { CodeScanner } from "../../../src/api/core/orgcheck-api-codescanner";

describe('tests.api.unit.CodeScanner', () => {

  describe('Test the feature "RemoveComments"', () => {

    it('checks if removing comments from an empty source code is an empty string', () => {
      expect(CodeScanner.RemoveCommentsFromCode(null)).toBe('')
      expect(CodeScanner.RemoveCommentsFromCode(undefined)).toBe('')
      expect(CodeScanner.RemoveCommentsFromCode('')).toBe('');
    });

    it('checks if removing comments from a source code without comments is the same', () => {
      expect(CodeScanner.RemoveCommentsFromCode('abcdef')).toBe('abcdef');
      expect(CodeScanner.RemoveCommentsFromCode('oiu /* oiuuui')).toBe('oiu /* oiuuui')
      expect(CodeScanner.RemoveCommentsFromCode('oiu / * oiuuui')).toBe('oiu / * oiuuui')
      expect(CodeScanner.RemoveCommentsFromCode('oiu */ oiuuui')).toBe('oiu */ oiuuui')
      expect(CodeScanner.RemoveCommentsFromCode('oiu * / oiuuui')).toBe('oiu * / oiuuui')
      expect(CodeScanner.RemoveCommentsFromCode('oiu / / oiuuui')).toBe('oiu / / oiuuui');
    });
    
    it('checks if removing comments from a source code with comments works', () => {
      expect(CodeScanner.RemoveCommentsFromCode('line1\nline2\n/*This is a comment*/line3\n')).toBe('line1 line2  line3 ');
      expect(CodeScanner.RemoveCommentsFromCode('line1\nline2\n/*This is a comment*/line3')).toBe('line1 line2  line3');
      expect(CodeScanner.RemoveCommentsFromCode('line1\nline2\n/*This is a comment*/')).toBe('line1 line2  ');
      expect(CodeScanner.RemoveCommentsFromCode('line1-part1/*This is a comment*/line1-part2\n')).toBe('line1-part1 line1-part2 ');
      expect(CodeScanner.RemoveCommentsFromCode('line1-part1/*This is a comment*/line1-part2')).toBe('line1-part1 line1-part2');
      expect(CodeScanner.RemoveCommentsFromCode('line1\n// This is a comment\nline2\n')).toBe('line1  line2 ');
      expect(CodeScanner.RemoveCommentsFromCode('line1\n// This is a comment\nline2')).toBe('line1  line2');
      expect(CodeScanner.RemoveCommentsFromCode('line1\n// This is a comment\n')).toBe('line1  ');
      expect(CodeScanner.RemoveCommentsFromCode('line1\n// This is a comment')).toBe('line1  ');
    });

  });

  describe('Test the feature "IsInterface"', () => {

    it('checks if the source code is an interface', () => {
      expect(CodeScanner.IsInterfaceFromApexCode('public interface MyInterface {')).toBe(true);
      expect(CodeScanner.IsInterfaceFromApexCode('global interface MyInterface {')).toBe(true);
      expect(CodeScanner.IsInterfaceFromApexCode('public interface MyInterface extends MySuperInterface {')).toBe(true);
      expect(CodeScanner.IsInterfaceFromApexCode('global interface MyInterface extends MySuperInterface {')).toBe(true);
      expect(CodeScanner.IsInterfaceFromApexCode('public class MyClass {')).toBe(false);
      expect(CodeScanner.IsInterfaceFromApexCode('global class MyClass {')).toBe(false);
      expect(CodeScanner.IsInterfaceFromApexCode('public enum MyEnum {')).toBe(false);
      expect(CodeScanner.IsInterfaceFromApexCode('global enum MyEnum {')).toBe(false);
    });    
  });

  describe('Test the feature "IsEnum"', () => {

    it('checks if the source code is an enum', () => {
      expect(CodeScanner.IsEnumFromApexCode('public enum MyEnum {')).toBe(true);
      expect(CodeScanner.IsEnumFromApexCode('global enum MyEnum {')).toBe(true);
      expect(CodeScanner.IsEnumFromApexCode('public class MyClass {')).toBe(false);
      expect(CodeScanner.IsEnumFromApexCode('global class MyClass {')).toBe(false);
      expect(CodeScanner.IsEnumFromApexCode('public interface MyInterface {')).toBe(false);
      expect(CodeScanner.IsEnumFromApexCode('global interface MyInterface {')).toBe(false);
    });
  });

  describe('Test the feature "FindHardCodedURLs"', () => {

    it('checks if a source code with some url but not from salesforce is ok', () => {
      const hardCodedUrls = CodeScanner.FindHardCodedURLs('String url = "https://www.google.com"; String url2 = "https://www.apple.com";');
      expect(hardCodedUrls).toBeDefined();
      expect(hardCodedUrls.length).toBe(0);
    });

    it('checks if a source code without url is ok', () => {
      const hardCodedUrls = CodeScanner.FindHardCodedURLs('String url = "abc"; String url2 = "xyz.cte";');
      expect(hardCodedUrls).toBeDefined();
      expect(hardCodedUrls.length).toBe(0);
    });

    it('checks if the hard coded url is detected in a code that contains only one sfdc url', () => {
      const hardCodedUrls = CodeScanner.FindHardCodedURLs('String url = "https://www.salesforce.com";');
      expect(hardCodedUrls).toBeDefined();
      expect(hardCodedUrls.length).toBe(1);
      expect(hardCodedUrls[0]).toBe('www.salesforce.com');
    });

    it('checks if the hard coded url is detected in a code that contains only one sfdc url with instance', () => {
      const hardCodedUrls = CodeScanner.FindHardCodedURLs('String url = "https://na1.salesforce.com";');
      expect(hardCodedUrls).toBeDefined();
      expect(hardCodedUrls.length).toBe(1);
      expect(hardCodedUrls[0]).toBe('na1.salesforce.com');
    });

    it('checks if the hard coded url is NOT detected in a code that contains only one sfdc my-domain url', () => {
      const hardCodedUrls = CodeScanner.FindHardCodedURLs('String url = "https://orgcheck.my.salesforce.com";');
      expect(hardCodedUrls).toBeDefined();
      expect(hardCodedUrls.length).toBe(0);
    });

    it('checks if the hard coded url is detected in a code that contains two sfdc urls', () => {
      const hardCodedUrls = CodeScanner.FindHardCodedURLs('String url1 = "https://www.salesforce.com"; String url2 = "https://na1.salesforce.com";');
      expect(hardCodedUrls).toBeDefined();
      expect(hardCodedUrls.length).toBe(2);
      expect(hardCodedUrls[0]).toBe('na1.salesforce.com'); // array is alphabetically sorted!!
      expect(hardCodedUrls[1]).toBe('www.salesforce.com');
    });

    it('checks if the hard coded url is detected in a code that contains two sfdc urls the first one being a my domain', () => {
      const hardCodedUrls = CodeScanner.FindHardCodedURLs('String url1 = "https://orgcheck.my.salesforce.com"; String url2 = "https://na1.salesforce.com";');
      expect(hardCodedUrls).toBeDefined();
      expect(hardCodedUrls.length).toBe(1);
      expect(hardCodedUrls[0]).toBe('na1.salesforce.com');
    });

    it('checks if the hard coded url is detected in a code that contains two sfdc urls the second one being a my domain', () => {
      const hardCodedUrls = CodeScanner.FindHardCodedURLs('String url1 = "https://www.salesforce.com"; String url2 = "https://orgcheck.my.salesforce.com";');
      expect(hardCodedUrls).toBeDefined();
      expect(hardCodedUrls.length).toBe(1);
      expect(hardCodedUrls[0]).toBe('www.salesforce.com');
    });

    it('checks if the hard coded url is detected in a code that contains multiple urls with one force domain and on salesforce domain', () => {
      const hardCodedUrls = CodeScanner.FindHardCodedURLs('String url1 = "https://abc.force.com"; String url2 = "https://www.salesforce.com";');
      expect(hardCodedUrls).toBeDefined();
      expect(hardCodedUrls.length).toBe(2);
      expect(hardCodedUrls[0]).toBe('abc.force.com');
      expect(hardCodedUrls[1]).toBe('www.salesforce.com');
    });
  });

  describe('Test the feature "FindHardCodedIDs"', () => {

    it('checks if the hard coded id is detected in a code that contains only one sfdc id 18', () => {
      const hardCodedIds = CodeScanner.FindHardCodedIDs('Id id1 = "500W100000HweDCIAZ";');
      expect(hardCodedIds).toBeDefined();
      expect(hardCodedIds.length).toBe(1);
      expect(hardCodedIds[0]).toBe('500W100000HweDCIAZ');
    });

    it('checks if the hard coded id is detected in a code that contains the same sfdc id 18 multiple times', () => {
      const hardCodedIds = CodeScanner.FindHardCodedIDs('Id id1 = "500W100000HweDCIAZ"; String id2 = "toto/500W100000HweDCIAZ/tyuu";');
      expect(hardCodedIds).toBeDefined();
      expect(hardCodedIds.length).toBe(1);
      expect(hardCodedIds[0]).toBe('500W100000HweDCIAZ');
    });

    it('checks if the hard coded id is detected in a code that contains only one sfdc id 15', () => {
      const hardCodedIds = CodeScanner.FindHardCodedIDs('Id id1 = "500W100000HweDC";');
      expect(hardCodedIds).toBeDefined();
      expect(hardCodedIds.length).toBe(1);
      expect(hardCodedIds[0]).toBe('500W100000HweDC');
    });

    it('checks if the hard coded id is detected in a code that contains the same sfdc id 15 multiple times', () => {
      const hardCodedIds = CodeScanner.FindHardCodedIDs('Id id1 = "500W100000HweDC"; String id2 = "toto/500W100000HweDC/tyuu";');
      expect(hardCodedIds).toBeDefined();
      expect(hardCodedIds.length).toBe(1);
      expect(hardCodedIds[0]).toBe('500W100000HweDC');
    });

    it('checks if we dont detect strings with 18 and [a-Z0-9] but are not salesforce id!', () => {
      const hardCodedIds = CodeScanner.FindHardCodedIDs('Id id1 = "azerfgthyujvkindhc"; String id2 = "iuzrt5§Tygsbzv0";');
      expect(hardCodedIds).toBeDefined();
      expect(hardCodedIds.length).toBe(0);
    });
  });

  describe('Test the feature "IsTestSeeAllData"', () => {

    it('checks if the source code is a test class with seeAllData annotation', () => {
      expect(CodeScanner.IsTestSeeAllDataFromApexCode('@IsTest(SeeAllData=true)')).toBe(true);
      expect(CodeScanner.IsTestSeeAllDataFromApexCode('@istest(SeeAllData=true)')).toBe(true);
      expect(CodeScanner.IsTestSeeAllDataFromApexCode('@isTest(SeeAllData=false)')).toBe(false);
      expect(CodeScanner.IsTestSeeAllDataFromApexCode('@istest(seealldata=true)')).toBe(true);
      expect(CodeScanner.IsTestSeeAllDataFromApexCode('@isTest(seealldata=false)')).toBe(false);
    });
  });

  describe('Test the feature "CountOfAsserts"', () => {

    it('counts the number of asserts found in a code', () => {
      const numberOfAsserts = CodeScanner.CountOfAssertsFromApexCode('System.Assert.areEqual(true, true);\nSystem.assertEquals(true, true);\nSystem.assertNotEquals(true, false);\nSystem.assert(false);\n');
      expect(numberOfAsserts).toBeDefined();
      expect(numberOfAsserts).toBe(4);
    });
  });

  describe('Test the feature "HasSOQL"', () => {

    it('checks if the source code contains a soql query', () => {
      const hasSOQL = CodeScanner.HasSOQLFromApexCode('List<Account> list = [SELECT Id, Name FROM Account WHERE Name = "MyAccount"];'); 
      expect(hasSOQL).toBeDefined();
      expect(hasSOQL).toBe(true);
    });
  });

  describe('Test the feature "HasDML"', () => {

    it('checks if the source code contains a DML statement', () => {
      const hasDML = CodeScanner.HasDMLFromApexCode('insert new Account(Name="MyAccount");');
      expect(hasDML).toBeDefined();
      expect(hasDML).toBe(true);
    });

    it('checks if the source code contains a DML update statement', () => {
      expect(CodeScanner.HasDMLFromApexCode('update accounts;')).toBe(true);
    });

    it('checks if the source code contains a DML delete statement', () => {
      expect(CodeScanner.HasDMLFromApexCode('delete accounts;')).toBe(true);
    });

    it('checks if Database.insert is detected as DML', () => {
      expect(CodeScanner.HasDMLFromApexCode('Database.insert(accounts);')).toBe(true);
    });

    it('checks if Database.update is detected as DML', () => {
      expect(CodeScanner.HasDMLFromApexCode('Database.update(accounts);')).toBe(true);
    });

    it('checks if Database.delete is detected as DML', () => {
      expect(CodeScanner.HasDMLFromApexCode('Database.delete(accounts);')).toBe(true);
    });

    it('checks if trigger handler methods are NOT detected as DML (false positive fix)', () => {
      // This is a trigger that delegates to a handler - no actual DML in this code
      const triggerCode = `trigger crm_AccountTrigger on Account (before insert, before update, before delete, after insert, after update, after delete, after undelete) {
        crm_AccountTriggerHandler accountTriggerHandler = new crm_AccountTriggerHandler();
        if (Trigger.isBefore && Trigger.isInsert) {
            accountTriggerHandler.beforeInsert(Trigger.new);
        }
        if (Trigger.isBefore && Trigger.isUpdate) {
            accountTriggerHandler.beforeUpdate(Trigger.old, Trigger.new, Trigger.oldMap, Trigger.newMap);
        }
        if (Trigger.isBefore && Trigger.isDelete) {
            accountTriggerHandler.beforeDelete(Trigger.old, Trigger.oldMap);
        }
        if (Trigger.isAfter && Trigger.isInsert) {
            accountTriggerHandler.afterInsert(Trigger.new, Trigger.newMap);
        }
        if (Trigger.isAfter && Trigger.isUpdate) {
            accountTriggerHandler.afterUpdate(Trigger.old, Trigger.new, Trigger.oldMap, Trigger.newMap);
        }
        if (Trigger.isAfter && Trigger.isDelete) {
            accountTriggerHandler.afterDelete(Trigger.old, Trigger.oldMap);
        }
        if (Trigger.isAfter && Trigger.isUndelete) {
            accountTriggerHandler.afterUndelete(Trigger.new, Trigger.newMap);
        }
      }`;
      expect(CodeScanner.HasDMLFromApexCode(triggerCode)).toBe(false);
    });

    it('checks that method names containing insert/update/delete keywords are NOT detected as DML', () => {
      expect(CodeScanner.HasDMLFromApexCode('handler.beforeInsert(records);')).toBe(false);
      expect(CodeScanner.HasDMLFromApexCode('handler.afterInsert(records);')).toBe(false);
      expect(CodeScanner.HasDMLFromApexCode('handler.beforeUpdate(records);')).toBe(false);
      expect(CodeScanner.HasDMLFromApexCode('handler.afterUpdate(records);')).toBe(false);
      expect(CodeScanner.HasDMLFromApexCode('handler.beforeDelete(records);')).toBe(false);
      expect(CodeScanner.HasDMLFromApexCode('handler.afterDelete(records);')).toBe(false);
    });

    it('checks if code with no DML returns false', () => {
      expect(CodeScanner.HasDMLFromApexCode('String s = "hello";')).toBe(false);
      expect(CodeScanner.HasDMLFromApexCode('Account a = new Account();')).toBe(false);
    });
  });

});