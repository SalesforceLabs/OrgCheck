import { DataWithDependencies } from './orgcheck-api-data';
import { ScoreRule } from './orgcheck-api-datafactory';
import { SFDC_ApexClass } from '../data/orgcheck-api-data-apexclass';
import { SFDC_ApexTrigger } from '../data/orgcheck-api-data-apextrigger';
import { SFDC_Browser } from '../data/orgcheck-api-data-browser';
import { SFDC_CollaborationGroup } from '../data/orgcheck-api-data-collaborationgroup';
import { SFDC_CustomLabel } from '../data/orgcheck-api-data-customlabel';
import { SFDC_CustomTab } from '../data/orgcheck-api-data-customtab';
import { SFDC_Dashboard } from '../data/orgcheck-api-data-dashboard';
import { SFDC_Document } from '../data/orgcheck-api-data-document';
import { SFDC_EmailTemplate } from '../data/orgcheck-api-data-emailtemplate';
import { SFDC_Field } from '../data/orgcheck-api-data-field';
import { SFDC_FieldSet } from '../data/orgcheck-api-data-fieldset';
import { SFDC_Flow } from '../data/orgcheck-api-data-flow';
import { SFDC_Group } from '../data/orgcheck-api-data-group';
import { SFDC_HomePageComponent } from '../data/orgcheck-api-data-homepagecomponent';
import { SFDC_KnowledgeArticle } from '../data/orgcheck-api-data-knowledgearticle';
import { SFDC_LightningAuraComponent } from '../data/orgcheck-api-data-lightningauracomponent';
import { SFDC_LightningPage } from '../data/orgcheck-api-data-lightningpage';
import { SFDC_LightningWebComponent } from '../data/orgcheck-api-data-lightningwebcomponent';
import { SFDC_Limit } from '../data/orgcheck-api-data-limit';
import { SFDC_Object } from '../data/orgcheck-api-data-object';
import { SFDC_PageLayout } from '../data/orgcheck-api-data-pagelayout';
import { SFDC_PermissionSet } from '../data/orgcheck-api-data-permissionset';
import { SFDC_PermissionSetLicense } from '../data/orgcheck-api-data-permissionsetlicense';
import { SFDC_Profile } from '../data/orgcheck-api-data-profile';
import { SFDC_ProfilePasswordPolicy } from '../data/orgcheck-api-data-profilepasswordpolicy';
import { SFDC_ProfileRestrictions } from '../data/orgcheck-api-data-profilerestrictions';
import { SFDC_RecordType } from '../data/orgcheck-api-data-recordtype';
import { SFDC_Report } from '../data/orgcheck-api-data-report';
import { SFDC_StaticResource } from '../data/orgcheck-api-data-staticresource';
import { SFDC_User } from '../data/orgcheck-api-data-user';
import { SFDC_UserRole } from '../data/orgcheck-api-data-userrole';
import { SFDC_ValidationRule } from '../data/orgcheck-api-data-validationrule';
import { SFDC_VisualForceComponent } from '../data/orgcheck-api-data-visualforcecomponent';
import { SFDC_VisualForcePage } from '../data/orgcheck-api-data-visualforcepage';
import { SFDC_WebLink } from '../data/orgcheck-api-data-weblink';
import { SFDC_Workflow } from '../data/orgcheck-api-data-workflow.js';

/**
 * @description Checks if the difference bewteen the given current version and the api version is more than three years (or more if specified)
 * @param {any} currentVersion - Version set for a specific item like VFP, apex class, etc.
 * @param {any} version - Version used by the api (should be the latest)
 * @param {number} [definition_of_old] - Definition of "old" in years (three years by default)
 * @returns {boolean} true if the given current version is said too old, false otherwise.
 * @private
 */
const IS_OLD_APIVERSION = (currentVersion, version, definition_of_old = 3) => { 
    if (version && currentVersion && definition_of_old) return ((currentVersion - version) / 3) >= definition_of_old; 
    return false;
}

/**
 * @description Checks if a given value is "empty". The value can be a string or an Array.
 * @param {Array<any> | string} value - Any value to check
 * @returns {boolean} true if the value is empty. false otherwise
 * @private
 */
const IS_EMPTY = (value) => {
    // In case we have a numerial value as input
    if (typeof value === 'number' && value === 0) return false;
    // if the value is undefined or null --> it's EMPTY!
    if (!value) return true;
    // length is a property both used in Array and string. Obviously if the length is zero --> it's EMPTY!
    if (value.length === 0) return true;
    // sometimes a string contains only spaces and we want to consider this as empty as well.
    // only if the value is a string, use trim() to get rid of the spaces on the left and right, and check the final length
    if (typeof value === 'string' && value.trim().length === 0) return true;
    // return false otherwise.
    return false;
}

/**
 * @description Get the latest API version a Salesforce org can handle (exception for sandboxes that are in preview mode)
 * @returns {number} Get the lastest API version
 * @private
 */ 
const GET_LATEST_API_VERSION = () => {
    const TODAY = new Date();
    const THIS_YEAR = TODAY.getFullYear();
    const THIS_MONTH = TODAY.getMonth()+1;
    return 3*(THIS_YEAR-2022)+53+(THIS_MONTH<=2?0:(THIS_MONTH<=6?1:(THIS_MONTH<=10?2:3)));
}

/**
 * @description Categories for each rule
 * @private
 */
const SCORE_RULE_CATEGORIES = {
    DEPENDENCY: 'Dependencies',
    HARDCODED_URL: 'Hard-coded URLs',
    HARDCODED_ID: 'Hard-coded IDs',
    API_VERSION: 'API Version',
    CODE_QUALITY: 'Code Quality',
    DOCUMENTATION: 'Documentation',
    USER_ADOPTION: 'User Adoption',
    SECURITY: 'Security',
    OVERUSE: 'Overuse',
    USELESS: 'Useless'
}

/**
 * @description List of score rules
 * @type {Array<ScoreRule>}
 * @private
 */
const ALL_SCORE_RULES = [
    // IMPORTANT NOTE:
    // ScoreRule ids are explicitly hard coded in the following list. 
    // This is by choice and design. ;)
    // Why? To make sure from one version to the other, the same rule id is not used for another rule...
    // So please continue to increment IDs values and ADD NEW RULES AT THE END of the array !!
    { 
        id: 0,
        description: 'Not referenced anywhere',
        formula: (/** @type {SFDC_CustomLabel | SFDC_Flow | SFDC_LightningPage | SFDC_LightningAuraComponent | SFDC_LightningWebComponent | SFDC_VisualForceComponent | SFDC_VisualForcePage | SFDC_StaticResource} */ d) => d?.dependencies?.hadError === false && IS_EMPTY(d.dependencies?.referenced), 
        errorMessage: `This component is not referenced anywhere (as we were told by the Dependency API). Please review the need to keep it in your org.`,
        badField: 'dependencies.referenced.length',
        applicable: [ SFDC_CustomLabel, SFDC_Flow, SFDC_LightningPage, SFDC_LightningAuraComponent, SFDC_LightningWebComponent, SFDC_VisualForceComponent, SFDC_VisualForcePage, SFDC_StaticResource ],
        category: SCORE_RULE_CATEGORIES.DEPENDENCY
    }, {
        id: 1,
        description: 'No reference anywhere for custom field',
        formula: (/** @type {SFDC_Field} */ d) => d?.isCustom === true && d?.dependencies?.hadError === false && IS_EMPTY(d.dependencies?.referenced), 
        errorMessage: `This custom field is not referenced anywhere (as we were told by the Dependency API). Please review the need to keep it in your org.`,
        badField: 'dependencies.referenced.length',
        applicable: [ SFDC_Field ],
        category: SCORE_RULE_CATEGORIES.DEPENDENCY
    }, {
        id: 2,
        description: 'No reference anywhere for apex class',
        formula: (/** @type {SFDC_ApexClass} */ d) => d?.isTest === false && d?.dependencies?.hadError === false && IS_EMPTY(d.dependencies?.referenced), 
        errorMessage: `This apex class is not referenced anywhere (as we were told by the Dependency API). Please review the need to keep it in your org.`,
        badField: 'dependencies.referenced.length',
        applicable: [ SFDC_ApexClass ],
        category: SCORE_RULE_CATEGORIES.DEPENDENCY
    }, {
        id: 3,
        description: 'Sorry, we had an issue with the Dependency API to gather the dependencies of this item',
        formula: (/** @type {DataWithDependencies} */ d) => d?.dependencies && d?.dependencies.hadError === true, 
        errorMessage: `Sorry, we had an issue with the Dependency API to gather the dependencies of this item.`,
        badField: 'dependencies.referenced.length',
        applicable: [ SFDC_Field, SFDC_ApexClass, SFDC_CustomLabel, SFDC_Flow, SFDC_LightningPage, SFDC_LightningAuraComponent, SFDC_LightningWebComponent, SFDC_VisualForceComponent, SFDC_VisualForcePage ],
        category: SCORE_RULE_CATEGORIES.DEPENDENCY
    }, {
        id: 4,
        description: 'API Version too old',
        formula: (/** @type {SFDC_ApexClass | SFDC_ApexTrigger | SFDC_Flow | SFDC_LightningAuraComponent | SFDC_LightningWebComponent | SFDC_VisualForcePage | SFDC_VisualForceComponent | SFDC_EmailTemplate } */ d) => IS_OLD_APIVERSION(SecretSauce.CurrentApiVersion, d?.apiVersion),
        errorMessage: `The API version of this component is too old. Please update it to the newest version.`,
        badField: 'apiVersion',
        applicable: [ SFDC_ApexClass, SFDC_ApexTrigger, SFDC_Flow, SFDC_LightningAuraComponent, SFDC_LightningWebComponent, SFDC_VisualForcePage, SFDC_VisualForceComponent, SFDC_EmailTemplate ],
        category: SCORE_RULE_CATEGORIES.API_VERSION
    }, {
        id: 5,
        description: 'No assertion in this Apex Test',
        formula: (/** @type {SFDC_ApexClass} */ d) => d?.isTest === true && d?.nbSystemAsserts === 0,
        errorMessage: `This apex test does not contain any assertion! Best practices force you to define assertions in tests.`,
        badField: 'nbSystemAsserts',
        applicable: [ SFDC_ApexClass ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 6,
        description: 'No description',
        formula: (/** @type { SFDC_LightningPage | SFDC_LightningAuraComponent | SFDC_LightningWebComponent | SFDC_VisualForcePage | SFDC_VisualForceComponent | SFDC_Workflow | SFDC_WebLink | SFDC_FieldSet | SFDC_ValidationRule | SFDC_Document | SFDC_CustomTab | SFDC_EmailTemplate | SFDC_StaticResource | SFDC_Report | SFDC_Dashboard } */ d) => IS_EMPTY(d?.description),
        errorMessage: `This component does not have a description. Best practices force you to use the Description field to give some informative context about why and how it is used/set/govern.`,
        badField: 'description',
        applicable: [ SFDC_LightningPage, SFDC_LightningAuraComponent, SFDC_LightningWebComponent, SFDC_VisualForcePage, SFDC_VisualForceComponent, SFDC_Workflow, SFDC_WebLink, SFDC_FieldSet, SFDC_ValidationRule, SFDC_Document, SFDC_CustomTab, SFDC_EmailTemplate, SFDC_StaticResource, SFDC_Report, SFDC_Dashboard ],
        category: SCORE_RULE_CATEGORIES.DOCUMENTATION
    }, {
        id: 7,
        description: 'No description for custom component',
        formula: (/** @type {SFDC_Field | SFDC_PermissionSet | SFDC_Profile} */ d) => d?.isCustom === true && IS_EMPTY(d?.description),
        errorMessage: `This custom component does not have a description. Best practices force you to use the Description field to give some informative context about why and how it is used/set/govern.`,
        badField: 'description',
        applicable: [ SFDC_Field, SFDC_PermissionSet, SFDC_Profile ],
        category: SCORE_RULE_CATEGORIES.DOCUMENTATION
    }, {
        id: 8,
        description: 'No explicit sharing in apex class',
        formula: (/** @type {SFDC_ApexClass} */ d) => d?.isTest === false && d?.isClass === true && !d.specifiedSharing,
        errorMessage: `This Apex Class does not specify a sharing model. Best practices force you to specify with, without or inherit sharing to better control the visibility of the data you process in Apex.`,
        badField: 'specifiedSharing',
        applicable: [ SFDC_ApexClass ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 9,
        description: 'Schedulable should be scheduled',
        formula: (/** @type {SFDC_ApexClass} */ d) => d?.isScheduled === false && d?.isSchedulable === true,
        errorMessage: `This Apex Class implements Schedulable but is not scheduled. What is the point? Is this class still necessary?`,
        badField: 'isScheduled',
        applicable: [ SFDC_ApexClass ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 10,
        description: 'Not able to compile class',
        formula: (/** @type {SFDC_ApexClass} */ d) => d?.needsRecompilation === true,
        errorMessage: `This Apex Class can not be compiled for some reason. You should try to recompile it. If the issue remains you need to consider refactoring this class or the classes that it is using.`,
        badField: 'name',
        applicable: [ SFDC_ApexClass ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 11,
        description: 'No coverage for this class',
        formula: (/** @type {SFDC_ApexClass} */ d) => d?.isTest === false && (isNaN(d.coverage) || !d.coverage),
        errorMessage: `This Apex Class does not have any code coverage. Consider launching the corresponding tests that will bring some coverage. If you do not know which test to launch just run them all!`,
        badField: 'coverage',
        applicable: [ SFDC_ApexClass ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 12,
        description: 'Coverage not enough',
        formula: (/** @type {SFDC_ApexClass} */ d) => d?.coverage > 0 && d?.coverage < 0.75,
        errorMessage: `This Apex Class does not have enough code coverage (less than 75% of lines are covered by successful unit tests). Maybe you ran not all the unit tests to cover this class entirely? If you did, then consider augmenting that coverage with new test methods.`,
        badField: 'coverage',
        applicable: [ SFDC_ApexClass ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 13,
        description: 'At least one testing method failed',
        formula: (/** @type {SFDC_ApexClass} */ d) => d?.isTest === true && d?.testFailedMethods && d?.testFailedMethods.length > 0,
        errorMessage: `This Apex Test Class has at least one failed method.`,
        badField: 'testFailedMethods',
        applicable: [ SFDC_ApexClass ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 14,
        description: 'Apex trigger should not contain SOQL statement',
        formula: (/** @type {SFDC_ApexTrigger} */ d) => d?.hasSOQL === true,
        errorMessage: `This Apex Trigger contains at least one SOQL statement. Best practices force you to move any SOQL statement in dedicated Apex Classes that you would call from the trigger. Please update the code accordingly.`,
        badField: 'hasSOQL',
        applicable: [ SFDC_ApexTrigger ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 15,
        description: 'Apex trigger should not contain DML action',
        formula: (/** @type {SFDC_ApexTrigger} */ d) => d?.hasDML === true,
        errorMessage: `This Apex Trigger contains at least one DML action. Best practices force you to move any DML action in dedicated Apex Classes that you would call from the trigger. Please update the code accordingly.`,
        badField: 'hasDML',
        applicable: [ SFDC_ApexTrigger ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 16,
        description: 'Apex Trigger should not contain logic',
        formula: (/** @type {SFDC_ApexTrigger} */ d) => d?.length > 5000,
        errorMessage: `Due to the massive number of source code (more than 5000 characters) in this Apex Trigger, we suspect that it contains logic. Best practices force you to move any logic in dedicated Apex Classes that you would call from the trigger. Please update the code accordingly.`,
        badField: 'length',
        applicable: [ SFDC_ApexTrigger ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 17,
        description: 'No direct member for this group',
        formula: (/** @type {SFDC_Group} */ d) => !d.nbDirectMembers || d?.nbDirectMembers === 0,
        errorMessage: `This public group (or queue) does not contain any direct members (users or sub groups). Is it empty on purpose? Maybe you should review its use in your org...`,
        badField: 'nbDirectMembers',
        applicable: [ SFDC_Group ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 18,
        description: 'Custom profile with no active member',
        formula: (/** @type {SFDC_Profile} */ d) => d?.isCustom === true && d?.memberCounts === 0,
        errorMessage: `This custom profile has no active members. Is it empty on purpose? Maybe you should review its use in your org...`,
        badField: 'memberCounts',
        applicable: [ SFDC_Profile ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 19,
        description: 'Role with no active users',
        formula: (/** @type {SFDC_UserRole} */ d) => d?.activeMembersCount === 0,
        errorMessage: `This role has no active users assigned to it. Is it on purpose? Maybe you should review its use in your org...`,
        badField: 'activeMembersCount',
        applicable: [ SFDC_UserRole ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 20,
        description: 'Active user not under LEX',
        formula: (/** @type {SFDC_User} */ d) => d?.onLightningExperience === false,
        errorMessage: `This user is still using Classic. Time to switch to Lightning for all your users, don't you think?`,
        badField: 'onLightningExperience',
        applicable: [ SFDC_User ],
        category: SCORE_RULE_CATEGORIES.USER_ADOPTION
    }, {
        id: 21,
        description: 'Active user never logged',
        formula: (/** @type {SFDC_User} */ d) => d?.lastLogin === null,
        errorMessage: `This active user has never logged in yet. Time to optimize your licence cost!`,
        badField: 'lastLogin',
        applicable: [ SFDC_User ],
        category: SCORE_RULE_CATEGORIES.USER_ADOPTION
    }, {
        id: 22,
        description: 'Workflow with no action',
        formula: (/** @type {SFDC_Workflow} */ d) => d?.hasAction === false,
        errorMessage: `This workflow has no action, please review it and potentially remove it.`,
        badField: 'hasAction',
        applicable: [ SFDC_Workflow ],
        category: SCORE_RULE_CATEGORIES.DEPENDENCY
    }, {
        id: 23,
        description: 'Workflow with empty time triggered list',
        formula: (/** @type {SFDC_Workflow} */ d) => d?.emptyTimeTriggers.length > 0,
        errorMessage: `This workflow is time triggered but with no time triggered action, please review it.`,
        badField: 'emptyTimeTriggers',
        applicable: [ SFDC_Workflow ],
        category: SCORE_RULE_CATEGORIES.DEPENDENCY
    }, {
        id: 24,
        description: 'Password policy with question containing password!',
        formula: (/** @type {SFDC_ProfilePasswordPolicy} */ d) => d?.passwordQuestion === true,
        errorMessage: `This profile password policy allows you to have a password in the question! Please change that setting as it is clearly a lack of security in your org!`,
        badField: 'passwordQuestion',
        applicable: [ SFDC_ProfilePasswordPolicy ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 25,
        description: 'Password policy with too big expiration',
        formula: (/** @type {SFDC_ProfilePasswordPolicy} */ d) => d?.passwordExpiration > 90,
        errorMessage: `This profile password policy allows you to have a password that expires after 90 days. Please consider having a shorter period of time for expiration if you policy.`,
        badField: 'passwordExpiration',
        applicable: [ SFDC_ProfilePasswordPolicy ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 26,
        description: 'Password policy with no expiration',
        formula: (/** @type {SFDC_ProfilePasswordPolicy} */ d) => d?.passwordExpiration === 0,
        errorMessage: `This profile password policy allows you to have a password that never expires. Why is that? Do you have this profile for technical users? Please reconsider this setting and use JWT authentication instead for technical users.`,
        badField: 'passwordExpiration',
        applicable: [ SFDC_ProfilePasswordPolicy ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 27,
        description: 'Password history too small',
        formula: (/** @type {SFDC_ProfilePasswordPolicy} */ d) => d?.passwordHistory < 3,
        errorMessage: `This profile password policy allows users to set their password with a too-short memory. For example, they can keep on using the same different password every time you ask them to change it. Please increase this setting.`,
        badField: 'passwordHistory',
        applicable: [ SFDC_ProfilePasswordPolicy ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 28,
        description: 'Password minimum size too small',
        formula: (/** @type {SFDC_ProfilePasswordPolicy} */ d) => d?.minimumPasswordLength < 8,
        errorMessage: `This profile password policy allows users to set passwords with less than 8 characters. That minimum length is not strong enough. Please increase this setting.`,
        badField: 'minimumPasswordLength',
        applicable: [ SFDC_ProfilePasswordPolicy ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 29,
        description: 'Password complexity too weak',
        formula: (/** @type {SFDC_ProfilePasswordPolicy} */ d) => d?.passwordComplexity < 3,
        errorMessage: `This profile password policy allows users to set too-easy passwords. The complexity you choose is not strong enough. Please increase this setting.`,
        badField: 'passwordComplexity',
        applicable: [ SFDC_ProfilePasswordPolicy ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 30,
        description: 'No max login attempts set',
        formula: (/** @type {SFDC_ProfilePasswordPolicy} */ d) => d?.maxLoginAttempts === undefined,
        errorMessage: `This profile password policy allows users to try infinitely to log in without locking the access. Please review this setting.`,
        badField: 'passwordExpiration',
        applicable: [ SFDC_ProfilePasswordPolicy ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 31,
        description: 'No lockout period set',
        formula: (/** @type {SFDC_ProfilePasswordPolicy} */ d) => d?.lockoutInterval === undefined,
        errorMessage: `This profile password policy does not set a value for any locked out period. Please review this setting.`,
        badField: 'lockoutInterval',
        applicable: [ SFDC_ProfilePasswordPolicy ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 32,
        description: 'IP Range too large (> 100,000)',
        formula: (/** @type {SFDC_ProfileRestrictions} */ d) => d?.ipRanges.filter(i => i.difference > 100000).length > 0,
        errorMessage: `This profile includes an IP range that is too wide (more than 100,000 IP addresses!). If you set an IP Range it should be not that large. You could split that range into multiple ones. The risk is that you include an IP that is not part of your company. Please review this setting.`,
        badField: 'ipRanges',
        applicable: [ SFDC_ProfileRestrictions ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 33,
        description: 'Login hours too large',
        formula: (/** @type {SFDC_ProfileRestrictions} */ d) => d?.loginHours.filter(i => i.difference > 1200).length > 0,
        errorMessage: `This profile includes a login hour that is too wide (more than 20 hours a day!). If you set a login hour it should reflect reality. Please review this setting.`,
        badField: 'loginHours',
        applicable: [ SFDC_ProfileRestrictions ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 34,
        description: 'Inactive component',
        formula: (/** @type {SFDC_ValidationRule | SFDC_RecordType | SFDC_ApexTrigger | SFDC_Workflow | SFDC_EmailTemplate } */ d) => d?.isActive === false,
        errorMessage: `This component is inactive, so why do not you just remove it from your org?`,
        badField: 'isActive',
        applicable: [ SFDC_ValidationRule, SFDC_RecordType, SFDC_ApexTrigger, SFDC_Workflow, SFDC_EmailTemplate ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 35,
        description: 'No active version for this flow',
        formula: (/** @type {SFDC_Flow} */ d) => d?.isVersionActive === false,
        errorMessage: `This flow does not have an active version, did you forget to activate its latest version? or you do not need that flow anymore?`,
        badField: 'isVersionActive',
        applicable: [ SFDC_Flow ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 36,
        description: 'Too many versions under this flow',
        formula: (/** @type {SFDC_Flow} */ d) => d?.versionsCount > 7,
        errorMessage: `This flow has more than seven versions. Maybe it is time to do some cleaning in this flow!`,
        badField: 'versionsCount',
        applicable: [ SFDC_Flow ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 37,
        description: 'Migrate this process builder',
        formula: (/** @type {SFDC_Flow} */ d) => d?.currentVersionRef?.type === 'Workflow',
        errorMessage: `Time to migrate this process builder to flow!`,
        badField: 'name',
        applicable: [ SFDC_Flow ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 38,
        description: 'No description for the current version of a flow',
        formula: (/** @type {SFDC_Flow} */ d) => IS_EMPTY(d.currentVersionRef?.description),
        errorMessage: `This flow's current version does not have a description. Best practices force you to use the Description field to give some informative context about why and how it is used/set/govern.`,
        badField: 'currentVersionRef.description',
        applicable: [ SFDC_Flow ],
        category: SCORE_RULE_CATEGORIES.DOCUMENTATION
    }, {
        id: 39,
        description: 'API Version too old for the current version of a flow',
        formula: (/** @type {SFDC_Flow} */ d) => IS_OLD_APIVERSION(SecretSauce.CurrentApiVersion, d?.currentVersionRef?.apiVersion),
        errorMessage: `The API version of this flow's current version is too old. Please update it to the newest version.`,
        badField: 'currentVersionRef.apiVersion',
        applicable: [ SFDC_Flow ],
        category: SCORE_RULE_CATEGORIES.API_VERSION
    }, {
        id: 40,
        description: 'This flow is running without sharing',
        formula: (/** @type {SFDC_Flow} */ d) => d?.currentVersionRef?.runningMode === 'SystemModeWithoutSharing',
        errorMessage: `The running mode of this version without sharing. With great power comes great responsibilities. Please check if this is REALLY needed.`,
        badField: 'currentVersionRef.runningMode',
        applicable: [ SFDC_Flow ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 41,
        description: 'Too many nodes in this version',
        formula: (/** @type {SFDC_Flow} */ d) => d?.currentVersionRef?.totalNodeCount > 100,
        errorMessage: `There are more than one hundred nodes in this flow. Please consider using Apex? or cut it into multiple sub flows?`,
        badField: 'currentVersionRef.totalNodeCount',
        applicable: [ SFDC_Flow ], 
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 42,
        description: 'Near the limit',
        formula: (/** @type {SFDC_Limit} */ d) => d?.usedPercentage >= 0.80,
        errorMessage: `This limit is almost reached (>80%). Please review this.`,
        badField: 'usedPercentage',
        applicable: [ SFDC_Limit ], 
        category: SCORE_RULE_CATEGORIES.OVERUSE
    }, {
        id: 43,
        description: 'Almost all licenses are used',
        formula: (/** @type {SFDC_PermissionSetLicense} */ d) => d?.usedPercentage !== undefined && d?.usedPercentage >= 0.80,
        errorMessage: `The number of seats for this license is almost reached (>80%). Please review this.`,
        badField: 'usedPercentage',
        applicable: [ SFDC_PermissionSetLicense ],
        category: SCORE_RULE_CATEGORIES.OVERUSE
    }, {
        id: 44,
        description: 'You could have licenses to free up',
        formula: (/** @type {SFDC_PermissionSetLicense} */ d) => d?.remainingCount > 0 && d?.distinctActiveAssigneeCount !==  d?.usedCount,
        errorMessage: `The Used count from that permission set license does not match the number of distinct active users assigned to the same license. Please check if you could free up some licenses!`,
        badField: 'distinctActiveAssigneeCount',
        applicable: [ SFDC_PermissionSetLicense ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 45,
        description: 'Role with a level >= 7',
        formula: (/** @type {SFDC_UserRole} */ d) => d?.level >= 7,
        errorMessage: `This role has a level in the Role Hierarchy which is seven or greater. Please reduce the maximum depth of the role hierarchy. Having that many levels has an impact on performance...`,
        badField: 'level',
        applicable: [ SFDC_UserRole ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 46,
        description: 'Hard-coded URL suspicion in this item',
        formula: (/** @type {SFDC_ApexClass | SFDC_ApexTrigger | SFDC_CollaborationGroup | SFDC_Field | SFDC_HomePageComponent | SFDC_VisualForceComponent | SFDC_VisualForcePage | SFDC_WebLink | SFDC_CustomTab | SFDC_EmailTemplate } */ d) => d?.hardCodedURLs?.length > 0 || false,
        errorMessage: `The source code of this item contains one or more hard coded URLs pointing to domains like salesforce.com or force.*`,
        badField: 'hardCodedURLs',
        applicable: [ SFDC_ApexClass, SFDC_ApexTrigger, SFDC_CollaborationGroup, SFDC_Field, SFDC_HomePageComponent, SFDC_VisualForceComponent, SFDC_VisualForcePage, SFDC_WebLink, SFDC_CustomTab, SFDC_EmailTemplate ],
        category: SCORE_RULE_CATEGORIES.HARDCODED_URL
    }, {
        id: 47,
        description: 'Hard-coded Salesforce IDs suspicion in this item',
        formula: (/** @type {SFDC_ApexClass | SFDC_ApexTrigger | SFDC_CollaborationGroup | SFDC_Field | SFDC_HomePageComponent | SFDC_VisualForceComponent | SFDC_VisualForcePage | SFDC_WebLink | SFDC_CustomTab | SFDC_EmailTemplate } */ d) => d?.hardCodedIDs?.length > 0 || false,
        errorMessage: `The source code of this item contains one or more hard coded Salesforce IDs`,
        badField: 'hardCodedIDs',
        applicable: [ SFDC_ApexClass, SFDC_ApexTrigger, SFDC_CollaborationGroup, SFDC_Field, SFDC_HomePageComponent, SFDC_VisualForceComponent, SFDC_VisualForcePage, SFDC_WebLink, SFDC_CustomTab, SFDC_EmailTemplate ],
        category: SCORE_RULE_CATEGORIES.HARDCODED_ID
    }, {
        id: 48,
        description: 'At least one successful testing method was very long',
        formula: (/** @type {SFDC_ApexClass} */ d) => d?.isTest === true && d?.testPassedButLongMethods && d?.testPassedButLongMethods.length > 0,
        errorMessage: `This Apex Test Class has at least one successful method which took more than 20 seconds to execute`,
        badField: 'testPassedButLongMethods',
        applicable: [ SFDC_ApexClass ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 49,
        description: 'Page layout should be assigned to at least one Profile',
        formula: (/** @type {SFDC_PageLayout} */ d) => d?.profileAssignmentCount === 0,
        errorMessage: `This Page Layout is not assigned to any Profile. Please review this page layout and assign it to at least one profile.`,
        badField: 'profileAssignmentCount',
        applicable: [ SFDC_PageLayout ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 50,
        description: 'Hard-coded URL suspicion in this document',
        formula: (/** @type {SFDC_Document } */ d) => d?.isHardCodedURL === true,
        errorMessage: `The URL of this document contains a hard coded URL pointing to domains like salesforce.com or force.*`,
        badField: 'documentUrl',
        applicable: [ SFDC_Document ],
        category: SCORE_RULE_CATEGORIES.HARDCODED_URL
    }, {
        id: 51,
        description: 'Unassigned Record Type',
        formula: (/** @type {SFDC_RecordType} */ d) => d?.isDefault === false && d?.isAvailable === false,
        errorMessage: `This record type is not set as default nor as visible in any profile in this org. Please review this record type and remove it if it is not needed anymore.`,
        badField: 'isDefault',
        applicable: [ SFDC_RecordType ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 52,
        description: 'Email template never used',
        formula: (/** @type {SFDC_EmailTemplate} */ d) => d?.lastUsedDate === null,
        errorMessage: `This email template was never used. Is it really useful?`,
        badField: 'lastUsedDate',
        applicable: [ SFDC_EmailTemplate ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 53,
        description: 'No description for this flow',
        formula: (/** @type { SFDC_Flow } */ d) => d?.type !== 'Workflow' && IS_EMPTY(d?.description),
        errorMessage: `This flow does not have a description. Best practices force you to use the Description field to give some informative context about why and how it is used/set/govern.`,
        badField: 'description',
        applicable: [ SFDC_Flow ],
        category: SCORE_RULE_CATEGORIES.DOCUMENTATION
    }, {
        id: 54,
        description: 'Hard-coded URL suspicion in this article',
        formula: (/** @type { SFDC_KnowledgeArticle } */ d) => d?.isHardCodedURL === true,
        errorMessage: `This article contains text information with links that points to domains like salesforce.com or force.*`,
        badField: 'isHardCodedURL',
        applicable: [ SFDC_KnowledgeArticle ],
        category: SCORE_RULE_CATEGORIES.HARDCODED_URL
    }, {
        id: 55,
        description: 'Custom permission set with no active member and only assigned to empty group(s)',
        formula: (/** @type {SFDC_PermissionSet} */ d) => d?.isCustom === true && d?.isGroup === false && d?.memberCounts === 0 && d?.allIncludingGroupsAreEmpty === true,
        errorMessage: `This custom permission set has no active members and is only included in empty permission set groups. Is it on purpose? Maybe you should review its use in your org...`,
        badField: 'allIncludingGroupsAreEmpty',
        applicable: [ SFDC_PermissionSet ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 56,
        description: 'Custom permission set group with no active member',
        formula: (/** @type {SFDC_PermissionSet} */ d) => d?.isCustom === true && d?.isGroup === true && d?.memberCounts === 0,
        errorMessage: `This custom permission set group has no active members. Is it empty on purpose? Maybe you should review its use in your org...`,
        badField: 'memberCounts',
        applicable: [ SFDC_PermissionSet ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 57,
        description: 'Custom permission set with no active member and not even assigned to group',
        formula: (/** @type {SFDC_PermissionSet} */ d) => d?.isCustom === true && d?.isGroup === false && d?.memberCounts === 0 && d?.permissionSetGroupIds?.length === 0,
        errorMessage: `This custom permission set has no active members and is not even assigned to a permission set group. Is it on purpose? Maybe you should review its use in your org...`,
        badField: 'memberCounts',
        applicable: [ SFDC_PermissionSet ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 58,
        description: 'IP Range too large (> 16,777,216)',
        formula: (/** @type {SFDC_ProfileRestrictions} */ d) => d?.ipRanges.filter(i => i.difference > 16777216).length > 0,
        errorMessage: `This profile includes an IP range that is too wide (more than 16,777,216 IP addresses!). If you set an IP Range it should be not that large. You could split that range into multiple ones. The risk is that you include an IP that is not part of your company. Please review this setting.`,
        badField: 'ipRanges',
        applicable: [ SFDC_ProfileRestrictions ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 59,
        description: 'Object with more than 350 custom fields',
        formula: (/** @type {SFDC_Object} */ d) => d?.nbCustomFields > 350,
        errorMessage: `This object has more than 350 custom fields. Please consider reducing that number as it can impact performance and usability.`,
        badField: 'nbCustomFields',
        applicable: [ SFDC_Object ],
        category: SCORE_RULE_CATEGORIES.OVERUSE
    }, {
        id: 60,
        description: 'Object with more than 15 page layouts',
        formula: (/** @type {SFDC_Object} */ d) => d?.nbPageLayouts > 15,
        errorMessage: `This object has more than 15 page layouts. Please consider reducing that number as it can impact performance and usability.`,
        badField: 'nbPageLayouts',
        applicable: [ SFDC_Object ],
        category: SCORE_RULE_CATEGORIES.OVERUSE
    }, {
        id: 61,
        description: 'Object with more than 20 workflow rules',
        formula: (/** @type {SFDC_Object} */ d) => d?.nbWorkflowRules > 20,
        errorMessage: `This object has more than 20 workflow rules. Please consider reducing that number as it can impact performance and usability.`,
        badField: 'nbWorkflowRules',
        applicable: [ SFDC_Object ],
        category: SCORE_RULE_CATEGORIES.OVERUSE
    }, {
        id: 62,
        description: 'Object with more than 20 validation rules',
        formula: (/** @type {SFDC_Object} */ d) => d?.nbValidationRules > 20,
        errorMessage: `This object has more than 20 validation rules. Please consider reducing that number as it can impact performance and usability.`,
        badField: 'nbValidationRules',
        applicable: [ SFDC_Object ],
        category: SCORE_RULE_CATEGORIES.OVERUSE
    }, {
        id: 63,
        description: 'Page layout with more than 100 fields',
        formula: (/** @type {SFDC_PageLayout} */ d) => d?.nbFields > 100,
        errorMessage: `This page layout has more than 100 fields. Please consider reducing that number as it can impact user adoption.`,
        badField: 'nbFields',
        applicable: [ SFDC_PageLayout ],
        category: SCORE_RULE_CATEGORIES.USER_ADOPTION
    }, {
        id: 64,
        description: 'Page layout with more than 11 related lists',
        formula: (/** @type {SFDC_PageLayout} */ d) => d?.nbRelatedLists > 11,
        errorMessage: `This page layout has more than 11 related lists. Please consider reducing that number as it can impact user adoption.`,
        badField: 'nbRelatedLists',
        applicable: [ SFDC_PageLayout ],
        category: SCORE_RULE_CATEGORIES.USER_ADOPTION
    }, {
        id: 65,
        description: 'Page layout with Notes and Attachments related list',
        formula: (/** @type {SFDC_PageLayout} */ d) => d?.isAttachmentRelatedListIncluded === true,
        errorMessage: `This page layout has the Notes and Attachments related list in it. Please consider using the Files related list instead.`,
        badField: 'isAttachmentRelatedListIncluded',
        applicable: [ SFDC_PageLayout ],
        category: SCORE_RULE_CATEGORIES.USER_ADOPTION
    }, {
        id: 66,
        description: 'Custom profile with low number of active members',
        formula: (/** @type {SFDC_Profile} */ d) => d?.isCustom === true && d?.memberCounts <= 10,
        errorMessage: `This custom profile has a low number of active members (<= 10). Maybe you should review its use in your org...`,
        badField: 'memberCounts',
        applicable: [ SFDC_Profile ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 67,
        description: 'Custom permission set with low number of active members and only assigned to empty group(s)',
        formula: (/** @type {SFDC_PermissionSet} */ d) => d?.isCustom === true && d?.isGroup === false && d?.memberCounts <= 10 && d?.allIncludingGroupsAreEmpty === true,
        errorMessage: `This custom permission set has a low number of active members (<= 10) and is only included in empty permission set groups. Is it on purpose? Maybe you should review its use in your org...`,
        badField: 'allIncludingGroupsAreEmpty',
        applicable: [ SFDC_PermissionSet ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 68,
        description: 'Custom permission set group with low number of active members',
        formula: (/** @type {SFDC_PermissionSet} */ d) => d?.isCustom === true && d?.isGroup === true && d?.memberCounts <= 10,
        errorMessage: `This custom permission set group has a low number of active members (<= 10). Is it empty on purpose? Maybe you should review its use in your org...`,
        badField: 'memberCounts',
        applicable: [ SFDC_PermissionSet ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 69,
        description: 'Custom permission set with low number of active members and not even assigned to group',
        formula: (/** @type {SFDC_PermissionSet} */ d) => d?.isCustom === true && d?.isGroup === false && d?.memberCounts <= 10 && d?.permissionSetGroupIds?.length === 0,
        errorMessage: `This custom permission set has a low number of active members (<= 10) and is not even assigned to a permission set group. Is it on purpose? Maybe you should review its use in your org...`,
        badField: 'memberCounts',
        applicable: [ SFDC_PermissionSet ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 70,
        description: 'This browser is considered out-of-date by Salesforce',
        formula: (/** @type {SFDC_Browser} */ d) => 
            (d.name === 'Chrome' && d.version < 88) ||
            (d.name === 'Edge' && d.version < 91) ||
            (d.name === 'Firefox' && d.version < 88) ||
            (d.name === 'Safari' && d.version < 14),
        errorMessage: `This browser is considered out-of-date by Salesforce. At this time, we consider the following list: Chrome <88, Edge <91, Firefox <88 and Safari <14. Please work with your user to make them switch to a more recent/supported browser. To identity the users you can go to the setup page "Login History" and export the data to identify them.`,
        badField: 'fullName',
        applicable: [ SFDC_Browser ],
        category: SCORE_RULE_CATEGORIES.USER_ADOPTION
    }, {
        id: 71,
        description: 'This browser is unsupported by Salesforce',
        formula: (/** @type {SFDC_Browser} */ d) => d.name === 'IE',
        errorMessage: `This browser is unsupported by Salesforce. At this time, we consider only Internet Explorer whatever its version. Please work with your user to make them switch to a more recent/supported browser. To identity the users you can go to the setup page "Login History" and export the data to identify them.`,
        badField: 'name',
        applicable: [ SFDC_Browser ],
        category: SCORE_RULE_CATEGORIES.USER_ADOPTION
    }, {
        id: 72,
        description: 'User is logging directly without MFA',
        formula: (/** @type {SFDC_User} */ d) => d.nbDirectLoginWithoutMFA > 0 && d.hasMfaByPass !== true,
        errorMessage: `This user is logging in directly to Salesforce without using MFA (Multi-Factor Authentication). And this user has not the MFA bypass enabled. Please work with your user to make them use MFA for better security.`,
        badField: 'nbDirectLoginWithoutMFA',
        applicable: [ SFDC_User ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 73,
        description: 'Lightning page with Notes and Attachments related list',
        formula: (/** @type {SFDC_LightningPage} */ d) => d?.isAttachmentRelatedListIncluded === true,
        errorMessage: `This lightning page has the Notes and Attachments related list in it. Please consider using the Files related list instead.`,
        badField: 'isAttachmentRelatedListIncluded',
        applicable: [ SFDC_LightningPage ],
        category: SCORE_RULE_CATEGORIES.USER_ADOPTION
    } , {
        id: 74,
        description: 'User with debug mode enabled',
        formula: (/** @type {SFDC_User} */ d) => d?.hasDebugMode === true,
        errorMessage: `This user has the debug mode enabled. Please disable it for better performance and user adoption.`,
        badField: 'hasDebugMode',
        applicable: [ SFDC_User ],
        category: SCORE_RULE_CATEGORIES.USER_ADOPTION
    }
];
Object.freeze(ALL_SCORE_RULES);

/**
 * @description Map used to get a rule direclty from its ID (we don't want to expose the map don't need to freeze it)
 * @type {Map<number, ScoreRule>}
 * @private
 */
const ALL_SCORE_RULES_BY_ID = new Map(ALL_SCORE_RULES.map(i => [ i.id, i ]));

/**
 * @description In Org Check, there are two main ingredients for our secret sauce: the score rules and 
 *                  the current api version of an org. Of course this secret sauce object is unmutable.
 * @public
 */
export class SecretSauce {

    /**
     * @description Returns an unmutable list of all score rules.
     * @returns {Array<ScoreRule>} List of score rules
     * @static
     * @readonly
     */
    static get AllScoreRules() { return ALL_SCORE_RULES; }

    /**
     * @description Returns an unmutable array of score rules only related to hardcoded urls.
     * @returns {Array<number>} Score rues only related to hardcoded urls
     * @static
     * @readonly
     */
    static GetScoreRulesForHardCodedURLs() { return ALL_SCORE_RULES.filter(r => r.category === SCORE_RULE_CATEGORIES.HARDCODED_URL).map(r => r.id); }

    /**
     * @description Returns an unmutable score rule given its id.
     * @param {number} id - The ID of the score rule to retrieve.
     * @returns {ScoreRule} The score rule given its id
     * @static
     * @readonly
     */
    static GetScoreRule(id) { return ALL_SCORE_RULES_BY_ID.get(id); }

    /**
     * @description Returns the description of a given rule from its id.
     * @param {number} id - The ID of the score rule.
     * @returns {string} Description of the given rule
     * @static
     * @readonly
     */
    static GetScoreRuleDescription(id) { return ALL_SCORE_RULES_BY_ID.get(id)?.description ?? 'N/A'; }

    /**
     * @description Returns the "potential" latest API version that a production org and non preview org can have
     * @returns {number} Api Version to use
     * @static
     * @readonly
     */
    static get CurrentApiVersion() { return GET_LATEST_API_VERSION(); }
}
Object.freeze(SecretSauce);
