import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataWithScoreAndDependencies } from 'src/api/core/data/orgcheck-api-data';
import { ScoreRule } from 'src/api/core/orgcheck-api-data-scorerule';
import { SfdcApexClass } from 'src/api/data/orgcheck-api-data-apexclass';
import { SfdcApexTrigger } from 'src/api/data/orgcheck-api-data-apextrigger';
import { SfdcBrowser } from 'src/api/data/orgcheck-api-data-browser';
import { SfdcCollaborationGroup } from 'src/api/data/orgcheck-api-data-collaborationgroup';
import { SfdcCustomLabel } from 'src/api/data/orgcheck-api-data-customlabel';
import { SfdcCustomTab } from 'src/api/data/orgcheck-api-data-customtab';
import { SfdcDashboard } from 'src/api/data/orgcheck-api-data-dashboard';
import { SfdcDocument } from 'src/api/data/orgcheck-api-data-document';
import { SfdcEmailTemplate } from 'src/api/data/orgcheck-api-data-emailtemplate';
import { SfdcField } from 'src/api/data/orgcheck-api-data-field';
import { SfdcFieldSet } from 'src/api/data/orgcheck-api-data-fieldset';
import { SfdcFlow } from 'src/api/data/orgcheck-api-data-flow';
import { SfdcGroup } from 'src/api/data/orgcheck-api-data-group';
import { SfdcHomePageComponent } from 'src/api/data/orgcheck-api-data-homepagecomponent';
import { SfdcKnowledgeArticle } from 'src/api/data/orgcheck-api-data-knowledgearticle';
import { SfdcLightningAuraComponent } from 'src/api/data/orgcheck-api-data-lightningauracomponent';
import { SfdcLightningPage } from 'src/api/data/orgcheck-api-data-lightningpage';
import { SfdcLightningWebComponent } from 'src/api/data/orgcheck-api-data-lightningwebcomponent';
import { SfdcLimit } from 'src/api/data/orgcheck-api-data-limit';
import { SfdcObject } from 'src/api/data/orgcheck-api-data-object';
import { SfdcPageLayout } from 'src/api/data/orgcheck-api-data-pagelayout';
import { SfdcPermissionSet } from 'src/api/data/orgcheck-api-data-permissionset';
import { SfdcPermissionSetLicense } from 'src/api/data/orgcheck-api-data-permissionsetlicense';
import { SfdcProfile } from 'src/api/data/orgcheck-api-data-profile';
import { SfdcProfilePasswordPolicy } from 'src/api/data/orgcheck-api-data-profilepasswordpolicy';
import { SfdcProfileRestrictions } from 'src/api/data/orgcheck-api-data-profilerestrictions';
import { SfdcRecordType } from 'src/api/data/orgcheck-api-data-recordtype';
import { SfdcReport } from 'src/api/data/orgcheck-api-data-report';
import { SfdcStaticResource } from 'src/api/data/orgcheck-api-data-staticresource';
import { SfdcUser } from 'src/api/data/orgcheck-api-data-user';
import { SfdcUserRole } from 'src/api/data/orgcheck-api-data-userrole';
import { SfdcValidationRule } from 'src/api/data/orgcheck-api-data-validationrule';
import { SfdcVisualForceComponent } from 'src/api/data/orgcheck-api-data-visualforcecomponent';
import { SfdcVisualForcePage } from 'src/api/data/orgcheck-api-data-visualforcepage';
import { SfdcWebLink } from 'src/api/data/orgcheck-api-data-weblink';
import { SfdcWorkflow } from 'src/api/data/orgcheck-api-data-workflow';


/**
 * @description Checks if the difference bewteen the given current version and the api version is more than three years (or more if specified)
 * @param {any} currentVersion - Version set for a specific item like VFP, apex class, etc.
 * @param {any} version - Version used by the api (should be the latest)
 * @param {number} [definition_of_old] - Definition of "old" in years (three years by default)
 * @returns {boolean} true if the given current version is said too old, false otherwise.
 * @private
 */
const IS_OLD_APIVERSION = (currentVersion: any, version: any, definition_of_old: number = 3): boolean => { 
    if (version && currentVersion && definition_of_old) return ((currentVersion - version) / 3) >= definition_of_old; 
    return false;
}

/**
 * @description Checks if a given value is "empty". The value can be a string or an Array.
 * @param {any[] | string} value - Any value to check
 * @returns {boolean} true if the value is empty. false otherwise
 * @private
 */
const IS_EMPTY = (value: any[] | string): boolean => {
    // In case we have a numerial value as input
    if (typeof value === 'number' && value === 0) return false;
    // if the value is undefined or null --> it's EMPTY!
    if (!value) return true;
    // length is a property both used in Array and string. Obviously if the length is zero --> it's EMPTY!
    if (value?.length === 0) return true;
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
const GET_LATEST_API_VERSION = (): number => {
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
 * @type {ScoreRule[]}
 * @private
 */
const ALL_SCORE_RULES: ScoreRule[] = [
    // IMPORTANT NOTE:
    // ScoreRule ids are explicitly hard coded in the following list. 
    // This is by choice and design. ;)
    // Why? To make sure from one version to the other, the same rule id is not used for another rule...
    // So please continue to increment IDs values and ADD NEW RULES AT THE END of the array !!
    { 
        id: 0,
        description: 'Not referenced anywhere',
        formula: (d: SfdcCustomLabel | SfdcLightningPage | SfdcLightningAuraComponent | SfdcLightningWebComponent | SfdcVisualForceComponent | SfdcVisualForcePage | SfdcStaticResource) => d?.dependencies?.hadError === false && IS_EMPTY(d.dependencies?.referenced), 
        errorMessage: `This component is not referenced anywhere (as we were told by the Dependency API). Please review the need to keep it in your org.`,
        badField: 'dependencies.referenced?.length',
        applicable: [ DataAliases.SfdcCustomLabel, DataAliases.SfdcLightningPage, DataAliases.SfdcLightningAuraComponent, DataAliases.SfdcLightningWebComponent, DataAliases.SfdcVisualForceComponent, DataAliases.SfdcVisualForcePage, DataAliases.SfdcStaticResource ],
        category: SCORE_RULE_CATEGORIES.DEPENDENCY
    }, {
        id: 1,
        description: 'No reference anywhere for custom field',
        formula: (d: SfdcField) => d?.isCustom === true && d?.dependencies?.hadError === false && IS_EMPTY(d.dependencies?.referenced), 
        errorMessage: `This custom field is not referenced anywhere (as we were told by the Dependency API). Please review the need to keep it in your org.`,
        badField: 'dependencies.referenced?.length',
        applicable: [ DataAliases.SfdcField ],
        category: SCORE_RULE_CATEGORIES.DEPENDENCY
    }, {
        id: 2,
        description: 'No reference anywhere for apex class',
        formula: (d: SfdcApexClass) => d?.isTest === false && d?.dependencies?.hadError === false && IS_EMPTY(d.dependencies?.referenced), 
        errorMessage: `This apex class is not referenced anywhere (as we were told by the Dependency API). Please review the need to keep it in your org.`,
        badField: 'dependencies.referenced?.length',
        applicable: [ DataAliases.SfdcApexClass ],
        category: SCORE_RULE_CATEGORIES.DEPENDENCY
    }, {
        id: 3,
        description: 'Sorry, we had an issue with the Dependency API to gather the dependencies of this item',
        formula: (d: DataWithScoreAndDependencies) => d?.dependencies && d?.dependencies.hadError === true, 
        errorMessage: `Sorry, we had an issue with the Dependency API to gather the dependencies of this item.`,
        badField: 'dependencies.referenced?.length',
        applicable: [ DataAliases.SfdcField, DataAliases.SfdcApexClass, DataAliases.SfdcCustomLabel, DataAliases.SfdcFlow, DataAliases.SfdcLightningPage, DataAliases.SfdcLightningAuraComponent, DataAliases.SfdcLightningWebComponent, DataAliases.SfdcVisualForceComponent, DataAliases.SfdcVisualForcePage ],
        category: SCORE_RULE_CATEGORIES.DEPENDENCY
    }, {
        id: 4,
        description: 'API Version too old',
        formula: (d: SfdcApexClass | SfdcApexTrigger | SfdcFlow | SfdcLightningAuraComponent | SfdcLightningWebComponent | SfdcVisualForcePage | SfdcVisualForceComponent | SfdcEmailTemplate) => IS_OLD_APIVERSION(SecretSauce.CurrentApiVersion, d?.apiVersion),
        errorMessage: `The API version of this component is too old. Please update it to the newest version.`,
        badField: 'apiVersion',
        applicable: [ DataAliases.SfdcApexClass, DataAliases.SfdcApexTrigger, DataAliases.SfdcFlow, DataAliases.SfdcLightningAuraComponent, DataAliases.SfdcLightningWebComponent, DataAliases.SfdcVisualForcePage, DataAliases.SfdcVisualForceComponent, DataAliases.SfdcEmailTemplate ],
        category: SCORE_RULE_CATEGORIES.API_VERSION
    }, {
        id: 5,
        description: 'No assertion in this Apex Test',
        formula: (d: SfdcApexClass) => d?.isTest === true && d?.nbSystemAsserts === 0,
        errorMessage: `This apex test does not contain any assertion! Best practices force you to define assertions in tests.`,
        badField: 'nbSystemAsserts',
        applicable: [ DataAliases.SfdcApexClass ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 6,
        description: 'No description',
        formula: (d: SfdcLightningPage | SfdcLightningAuraComponent | SfdcLightningWebComponent | SfdcVisualForcePage | SfdcVisualForceComponent | SfdcWorkflow | SfdcWebLink | SfdcFieldSet | SfdcValidationRule | SfdcDocument | SfdcCustomTab | SfdcEmailTemplate | SfdcStaticResource | SfdcReport | SfdcDashboard) => IS_EMPTY(d?.description),
        errorMessage: `This component does not have a description. Best practices force you to use the Description field to give some informative context about why and how it is used/set/govern.`,
        badField: 'description',
        applicable: [ DataAliases.SfdcLightningPage, DataAliases.SfdcLightningAuraComponent, DataAliases.SfdcLightningWebComponent, DataAliases.SfdcVisualForcePage, DataAliases.SfdcVisualForceComponent, DataAliases.SfdcWorkflow, DataAliases.SfdcWebLink, DataAliases.SfdcFieldSet, DataAliases.SfdcValidationRule, DataAliases.SfdcDocument, DataAliases.SfdcCustomTab, DataAliases.SfdcEmailTemplate, DataAliases.SfdcStaticResource, DataAliases.SfdcReport, DataAliases.SfdcDashboard ],
        category: SCORE_RULE_CATEGORIES.DOCUMENTATION
    }, {
        id: 7,
        description: 'No description for custom component',
        formula: (d: SfdcField | SfdcPermissionSet | SfdcProfile) => d?.isCustom === true && IS_EMPTY(d?.description),
        errorMessage: `This custom component does not have a description. Best practices force you to use the Description field to give some informative context about why and how it is used/set/govern.`,
        badField: 'description',
        applicable: [ DataAliases.SfdcField, DataAliases.SfdcPermissionSet, DataAliases.SfdcProfile ],
        category: SCORE_RULE_CATEGORIES.DOCUMENTATION
    }, {
        id: 8,
        description: 'No explicit sharing in apex class',
        formula: (d: SfdcApexClass) => d?.isTest === false && d?.isClass === true && !d.specifiedSharing,
        errorMessage: `This Apex Class does not specify a sharing model. Best practices force you to specify with, without or inherit sharing to better control the visibility of the data you process in Apex.`,
        badField: 'specifiedSharing',
        applicable: [ DataAliases.SfdcApexClass ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 9,
        description: 'Schedulable should be scheduled',
        formula: (d: SfdcApexClass) => d?.isScheduled === false && d?.isSchedulable === true,
        errorMessage: `This Apex Class implements Schedulable but is not scheduled. What is the point? Is this class still necessary?`,
        badField: 'isScheduled',
        applicable: [ DataAliases.SfdcApexClass ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 10,
        description: 'Not able to compile class',
        formula: (d: SfdcApexClass) => d?.needsRecompilation === true,
        errorMessage: `This Apex Class can not be compiled for some reason. You should try to recompile it. If the issue remains you need to consider refactoring this class or the classes that it is using.`,
        badField: 'name',
        applicable: [ DataAliases.SfdcApexClass ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 11,
        description: 'No coverage for this class',
        formula: (d: SfdcApexClass) => d?.isTest === false && (isNaN(d.coverage) || !d.coverage),
        errorMessage: `This Apex Class does not have any code coverage. Consider launching the corresponding tests that will bring some coverage. If you do not know which test to launch just run them all!`,
        badField: 'coverage',
        applicable: [ DataAliases.SfdcApexClass ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 12,
        description: 'Coverage not enough',
        formula: (d: SfdcApexClass) => d?.coverage > 0 && d?.coverage < 0.75,
        errorMessage: `This Apex Class does not have enough code coverage (less than 75% of lines are covered by successful unit tests). Maybe you ran not all the unit tests to cover this class entirely? If you did, then consider augmenting that coverage with new test methods.`,
        badField: 'coverage',
        applicable: [ DataAliases.SfdcApexClass ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 13,
        description: 'At least one testing method failed',
        formula: (d: SfdcApexClass) => d?.isTest === true && d?.testFailedMethods && d?.testFailedMethods?.length > 0,
        errorMessage: `This Apex Test Class has at least one failed method.`,
        badField: 'testFailedMethods',
        applicable: [ DataAliases.SfdcApexClass ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 14,
        description: 'Apex trigger should not contain SOQL statement',
        formula: (d: SfdcApexTrigger) => d?.hasSOQL === true,
        errorMessage: `This Apex Trigger contains at least one SOQL statement. Best practices force you to move any SOQL statement in dedicated Apex Classes that you would call from the trigger. Please update the code accordingly.`,
        badField: 'hasSOQL',
        applicable: [ DataAliases.SfdcApexTrigger ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 15,
        description: 'Apex trigger should not contain DML action',
        formula: (d: SfdcApexTrigger) => d?.hasDML === true,
        errorMessage: `This Apex Trigger contains at least one DML action. Best practices force you to move any DML action in dedicated Apex Classes that you would call from the trigger. Please update the code accordingly.`,
        badField: 'hasDML',
        applicable: [ DataAliases.SfdcApexTrigger ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 16,
        description: 'Apex Trigger should not contain logic',
        formula: (d: SfdcApexTrigger) => d?.length > 5000,
        errorMessage: `Due to the massive number of source code (more than 5000 characters) in this Apex Trigger, we suspect that it contains logic. Best practices force you to move any logic in dedicated Apex Classes that you would call from the trigger. Please update the code accordingly.`,
        badField: 'length',
        applicable: [ DataAliases.SfdcApexTrigger ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 17,
        description: 'No direct member for this group',
        formula: (d: SfdcGroup) => !d.nbDirectMembers || d?.nbDirectMembers === 0,
        errorMessage: `This public group (or queue) does not contain any direct members (users or sub groups). Is it empty on purpose? Maybe you should review its use in your org...`,
        badField: 'nbDirectMembers',
        applicable: [ DataAliases.SfdcGroup ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 18,
        description: 'Custom profile with no active member',
        formula: (d: SfdcProfile) => d?.isCustom === true && d?.memberCounts === 0,
        errorMessage: `This custom profile has no active members. Is it empty on purpose? Maybe you should review its use in your org...`,
        badField: 'memberCounts',
        applicable: [ DataAliases.SfdcProfile ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 19,
        description: 'Role with no active users',
        formula: (d: SfdcUserRole) => d?.activeMembersCount === 0,
        errorMessage: `This role has no active users assigned to it. Is it on purpose? Maybe you should review its use in your org...`,
        badField: 'activeMembersCount',
        applicable: [ DataAliases.SfdcUserRole ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 20,
        description: 'Active user not under LEX',
        formula: (d: SfdcUser) => d?.onLightningExperience === false,
        errorMessage: `This user is still using Classic. Time to switch to Lightning for all your users, don't you think?`,
        badField: 'onLightningExperience',
        applicable: [ DataAliases.SfdcUser ],
        category: SCORE_RULE_CATEGORIES.USER_ADOPTION
    }, {
        id: 21,
        description: 'Active user never logged',
        formula: (d: SfdcUser) => d?.lastLogin === null,
        errorMessage: `This active user has never logged in yet. Time to optimize your licence cost!`,
        badField: 'lastLogin',
        applicable: [ DataAliases.SfdcUser ],
        category: SCORE_RULE_CATEGORIES.USER_ADOPTION
    }, {
        id: 22,
        description: 'Workflow with no action',
        formula: (d: SfdcWorkflow) => d?.hasAction === false,
        errorMessage: `This workflow has no action, please review it and potentially remove it.`,
        badField: 'hasAction',
        applicable: [ DataAliases.SfdcWorkflow ],
        category: SCORE_RULE_CATEGORIES.DEPENDENCY
    }, {
        id: 23,
        description: 'Workflow with empty time triggered list',
        formula: (d: SfdcWorkflow) => d?.emptyTimeTriggers?.length > 0,
        errorMessage: `This workflow is time triggered but with no time triggered action, please review it.`,
        badField: 'emptyTimeTriggers',
        applicable: [ DataAliases.SfdcWorkflow ],
        category: SCORE_RULE_CATEGORIES.DEPENDENCY
    }, {
        id: 24,
        description: 'Password policy with question containing password!',
        formula: (d: SfdcProfilePasswordPolicy) => d?.passwordQuestion === true,
        errorMessage: `This profile password policy allows you to have a password in the question! Please change that setting as it is clearly a lack of security in your org!`,
        badField: 'passwordQuestion',
        applicable: [ DataAliases.SfdcProfilePasswordPolicy ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 25,
        description: 'Password policy with too big expiration',
        formula: (d: SfdcProfilePasswordPolicy) => d?.passwordExpiration > 90,
        errorMessage: `This profile password policy allows you to have a password that expires after 90 days. Please consider having a shorter period of time for expiration if you policy.`,
        badField: 'passwordExpiration',
        applicable: [ DataAliases.SfdcProfilePasswordPolicy ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 26,
        description: 'Password policy with no expiration',
        formula: (d: SfdcProfilePasswordPolicy) => d?.passwordExpiration === 0,
        errorMessage: `This profile password policy allows you to have a password that never expires. Why is that? Do you have this profile for technical users? Please reconsider this setting and use JWT authentication instead for technical users.`,
        badField: 'passwordExpiration',
        applicable: [ DataAliases.SfdcProfilePasswordPolicy ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 27,
        description: 'Password history too small',
        formula: (d: SfdcProfilePasswordPolicy) => d?.passwordHistory < 3,
        errorMessage: `This profile password policy allows users to set their password with a too-short memory. For example, they can keep on using the same different password every time you ask them to change it. Please increase this setting.`,
        badField: 'passwordHistory',
        applicable: [ DataAliases.SfdcProfilePasswordPolicy ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 28,
        description: 'Password minimum size too small',
        formula: (d: SfdcProfilePasswordPolicy) => d?.minimumPasswordLength < 8,
        errorMessage: `This profile password policy allows users to set passwords with less than 8 characters. That minimum length is not strong enough. Please increase this setting.`,
        badField: 'minimumPasswordLength',
        applicable: [ DataAliases.SfdcProfilePasswordPolicy ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 29,
        description: 'Password complexity too weak',
        formula: (d: SfdcProfilePasswordPolicy) => d?.passwordComplexity < 3,
        errorMessage: `This profile password policy allows users to set too-easy passwords. The complexity you choose is not strong enough. Please increase this setting.`,
        badField: 'passwordComplexity',
        applicable: [ DataAliases.SfdcProfilePasswordPolicy ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 30,
        description: 'No max login attempts set',
        formula: (d: SfdcProfilePasswordPolicy) => d?.maxLoginAttempts === undefined,
        errorMessage: `This profile password policy allows users to try infinitely to log in without locking the access. Please review this setting.`,
        badField: 'passwordExpiration',
        applicable: [ DataAliases.SfdcProfilePasswordPolicy ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 31,
        description: 'No lockout period set',
        formula: (d: SfdcProfilePasswordPolicy) => d?.lockoutInterval === undefined,
        errorMessage: `This profile password policy does not set a value for any locked out period. Please review this setting.`,
        badField: 'lockoutInterval',
        applicable: [ DataAliases.SfdcProfilePasswordPolicy ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 32,
        description: 'IP Range too large (> 100,000)',
        formula: (d: SfdcProfileRestrictions) => d?.ipRanges.filter(i => i.difference > 100000).length > 0,
        errorMessage: `This profile includes an IP range that is too wide (more than 100,000 IP addresses!). If you set an IP Range it should be not that large. You could split that range into multiple ones. The risk is that you include an IP that is not part of your company. Please review this setting.`,
        badField: 'ipRanges',
        applicable: [ DataAliases.SfdcProfileRestrictions ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 33,
        description: 'Login hours too large',
        formula: (d: SfdcProfileRestrictions) => d?.loginHours.filter(i => i.difference > 1200).length > 0,
        errorMessage: `This profile includes a login hour that is too wide (more than 20 hours a day!). If you set a login hour it should reflect reality. Please review this setting.`,
        badField: 'loginHours',
        applicable: [ DataAliases.SfdcProfileRestrictions ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 34,
        description: 'Inactive component',
        formula: (d: SfdcValidationRule | SfdcRecordType | SfdcApexTrigger | SfdcWorkflow | SfdcEmailTemplate) => d?.isActive === false,
        errorMessage: `This component is inactive, so why do not you just remove it from your org?`,
        badField: 'isActive',
        applicable: [ DataAliases.SfdcValidationRule, DataAliases.SfdcRecordType, DataAliases.SfdcApexTrigger, DataAliases.SfdcWorkflow, DataAliases.SfdcEmailTemplate ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 35,
        description: 'No active version for this flow',
        formula: (d: SfdcFlow) => d?.isVersionActive === false,
        errorMessage: `This flow does not have an active version, did you forget to activate its latest version? or you do not need that flow anymore?`,
        badField: 'isVersionActive',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 36,
        description: 'Too many versions under this flow',
        formula: (d: SfdcFlow) => d?.versionsCount > 7,
        errorMessage: `This flow has more than seven versions. Maybe it is time to do some cleaning in this flow!`,
        badField: 'versionsCount',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 37,
        description: 'Migrate this process builder',
        formula: (d: SfdcFlow) => d?.isProcessBuilder === true,
        errorMessage: `Time to migrate this process builder to flow!`,
        badField: 'name',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 38,
        description: 'No description for the current version of a flow',
        formula: (d: SfdcFlow) => IS_EMPTY(d?.description),
        errorMessage: `This flow does not have a description. Best practices force you to use the Description field to give some informative context about why and how it is used/set/govern.`,
        badField: 'description',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.DOCUMENTATION
    }, {
        id: 39,
        description: 'API Version too old for the current version of a flow',
        formula: (d: SfdcFlow) => IS_OLD_APIVERSION(SecretSauce.CurrentApiVersion, d?.currentVersionRef?.apiVersion),
        errorMessage: `The API version of this flow's current version is too old. Please update it to the newest version.`,
        badField: 'currentVersionRef.apiVersion',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.API_VERSION
    }, {
        id: 40,
        description: 'This flow is running without sharing',
        formula: (d: SfdcFlow) => d?.currentVersionRef?.runningMode === 'SystemModeWithoutSharing',
        errorMessage: `The running mode of this version without sharing. With great power comes great responsibilities. Please check if this is REALLY needed.`,
        badField: 'currentVersionRef.runningMode',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 41,
        description: 'Too many nodes in this version',
        formula: (d: SfdcFlow) => d?.currentVersionRef?.totalNodeCount > 100,
        errorMessage: `There are more than one hundred nodes in this flow. Please consider using Apex? or cut it into multiple sub flows?`,
        badField: 'currentVersionRef.totalNodeCount',
        applicable: [ DataAliases.SfdcFlow ], 
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 42,
        description: 'Near the limit',
        formula: (d: SfdcLimit) => d?.usedPercentage >= 0.80,
        errorMessage: `This limit is almost reached (>80%). Please review this.`,
        badField: 'usedPercentage',
        applicable: [ DataAliases.SfdcLimit ], 
        category: SCORE_RULE_CATEGORIES.OVERUSE
    }, {
        id: 43,
        description: 'Almost all licenses are used',
        formula: (d: SfdcPermissionSetLicense) => d?.usedPercentage !== undefined && d?.usedPercentage >= 0.80,
        errorMessage: `The number of seats for this license is almost reached (>80%). Please review this.`,
        badField: 'usedPercentage',
        applicable: [ DataAliases.SfdcPermissionSetLicense ],
        category: SCORE_RULE_CATEGORIES.OVERUSE
    }, {
        id: 44,
        description: 'You could have licenses to free up',
        formula: (d: SfdcPermissionSetLicense) => d?.remainingCount > 0 && d?.distinctActiveAssigneeCount !==  d?.usedCount,
        errorMessage: `The Used count from that permission set license does not match the number of distinct active users assigned to the same license. Please check if you could free up some licenses!`,
        badField: 'distinctActiveAssigneeCount',
        applicable: [ DataAliases.SfdcPermissionSetLicense ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 45,
        description: 'Role with a level >= 7',
        formula: (d: SfdcUserRole) => d?.level >= 7,
        errorMessage: `This role has a level in the Role Hierarchy which is seven or greater. Please reduce the maximum depth of the role hierarchy. Having that many levels has an impact on performance...`,
        badField: 'level',
        applicable: [ DataAliases.SfdcUserRole ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 46,
        description: 'Hard-coded URL suspicion in this item',
        formula: (d: SfdcApexClass | SfdcApexTrigger | SfdcCollaborationGroup | SfdcField | SfdcHomePageComponent | SfdcVisualForceComponent | SfdcVisualForcePage | SfdcWebLink | SfdcCustomTab | SfdcEmailTemplate) => d?.hardCodedURLs?.length > 0 || false,
        errorMessage: `The source code of this item contains one or more hard coded URLs pointing to domains like salesforce.com or force.*`,
        badField: 'hardCodedURLs',
        applicable: [ DataAliases.SfdcApexClass, DataAliases.SfdcApexTrigger, DataAliases.SfdcCollaborationGroup, DataAliases.SfdcField, DataAliases.SfdcHomePageComponent, DataAliases.SfdcVisualForceComponent, DataAliases.SfdcVisualForcePage, DataAliases.SfdcWebLink, DataAliases.SfdcCustomTab, DataAliases.SfdcEmailTemplate ],
        category: SCORE_RULE_CATEGORIES.HARDCODED_URL
    }, {
        id: 47,
        description: 'Hard-coded Salesforce IDs suspicion in this item',
        formula: (d: SfdcApexClass | SfdcApexTrigger | SfdcCollaborationGroup | SfdcField | SfdcHomePageComponent | SfdcVisualForceComponent | SfdcVisualForcePage | SfdcWebLink | SfdcCustomTab | SfdcEmailTemplate) => d?.hardCodedIDs?.length > 0 || false,
        errorMessage: `The source code of this item contains one or more hard coded Salesforce IDs`,
        badField: 'hardCodedIDs',
        applicable: [ DataAliases.SfdcApexClass, DataAliases.SfdcApexTrigger, DataAliases.SfdcCollaborationGroup, DataAliases.SfdcField, DataAliases.SfdcHomePageComponent, DataAliases.SfdcVisualForceComponent, DataAliases.SfdcVisualForcePage, DataAliases.SfdcWebLink, DataAliases.SfdcCustomTab, DataAliases.SfdcEmailTemplate ],
        category: SCORE_RULE_CATEGORIES.HARDCODED_ID
    }, {
        id: 48,
        description: 'At least one successful testing method was very long',
        formula: (d: SfdcApexClass) => d?.isTest === true && d?.testPassedButLongMethods && d?.testPassedButLongMethods?.length > 0,
        errorMessage: `This Apex Test Class has at least one successful method which took more than 20 seconds to execute`,
        badField: 'testPassedButLongMethods',
        applicable: [ DataAliases.SfdcApexClass ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 49,
        description: 'Page layout should be assigned to at least one Profile',
        formula: (d: SfdcPageLayout) => d?.profileAssignmentCount === 0,
        errorMessage: `This Page Layout is not assigned to any Profile. Please review this page layout and assign it to at least one profile.`,
        badField: 'profileAssignmentCount',
        applicable: [ DataAliases.SfdcPageLayout ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 50,
        description: 'Hard-coded URL suspicion in this document',
        formula: (d: SfdcDocument) => d?.isHardCodedURL === true,
        errorMessage: `The URL of this document contains a hard coded URL pointing to domains like salesforce.com or force.*`,
        badField: 'documentUrl',
        applicable: [ DataAliases.SfdcDocument ],
        category: SCORE_RULE_CATEGORIES.HARDCODED_URL
    }, {
        id: 51,
        description: 'Unassigned Record Type',
        formula: (d: SfdcRecordType) => d?.isDefault === false && d?.isAvailable === false,
        errorMessage: `This record type is not set as default nor as visible in any profile in this org. Please review this record type and remove it if it is not needed anymore.`,
        badField: 'isDefault',
        applicable: [ DataAliases.SfdcRecordType ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 52,
        description: 'Email template never used',
        formula: (d: SfdcEmailTemplate) => d?.lastUsedDate === null,
        errorMessage: `This email template was never used. Is it really useful?`,
        badField: 'lastUsedDate',
        applicable: [ DataAliases.SfdcEmailTemplate ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 53,
        description: 'No description for this flow',
        formula: (d: SfdcFlow) => d?.isProcessBuilder === false && IS_EMPTY(d?.description),
        errorMessage: `This flow does not have a description. Best practices force you to use the Description field to give some informative context about why and how it is used/set/govern.`,
        badField: 'description',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.DOCUMENTATION
    }, {
        id: 54,
        description: 'Hard-coded URL suspicion in this article',
        formula: (d: SfdcKnowledgeArticle) => d?.isHardCodedURL === true,
        errorMessage: `This article contains text information with links that points to domains like salesforce.com or force.*`,
        badField: 'isHardCodedURL',
        applicable: [ DataAliases.SfdcKnowledgeArticle ],
        category: SCORE_RULE_CATEGORIES.HARDCODED_URL
    }, {
        id: 55,
        description: 'Custom permission set with no active member and only assigned to empty group(s)',
        formula: (d: SfdcPermissionSet) => d?.isCustom === true && d?.isGroup === false && d?.memberCounts === 0 && d?.allIncludingGroupsAreEmpty === true,
        errorMessage: `This custom permission set has no active members and is only included in empty permission set groups. Is it on purpose? Maybe you should review its use in your org...`,
        badField: 'allIncludingGroupsAreEmpty',
        applicable: [ DataAliases.SfdcPermissionSet ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 56,
        description: 'Custom permission set group with no active member',
        formula: (d: SfdcPermissionSet) => d?.isCustom === true && d?.isGroup === true && d?.memberCounts === 0,
        errorMessage: `This custom permission set group has no active members. Is it empty on purpose? Maybe you should review its use in your org...`,
        badField: 'memberCounts',
        applicable: [ DataAliases.SfdcPermissionSet ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 57,
        description: 'Custom permission set with no active member and not even assigned to group',
        formula: (d: SfdcPermissionSet) => d?.isCustom === true && d?.isGroup === false && d?.memberCounts === 0 && d?.permissionSetGroupIds?.length === 0,
        errorMessage: `This custom permission set has no active members and is not even assigned to a permission set group. Is it on purpose? Maybe you should review its use in your org...`,
        badField: 'memberCounts',
        applicable: [ DataAliases.SfdcPermissionSet ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 58,
        description: 'IP Range too large (> 16,777,216)',
        formula: (d: SfdcProfileRestrictions) => d?.ipRanges.filter(i => i.difference > 16777216).length > 0,
        errorMessage: `This profile includes an IP range that is too wide (more than 16,777,216 IP addresses!). If you set an IP Range it should be not that large. You could split that range into multiple ones. The risk is that you include an IP that is not part of your company. Please review this setting.`,
        badField: 'ipRanges',
        applicable: [ DataAliases.SfdcProfileRestrictions ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 59,
        description: 'Object with more than 350 custom fields',
        formula: (d: SfdcObject) => d?.nbCustomFields > 350,
        errorMessage: `This object has more than 350 custom fields. Please consider reducing that number as it can impact performance and usability.`,
        badField: 'nbCustomFields',
        applicable: [ DataAliases.SfdcObject ],
        category: SCORE_RULE_CATEGORIES.OVERUSE
    }, {
        id: 60,
        description: 'Object with more than 15 page layouts',
        formula: (d: SfdcObject) => d?.nbPageLayouts > 15,
        errorMessage: `This object has more than 15 page layouts. Please consider reducing that number as it can impact performance and usability.`,
        badField: 'nbPageLayouts',
        applicable: [ DataAliases.SfdcObject ],
        category: SCORE_RULE_CATEGORIES.OVERUSE
    }, {
        id: 61,
        description: 'Object with more than 20 workflow rules',
        formula: (d: SfdcObject) => d?.nbWorkflowRules > 20,
        errorMessage: `This object has more than 20 workflow rules. Please consider reducing that number as it can impact performance and usability.`,
        badField: 'nbWorkflowRules',
        applicable: [ DataAliases.SfdcObject ],
        category: SCORE_RULE_CATEGORIES.OVERUSE
    }, {
        id: 62,
        description: 'Object with more than 20 validation rules',
        formula: (d: SfdcObject) => d?.nbValidationRules > 20,
        errorMessage: `This object has more than 20 validation rules. Please consider reducing that number as it can impact performance and usability.`,
        badField: 'nbValidationRules',
        applicable: [ DataAliases.SfdcObject ],
        category: SCORE_RULE_CATEGORIES.OVERUSE
    }, {
        id: 63,
        description: 'Page layout with more than 100 fields',
        formula: (d: SfdcPageLayout) => d?.nbFields > 100,
        errorMessage: `This page layout has more than 100 fields. Please consider reducing that number as it can impact user adoption.`,
        badField: 'nbFields',
        applicable: [ DataAliases.SfdcPageLayout ],
        category: SCORE_RULE_CATEGORIES.USER_ADOPTION
    }, {
        id: 64,
        description: 'Page layout with more than 11 related lists',
        formula: (d: SfdcPageLayout) => d?.nbRelatedLists > 11,
        errorMessage: `This page layout has more than 11 related lists. Please consider reducing that number as it can impact user adoption.`,
        badField: 'nbRelatedLists',
        applicable: [ DataAliases.SfdcPageLayout ],
        category: SCORE_RULE_CATEGORIES.USER_ADOPTION
    }, {
        id: 65,
        description: 'Page layout with Notes and Attachments related list',
        formula: (d: SfdcPageLayout) => d?.isAttachmentRelatedListIncluded === true,
        errorMessage: `This page layout has the Notes and Attachments related list in it. Please consider using the Files related list instead.`,
        badField: 'isAttachmentRelatedListIncluded',
        applicable: [ DataAliases.SfdcPageLayout ],
        category: SCORE_RULE_CATEGORIES.USER_ADOPTION
    }, {
        id: 66,
        description: 'Custom profile with low number of active members',
        formula: (d: SfdcProfile) => d?.isCustom === true && d?.memberCounts <= 10,
        errorMessage: `This custom profile has a low number of active members (<= 10). Maybe you should review its use in your org...`,
        badField: 'memberCounts',
        applicable: [ DataAliases.SfdcProfile ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 67,
        description: 'Custom permission set with low number of active members and only assigned to empty group(s)',
        formula: (d: SfdcPermissionSet) => d?.isCustom === true && d?.isGroup === false && d?.memberCounts <= 10 && d?.allIncludingGroupsAreEmpty === true,
        errorMessage: `This custom permission set has a low number of active members (<= 10) and is only included in empty permission set groups. Is it on purpose? Maybe you should review its use in your org...`,
        badField: 'allIncludingGroupsAreEmpty',
        applicable: [ DataAliases.SfdcPermissionSet ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 68,
        description: 'Custom permission set group with low number of active members',
        formula: (d: SfdcPermissionSet) => d?.isCustom === true && d?.isGroup === true && d?.memberCounts <= 10,
        errorMessage: `This custom permission set group has a low number of active members (<= 10). Is it empty on purpose? Maybe you should review its use in your org...`,
        badField: 'memberCounts',
        applicable: [ DataAliases.SfdcPermissionSet ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 69,
        description: 'Custom permission set with low number of active members and not even assigned to group',
        formula: (d: SfdcPermissionSet) => d?.isCustom === true && d?.isGroup === false && d?.memberCounts <= 10 && d?.permissionSetGroupIds?.length === 0,
        errorMessage: `This custom permission set has a low number of active members (<= 10) and is not even assigned to a permission set group. Is it on purpose? Maybe you should review its use in your org...`,
        badField: 'memberCounts',
        applicable: [ DataAliases.SfdcPermissionSet ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 70,
        description: 'This browser is considered out-of-date by Salesforce',
        formula: (d: SfdcBrowser) => 
            (d.name === 'Chrome' && d.version < 88) ||
            (d.name === 'Edge' && d.version < 91) ||
            (d.name === 'Firefox' && d.version < 88) ||
            (d.name === 'Safari' && d.version < 14),
        errorMessage: `This browser is considered out-of-date by Salesforce. At this time, we consider the following list: Chrome <88, Edge <91, Firefox <88 and Safari <14. Please work with your user to make them switch to a more recent/supported browser. To identity the users you can go to the setup page "Login History" and export the data to identify them.`,
        badField: 'fullName',
        applicable: [ DataAliases.SfdcBrowser ],
        category: SCORE_RULE_CATEGORIES.USER_ADOPTION
    }, {
        id: 71,
        description: 'This browser is unsupported by Salesforce',
        formula: (d: SfdcBrowser) => d.name === 'IE',
        errorMessage: `This browser is unsupported by Salesforce. At this time, we consider only Internet Explorer whatever its version. Please work with your user to make them switch to a more recent/supported browser. To identity the users you can go to the setup page "Login History" and export the data to identify them.`,
        badField: 'name',
        applicable: [ DataAliases.SfdcBrowser ],
        category: SCORE_RULE_CATEGORIES.USER_ADOPTION
    }, {
        id: 72,
        description: 'User is logging directly without MFA',
        formula: (d: SfdcUser) => d.nbDirectLoginsWithoutMFA > 0 && d.hasMfaByPass !== true,
        errorMessage: `This user is logging in directly to Salesforce without using MFA (Multi-Factor Authentication). And this user has not the MFA bypass enabled. Please work with your user to make them use MFA for better security.`,
        badField: 'nbDirectLoginsWithoutMFA',
        applicable: [ DataAliases.SfdcUser ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 73,
        description: 'Lightning page with Notes and Attachments related list',
        formula: (d: SfdcLightningPage) => d?.isAttachmentRelatedListIncluded === true,
        errorMessage: `This lightning page has the Notes and Attachments related list in it. Please consider using the Files related list instead.`,
        badField: 'isAttachmentRelatedListIncluded',
        applicable: [ DataAliases.SfdcLightningPage ],
        category: SCORE_RULE_CATEGORIES.USER_ADOPTION
    } , {
        id: 74,
        description: 'User with debug mode enabled',
        formula: (d: SfdcUser) => d?.hasDebugMode === true,
        errorMessage: `This user has the debug mode enabled. Please disable it for better performance and user adoption.`,
        badField: 'hasDebugMode',
        applicable: [ DataAliases.SfdcUser ],
        category: SCORE_RULE_CATEGORIES.USER_ADOPTION
    },
    // Lightning Flow Scanner Rules (IDs 100-125)  
    {
        id: 100,
        description: '[LFS] Inactive Flow',
        formula: (d: SfdcFlow) => d?.currentVersionRef?.lfsViolations?.includes('InactiveFlow') || false,
        errorMessage: `This flow is inactive. Consider activating it or removing it from your org.`,
        badField: 'currentVersionRef.lfsViolations',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 101,
        description: '[LFS] Process Builder',
        formula: (d: SfdcFlow) => d?.currentVersionRef?.lfsViolations?.includes('ProcessBuilder') || false,
        errorMessage: `Time to migrate this process builder to flow!`,
        badField: 'currentVersionRef.lfsViolations',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 102,
        description: '[LFS] Missing Flow Description',
        formula: (d: SfdcFlow) => d?.currentVersionRef?.lfsViolations?.includes('FlowDescription') || false,
        errorMessage: `This flow does not have a description. Add documentation about its purpose and usage.`,
        badField: 'currentVersionRef.lfsViolations',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.DOCUMENTATION
    }, {
        id: 103,
        description: '[LFS] Outdated API Version',
        formula: (d: SfdcFlow) => d?.currentVersionRef?.lfsViolations?.includes('APIVersion') || false,
        errorMessage: `The API version of this flow is outdated. Update it to the newest version.`,
        badField: 'currentVersionRef.lfsViolations',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.API_VERSION
    }, {
        id: 104,
        description: '[LFS] Unsafe Running Context',
        formula: (d: SfdcFlow) => d?.currentVersionRef?.lfsViolations?.includes('UnsafeRunningContext') || false,
        errorMessage: `This flow runs in System Mode without Sharing, which can lead to unsafe data access.`,
        badField: 'currentVersionRef.lfsViolations',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.SECURITY
    }, {
        id: 105,
        description: '[LFS] SOQL Query In Loop',
        formula: (d: SfdcFlow) => d?.currentVersionRef?.lfsViolations?.includes('SOQLQueryInLoop') || false,
        errorMessage: `This flow has SOQL queries inside loops. Consolidate queries at the end of the flow to avoid governor limits.`,
        badField: 'currentVersionRef.lfsViolations',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 106,
        description: '[LFS] DML Statement In Loop',
        formula: (d: SfdcFlow) => d?.currentVersionRef?.lfsViolations?.includes('DMLStatementInLoop') || false,
        errorMessage: `This flow has DML operations inside loops. Consolidate DML at the end to avoid governor limits.`,
        badField: 'currentVersionRef.lfsViolations',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 107,
        description: '[LFS] Action Calls In Loop',
        formula: (d: SfdcFlow) => d?.currentVersionRef?.lfsViolations?.includes('ActionCallsInLoop') || false,
        errorMessage: `This flow has action calls inside loops. Bulkify apex calls using collection variables.`,
        badField: 'currentVersionRef.lfsViolations',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 108,
        description: '[LFS] Hardcoded Id',
        formula: (d: SfdcFlow) => d?.currentVersionRef?.lfsViolations?.includes('HardcodedId') || false,
        errorMessage: `This flow contains hardcoded IDs which are org-specific. Use variables or merge fields instead.`,
        badField: 'currentVersionRef.lfsViolations',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.HARDCODED_ID
    }, {
        id: 109,
        description: '[LFS] Hardcoded Url',
        formula: (d: SfdcFlow) => d?.currentVersionRef?.lfsViolations?.includes('HardcodedUrl') || false,
        errorMessage: `This flow contains hardcoded URLs. Use $API formulas or custom labels instead.`,
        badField: 'currentVersionRef.lfsViolations',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.HARDCODED_URL
    }, {
        id: 110,
        description: '[LFS] Missing Null Handler',
        formula: (d: SfdcFlow) => d?.currentVersionRef?.lfsViolations?.includes('MissingNullHandler') || false,
        errorMessage: `This flow has Get Records operations without null checks. Use decision elements to validate results.`,
        badField: 'currentVersionRef.lfsViolations',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 111,
        description: '[LFS] Missing Fault Path',
        formula: (d: SfdcFlow) => d?.currentVersionRef?.lfsViolations?.includes('MissingFaultPath') || false,
        errorMessage: `This flow has DML or action operations without fault handlers. Add fault paths for better error handling.`,
        badField: 'currentVersionRef.lfsViolations',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 112,
        description: '[LFS] Recursive After Update',
        formula: (d: SfdcFlow) => d?.currentVersionRef?.lfsViolations?.includes('RecursiveAfterUpdate') || false,
        errorMessage: `This after-update flow modifies the same record that triggered it, risking recursion. Use before-save flows instead.`,
        badField: 'currentVersionRef.lfsViolations',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 113,
        description: '[LFS] Duplicate DML Operation',
        formula: (d: SfdcFlow) => d?.currentVersionRef?.lfsViolations?.includes('DuplicateDMLOperation') || false,
        errorMessage: `This flow allows navigation back after DML operations, which may cause duplicate changes.`,
        badField: 'currentVersionRef.lfsViolations',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 114,
        description: '[LFS] Get Record All Fields',
        formula: (d: SfdcFlow) => d?.currentVersionRef?.lfsViolations?.includes('GetRecordAllFields') || false,
        errorMessage: `This flow uses Get Records with "all fields". Specify only needed fields for better performance.`,
        badField: 'currentVersionRef.lfsViolations',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 115,
        description: '[LFS] Record ID as String',
        formula: (d: SfdcFlow) => d?.currentVersionRef?.lfsViolations?.includes('RecordIdAsString') || false,
        errorMessage: `This flow uses a String recordId variable. Modern flows can receive the entire record object, eliminating Get Records queries.`,
        badField: 'currentVersionRef.lfsViolations',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 116,
        description: '[LFS] Unconnected Element',
        formula: (d: SfdcFlow) => d?.currentVersionRef?.lfsViolations?.includes('UnconnectedElement') ||  false,
        errorMessage: `This flow has unconnected elements that are not in use. Remove them to maintain clarity.`,
        badField: 'currentVersionRef.lfsViolations',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 117,
        description: '[LFS] Unused Variable',
        formula: (d: SfdcFlow) => d?.currentVersionRef?.lfsViolations?.includes('UnusedVariable') || false,
        errorMessage: `This flow has unused variables. Remove them to maintain efficiency.`,
        badField: 'currentVersionRef.lfsViolations',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.USELESS
    }, {
        id: 118,
        description: '[LFS] Copy API Name',
        formula: (d: SfdcFlow) => d?.currentVersionRef?.lfsViolations?.includes('CopyAPIName') || false,
        errorMessage: `This flow has elements with copy-paste naming patterns like "Copy_X_Of_Element". Update API names for readability.`,
        badField: 'currentVersionRef.lfsViolations',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.DOCUMENTATION
    }, {
        id: 120,
        description: '[LFS] Same Record Field Updates',
        formula: (d: SfdcFlow) => d?.currentVersionRef?.lfsViolations?.includes('SameRecordFieldUpdates') || false,
        errorMessage: `This before-save flow uses Update Records on $Record. Use direct assignment instead for better performance.`,
        badField: 'currentVersionRef.lfsViolations',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 122,
        description: '[LFS] Missing Metadata Description',
        formula: (d: SfdcFlow) => d?.currentVersionRef?.lfsViolations?.includes('MissingMetadataDescription') || false,
        errorMessage: `This flow has elements or variables without descriptions. Add documentation for better maintainability.`,
        badField: 'currentVersionRef.lfsViolations',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.DOCUMENTATION
    }, {
        id: 123,
        description: '[LFS] Missing Filter Record Trigger',
        formula: (d: SfdcFlow) => d?.currentVersionRef?.lfsViolations?.includes('MissingFilterRecordTrigger') || false,
        errorMessage: `This record-triggered flow lacks filters on changed fields or entry conditions, causing unnecessary executions.`,
        badField: 'currentVersionRef.lfsViolations',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 124,
        description: '[LFS] Transform Instead of Loop',
        formula: (d: SfdcFlow) => d?.currentVersionRef?.lfsViolations?.includes('TransformInsteadOfLoop') || false,
        errorMessage: `This flow uses Loop + Assignment which could be replaced with Transform element (10x faster).`,
        badField: 'currentVersionRef.lfsViolations',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.CODE_QUALITY
    }, {
        id: 125,
        description: '[LFS] Missing Auto Layout',
        formula: (d: SfdcFlow) => d?.currentVersionRef?.lfsViolations?.includes('AutoLayout') || false,
        errorMessage: `This flow doesn't use Auto-Layout mode. Enable it to keep your flow organized automatically.`,
        badField: 'currentVersionRef.lfsViolations',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.USER_ADOPTION
    },
    { 
        id: 126,
        description: 'Not referenced anywhere for flow (excluding Screen Flows)',
        formula: (d: SfdcFlow) => d?.isScreenFlow === false &&d?.dependencies?.hadError === false && IS_EMPTY(d.dependencies?.referenced), 
        errorMessage: `This flow is not referenced anywhere (as we were told by the Dependency API). Please review the need to keep it in your org.`,
        badField: 'dependencies.referenced?.length',
        applicable: [ DataAliases.SfdcFlow ],
        category: SCORE_RULE_CATEGORIES.DEPENDENCY
    }
];
Object.freeze(ALL_SCORE_RULES);

/**
 * @description Map used to get a rule direclty from its ID (we don't want to expose the map don't need to freeze it)
 * @type {Map<number, ScoreRule>}
 * @private
 */
const ALL_SCORE_RULES_BY_ID: Map<number, ScoreRule> = new Map(ALL_SCORE_RULES.map(i => [ i.id, i ]));

/**
 * @description In Org Check, there are two main ingredients for our secret sauce: the score rules and 
 *                  the current api version of an org. Of course this secret sauce object is unmutable.
 * @public
 */
export class SecretSauce {

    /**
     * @description Returns an unmutable list of all score rules.
     * @returns {ScoreRule[]} List of score rules
     * @static
     * @readonly
     */
    static get AllScoreRules(): ScoreRule[] { return ALL_SCORE_RULES; }

    /**
     * @description Returns an unmutable array of score rules only related to hardcoded urls.
     * @returns {ScoreRule[]} Score rues only related to hardcoded urls
     * @static
     * @readonly
     */
    static GetScoreRulesForHardCodedURLs(): ScoreRule[] { return ALL_SCORE_RULES.filter(r => r.category === SCORE_RULE_CATEGORIES.HARDCODED_URL); }

    /**
     * @description Returns an unmutable score rule given its id.
     * @param {number} id - The ID of the score rule to retrieve.
     * @returns {ScoreRule} The score rule given its id
     * @static
     * @readonly
     */
    static GetScoreRule(id: number): ScoreRule { 
        const rule = ALL_SCORE_RULES_BY_ID.get(id); 
        if (rule === undefined) {
            throw new Error(`Couldn't find the rule #${id}`)
        }
        return rule;
    }

    /**
     * @description Returns the description of a given rule from its id.
     * @param {number} id - The ID of the score rule.
     * @returns {string} Description of the given rule
     * @static
     * @readonly
     */
    static GetScoreRuleDescription(id: number): string { return ALL_SCORE_RULES_BY_ID.get(id)?.description ?? 'N/A'; }

    /**
     * @description Returns the "potential" latest API version that a production org and non preview org can have
     * @returns {number} Api Version to use
     * @static
     * @readonly
     */
    static get CurrentApiVersion(): number { return GET_LATEST_API_VERSION(); }
}
Object.freeze(SecretSauce);
