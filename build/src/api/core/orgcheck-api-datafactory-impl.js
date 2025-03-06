import { Data, DataWithDependencies, DataWithoutScoring } from './orgcheck-api-data';
import { SFDC_ApexClass } from '../data/orgcheck-api-data-apexclass';
import { SFDC_ApexTrigger } from '../data/orgcheck-api-data-apextrigger';
import { SFDC_CustomLabel } from '../data/orgcheck-api-data-customlabel';
import { SFDC_Field } from '../data/orgcheck-api-data-field';
import { SFDC_Flow } from '../data/orgcheck-api-data-flow';
import { SFDC_Group } from '../data/orgcheck-api-data-group';
import { SFDC_LightningAuraComponent } from '../data/orgcheck-api-data-lightningauracomponent';
import { SFDC_LightningPage } from '../data/orgcheck-api-data-lightningpage';
import { SFDC_LightningWebComponent } from '../data/orgcheck-api-data-lightningwebcomponent';
import { SFDC_PermissionSet } from '../data/orgcheck-api-data-permissionset';
import { SFDC_Profile } from '../data/orgcheck-api-data-profile';
import { SFDC_ProfilePasswordPolicy } from '../data/orgcheck-api-data-profilepasswordpolicy';
import { SFDC_ProfileRestrictions } from '../data/orgcheck-api-data-profilerestrictions';
import { SFDC_User } from '../data/orgcheck-api-data-user';
import { SFDC_UserRole } from '../data/orgcheck-api-data-userrole';
import { SFDC_VisualForceComponent } from '../data/orgcheck-api-data-visualforcecomponent';
import { SFDC_VisualForcePage } from '../data/orgcheck-api-data-visualforcepage';
import { SFDC_Workflow } from '../data/orgcheck-api-data-workflow.js';
import { SFDC_ValidationRule } from '../data/orgcheck-api-data-validationrule';
import { SFDC_RecordType } from '../data/orgcheck-api-data-recordtype';
import { SFDC_Limit } from '../data/orgcheck-api-data-limit';
import { SFDC_FieldSet } from '../data/orgcheck-api-data-fieldset';
import { SalesforceManagerIntf } from './orgcheck-api-salesforcemanager';
import { DataDependenciesFactory } from './orgcheck-api-data-dependencies-factory';
import { DataFactoryIntf, ScoreRule, DataFactoryInstanceIntf } from './orgcheck-api-datafactory';
import { SFDC_PermissionSetLicense } from '../data/orgcheck-api-data-permissionsetlicense';

/**
 * @description Checks if an instance extends a specific class (not necessary the direct class)
 * @param {any} instanceClass
 * @param {any} masterClass
 * @returns true if the given instance estends somehow the given class
 * @private
 */
const IS_CLASS_EXTENDS = (instanceClass, masterClass) => { 
    return Object.prototype.isPrototypeOf.call(masterClass, instanceClass);
}

/**
 * @description Checks if the difference bewteen the given current version and the api version is more than three years (or more if specified)
 * @param {any} currentVersion set for a specific item like VFP, apex class, etc.
 * @param {any} version used by the api (should be the latest)
 * @param {number} [definition_of_old=3] Definition of "old" in years (three years by default)
 * @returns true if the given current version is said too old, false otherwise.
 * @private
 */
const IS_OLD_APIVERSION = (currentVersion, version, definition_of_old = 3) => { 
    if (version && currentVersion && definition_of_old) return ((currentVersion - version) / 3) >= definition_of_old; 
    return false;
}

/**
 * @description Checks if a given value is "empty". The value can be a string or an Array.
 * @param {Array | string} value
 * @returns true if the value is empty. false otherwise
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
 * @description Data factory implementation
 * @public
 */
export class DataFactory extends DataFactoryIntf {

    /**
     * @description List of all Org Check "score rules" to apply in Org Check
     * @type {Array<ScoreRule>}
     * @private
     */
    _allScoreRules;
    
    /**
     * @description Map of all factory instances given their "SFDC_*"" class
     * @type {Map}
     * @private
     */
    _instances;

    /**
     * @description Constructor
     * @param {SalesforceManagerIntf} sfdcManager 
     * @public
     */
    constructor(sfdcManager) {
        super();

        const currentApiVersion = sfdcManager.apiVersion;

        let counter = 0;
        this._allScoreRules = [
            { 
                id: counter++,
                description: 'Not referenced anywhere',
                formula: (/** @type {SFDC_CustomLabel | SFDC_Flow | SFDC_LightningPage | SFDC_LightningAuraComponent | SFDC_LightningWebComponent | SFDC_VisualForceComponent | SFDC_VisualForcePage} */ d) => d.dependencies?.hadError === false && IS_EMPTY(d.dependencies?.referenced), 
                errorMessage: 'This component is not referenced anywhere (as we were told by the Dependency API). Please review the need to keep it in your org.',
                badField: 'dependencies.referenced.length',
                applicable: [ SFDC_CustomLabel, SFDC_Flow, SFDC_LightningPage, SFDC_LightningAuraComponent, SFDC_LightningWebComponent, SFDC_VisualForceComponent, SFDC_VisualForcePage ]
            }, {
                id: counter++,
                description: 'No reference anywhere for custom field',
                formula: (/** @type {SFDC_Field} */ d) => d.isCustom === true && d.dependencies?.hadError === false && IS_EMPTY(d.dependencies?.referenced), 
                errorMessage: 'This custom field is not referenced anywhere (as we were told by the Dependency API). Please review the need to keep it in your org.',
                badField: 'dependencies.referenced.length',
                applicable: [ SFDC_Field ]
            }, {
                id: counter++,
                description: 'No reference anywhere for apex class',
                formula: (/** @type {SFDC_ApexClass} */ d) => d.isTest === false && d.dependencies?.hadError === false && IS_EMPTY(d.dependencies?.referenced), 
                errorMessage: 'This apex class is not referenced anywhere (as we were told by the Dependency API). Please review the need to keep it in your org.',
                badField: 'dependencies.referenced.length',
                applicable: [ SFDC_ApexClass ]
            }, {
                id: counter++,
                description: 'Sorry, we had an issue with the Dependency API to gather the dependencies of this item',
                formula: (/** @type {DataWithDependencies} */ d) => d.dependencies && d.dependencies.hadError === true, 
                errorMessage: 'Sorry, we had an issue with the Dependency API to gather the dependencies of this item.',
                badField: 'dependencies.referenced.length',
                applicable: [ SFDC_Field, SFDC_ApexClass, SFDC_CustomLabel, SFDC_Flow, SFDC_LightningPage, SFDC_LightningAuraComponent, SFDC_LightningWebComponent, SFDC_VisualForceComponent, SFDC_VisualForcePage ]
            }, {
                id: counter++,
                description: 'API Version too old',
                formula: (/** @type {SFDC_ApexClass | SFDC_ApexTrigger | SFDC_Flow | SFDC_LightningAuraComponent | SFDC_LightningWebComponent | SFDC_VisualForcePage | SFDC_VisualForceComponent} */ d) => IS_OLD_APIVERSION(currentApiVersion, d.apiVersion),
                errorMessage: 'The API version of this component is too old. Please update it to a newest version.',
                badField: 'apiVersion',
                applicable: [ SFDC_ApexClass, SFDC_ApexTrigger, SFDC_Flow, SFDC_LightningAuraComponent, SFDC_LightningWebComponent, SFDC_VisualForcePage, SFDC_VisualForceComponent ]
            }, {
                id: counter++,
                description: 'No assert in this Apex Test',
                formula: (/** @type {SFDC_ApexClass} */ d) => d.isTest === true && d.nbSystemAsserts === 0,
                errorMessage: 'This apex test does not contain any assert! Best practices force you to define asserts in tests.',
                badField: 'nbSystemAsserts',
                applicable: [ SFDC_ApexClass ]
            }, {
                id: counter++,
                description: 'No description',
                formula: (/** @type {SFDC_Flow | SFDC_LightningPage | SFDC_LightningAuraComponent | SFDC_LightningWebComponent | SFDC_VisualForcePage | SFDC_VisualForceComponent | SFDC_Workflow | SFDC_FieldSet | SFDC_ValidationRule} */ d) => IS_EMPTY(d.description),
                errorMessage: 'This component does not have a description. Best practices force you to use the Description field to give some informative context about why and how it is used/set/govern.',
                badField: 'description',
                applicable: [ SFDC_Flow, SFDC_LightningPage, SFDC_LightningAuraComponent, SFDC_LightningWebComponent, SFDC_VisualForcePage, SFDC_VisualForceComponent, SFDC_Workflow, SFDC_FieldSet, SFDC_ValidationRule ]
            }, {
                id: counter++,
                description: 'No description for custom component',
                formula: (/** @type {SFDC_Field | SFDC_PermissionSet | SFDC_Profile} */ d) => d.isCustom === true && IS_EMPTY(d.description),
                errorMessage: 'This custom component does not have a description. Best practices force you to use the Description field to give some informative context about why and how it is used/set/govern.',
                badField: 'description',
                applicable: [ SFDC_Field, SFDC_PermissionSet, SFDC_Profile ]
            }, {
                id: counter++,
                description: 'No explicit sharing in apex class',
                formula: (/** @type {SFDC_ApexClass} */ d) => d.isTest === false && d.isClass === true && !d.specifiedSharing,
                errorMessage: 'This Apex Class does not specify a sharing model. Best practices force you to specify with, without or inherit sharing to better control the visibility of the data you process in Apex.',
                badField: 'specifiedSharing',
                applicable: [ SFDC_ApexClass ]
            }, {
                id: counter++,
                description: 'Schedulable should be scheduled',
                formula: (/** @type {SFDC_ApexClass} */ d) => d.isScheduled === false && d.isSchedulable === true,
                errorMessage: 'This Apex Class implements Schedulable but is not scheduled. What is the point? Is this class still necessary?',
                badField: 'isScheduled',
                applicable: [ SFDC_ApexClass ]
            }, {
                id: counter++,
                description: 'Not able to compile class',
                formula: (/** @type {SFDC_ApexClass} */ d) => d.needsRecompilation === true,
                errorMessage: 'This Apex Class can not be compiled for some reason. You should try to recompile it. If the issue remains you need to consider refactorying this class or the classes that it is using.',
                badField: 'name',
                applicable: [ SFDC_ApexClass ]
            }, {
                id: counter++,
                description: 'No coverage for this class',
                formula: (/** @type {SFDC_ApexClass} */ d) => d.isTest === false && (isNaN(d.coverage) || !d.coverage),
                errorMessage: 'This Apex Class does not have any code coverage. Consider launching the corresponding tests that will bring some coverage. If you do not know which test to launch just run them all!',
                badField: 'coverage',
                applicable: [ SFDC_ApexClass ]
            }, {
                id: counter++,
                description: 'Coverage not enough',
                formula: (/** @type {SFDC_ApexClass} */ d) => d.coverage > 0 && d.coverage < 0.75,
                errorMessage: 'This Apex Class does not have enough code coverage (less than 75% of lines are covered by successful unit tests). Maybe you ran not all the unit tests to cover this class entirely? If you did, then consider augmenting that coverage with new test methods.',
                badField: 'coverage',
                applicable: [ SFDC_ApexClass ]
            }, {
                id: counter++,
                description: 'At least one testing method failed',
                formula: (/** @type {SFDC_ApexClass} */ d) => d.isTest === true && d.testFailedMethods && d.testFailedMethods.length > 0,
                errorMessage: 'This Apex Test Class has at least one failed method.',
                badField: 'testFailedMethods',
                applicable: [ SFDC_ApexClass ]
            }, {
                id: counter++,
                description: 'Apex trigger should not contain SOQL statement',
                formula: (/** @type {SFDC_ApexTrigger} */ d) => d.hasSOQL === true,
                errorMessage: 'This Apex Trigger contains at least one SOQL statement. Best practices force you to move any SOQL statement in dedicated Apex Classes that you would call from the trigger. Please update the code accordingly.',
                badField: 'hasSOQL',
                applicable: [ SFDC_ApexTrigger ]
            }, {
                id: counter++,
                description: 'Apex trigger should not contain DML action',
                formula: (/** @type {SFDC_ApexTrigger} */ d) => d.hasDML === true,
                errorMessage: 'This Apex Trigger contains at least one DML action. Best practices force you to move any DML action in dedicated Apex Classes that you would call from the trigger. Please update the code accordingly.',
                badField: 'hasDML',
                applicable: [ SFDC_ApexTrigger ]
            }, {
                id: counter++,
                description: 'Apex Trigger should not contain logic',
                formula: (/** @type {SFDC_ApexTrigger} */ d) => d.length > 5000,
                errorMessage: 'Due to the massive number of source code (more than 5000 characters) in this Apex Trigger, we suspect that it contains logic. Best practices force you to move any logic in dedicated Apex Classes that you would call from the trigger. Please update the code accordingly.',
                badField: 'length',
                applicable: [ SFDC_ApexTrigger ]
            }, {
                id: counter++,
                description: 'No direct member for this group',
                formula: (/** @type {SFDC_Group} */ d) => !d.nbDirectMembers || d.nbDirectMembers === 0,
                errorMessage: 'This public group (or queue) does not contain any direct members (users or sub groups). Is it empty on purpose? Maybe you should review its use in your org...',
                badField: 'nbDirectMembers',
                applicable: [ SFDC_Group ]
            }, {
                id: counter++,
                description: 'Custom permset or profile with no member',
                formula: (/** @type {SFDC_PermissionSet | SFDC_Profile} */ d) => d.isCustom === true && d.memberCounts === 0,
                errorMessage: 'This custom permission set (or custom profile) has no members. Is it empty on purpose? Maybe you should review its use in your org...',
                badField: 'memberCounts',
                applicable: [ SFDC_PermissionSet, SFDC_Profile ]
            }, {
                id: counter++,
                description: 'Role with no active users',
                formula: (/** @type {SFDC_UserRole} */ d) => d.activeMembersCount === 0,
                errorMessage: 'This role has no active users assigned to it. Is it on purpose? Maybe you should review its use in your org...',
                badField: 'activeMembersCount',
                applicable: [ SFDC_UserRole ]
            }, {
                id: counter++,
                description: 'Active user not under LEX',
                formula: (/** @type {SFDC_User} */ d) => d.onLightningExperience === false,
                errorMessage: 'This user is still using Classic. Time to switch to Lightning for all your users, don\'t you think?',
                badField: 'onLightningExperience',
                applicable: [ SFDC_User ]
            }, {
                id: counter++,
                description: 'Active user never logged',
                formula: (/** @type {SFDC_User} */ d) => d.lastLogin === null,
                errorMessage: 'This active user never logged yet. Time to optimize your licence cost!',
                badField: 'lastLogin',
                applicable: [ SFDC_User ]
            }, {
                id: counter++,
                description: 'Workflow with no action',
                formula: (/** @type {SFDC_Workflow} */ d) => d.hasAction === false,
                errorMessage: 'This workflow has no action, please review it and potentially remove it.',
                badField: 'hasAction',
                applicable: [ SFDC_Workflow ]
            }, {
                id: counter++,
                description: 'Workflow with empty time triggered list',
                formula: (/** @type {SFDC_Workflow} */ d) => d.emptyTimeTriggers.length > 0,
                errorMessage: 'This workflow is time triggered but with no time triggered action, please review it.',
                badField: 'emptyTimeTriggers',
                applicable: [ SFDC_Workflow ]
            }, {
                id: counter++,
                description: 'Password policy with question containing password!',
                formula: (/** @type {SFDC_ProfilePasswordPolicy} */ d) => d.passwordQuestion === true,
                errorMessage: 'This profile password policy allows to have password in the question! Please change that setting as it is clearly a lack of security in your org!',
                badField: 'passwordQuestion',
                applicable: [ SFDC_ProfilePasswordPolicy ]
            }, {
                id: counter++,
                description: 'Password policy with too big expiration',
                formula: (/** @type {SFDC_ProfilePasswordPolicy} */ d) => d.passwordExpiration > 90,
                errorMessage: 'This profile password policy allows to have password that expires after 90 days. Please consider having a shorter period of time for expiration if you policy.',
                badField: 'passwordExpiration',
                applicable: [ SFDC_ProfilePasswordPolicy ]
            }, {
                id: counter++,
                description: 'Password policy with no expiration',
                formula: (/** @type {SFDC_ProfilePasswordPolicy} */ d) => d.passwordExpiration === 0,
                errorMessage: 'This profile password policy allows to have password that never expires. Why is that? Do you have this profile for technical users? Please reconsider this setting and use JWT authentication instead for technical users.',
                badField: 'passwordExpiration',
                applicable: [ SFDC_ProfilePasswordPolicy ]
            }, {
                id: counter++,
                description: 'Password history too small',
                formula: (/** @type {SFDC_ProfilePasswordPolicy} */ d) => d.passwordHistory < 3,
                errorMessage: 'This profile password policy allows users to set their password with a too-short memory. For example, they can keep on using the same different password everytime you ask them to change it. Please increase this setting.',
                badField: 'passwordHistory',
                applicable: [ SFDC_ProfilePasswordPolicy ]
            }, {
                id: counter++,
                description: 'Password minimum size too small',
                formula: (/** @type {SFDC_ProfilePasswordPolicy} */ d) => d.minimumPasswordLength < 8,
                errorMessage: 'This profile password policy allows users to set passwords with less than 8 charcaters. That minimum length is not strong enough. Please increase this setting.',
                badField: 'minimumPasswordLength',
                applicable: [ SFDC_ProfilePasswordPolicy ]
            }, {
                id: counter++,
                description: 'Password complexity too weak',
                formula: (/** @type {SFDC_ProfilePasswordPolicy} */ d) => d.passwordComplexity < 3,
                errorMessage: 'This profile password policy allows users to set too-easy passwords. The complexity you choose is not storng enough. Please increase this setting.',
                badField: 'passwordComplexity',
                applicable: [ SFDC_ProfilePasswordPolicy ]
            }, {
                id: counter++,
                description: 'No max login attempts set',
                formula: (/** @type {SFDC_ProfilePasswordPolicy} */ d) => d.maxLoginAttempts === undefined,
                errorMessage: 'This profile password policy allows users to try infinitely to log in without locking the access. Please review this setting.',
                badField: 'passwordExpiration',
                applicable: [ SFDC_ProfilePasswordPolicy ]
            }, {
                id: counter++,
                description: 'No lockout period set',
                formula: (/** @type {SFDC_ProfilePasswordPolicy} */ d) => d.lockoutInterval === undefined,
                errorMessage: 'This profile password policy does not set a value for any locked out period. Please review this setting.',
                badField: 'lockoutInterval',
                applicable: [ SFDC_ProfilePasswordPolicy ]
            }, {
                id: counter++,
                description: 'IP Range too large',
                formula: (/** @type {SFDC_ProfileRestrictions} */ d) => d.ipRanges.filter(i => i.difference > 100000).length > 0,
                errorMessage: 'This profile includes an IP range that is to wide (more than 100.000 IP addresses!). If you set an IP Range it should be not that large. You could split that range into multiple ones. The risk is that you include an IP that is not part of your company. Please review this setting.',
                badField: 'ipRanges',
                applicable: [ SFDC_ProfileRestrictions ]
            }, {
                id: counter++,
                description: 'Login hours too large',
                formula: (/** @type {SFDC_ProfileRestrictions} */ d) => d.loginHours.filter(i => i.difference > 1200).length > 0,
                errorMessage: 'This profile includes a login hour that is to wide (more than 20 hours a day!). If you set a login hour it should reflect the reality. Please review this setting.',
                badField: 'loginHours',
                applicable: [ SFDC_ProfileRestrictions ]
            }, {
                id: counter++,
                description: 'Inactive component',
                formula: (/** @type {SFDC_ValidationRule | SFDC_RecordType | SFDC_ApexTrigger | SFDC_Workflow} */ d) => d.isActive === false,
                errorMessage: 'This component is inactive, so why do not you just remove it from your org?',
                badField: 'isActive',
                applicable: [ SFDC_ValidationRule, SFDC_RecordType, SFDC_ApexTrigger, SFDC_Workflow ]
            }, {
                id: counter++,
                description: 'No active version for this flow',
                formula: (/** @type {SFDC_Flow} */ d) => d.isVersionActive === false,
                errorMessage: 'This flow does not have an active version, did you forgot to activate its latest version? or you do not need that flow anymore?',
                badField: 'isVersionActive',
                applicable: [ SFDC_Flow ]
            }, {
                id: counter++,
                description: 'Too many versions under this flow',
                formula: (/** @type {SFDC_Flow} */ d) => d.versionsCount > 7,
                errorMessage: 'This flow has more than seven versions. Maybe it is time to do some cleaning in this flow!',
                badField: 'versionsCount',
                applicable: [ SFDC_Flow ]
            }, {
                id: counter++,
                description: 'Migrate this process builder',
                formula: (/** @type {SFDC_Flow} */ d) => d.currentVersionRef?.type === 'Workflow',
                errorMessage: 'Time to migrate this process builder to flow!',
                badField: 'name',
                applicable: [ SFDC_Flow ]
            }, {
                id: counter++,
                description: 'No description for the current version of a flow',
                formula: (/** @type {SFDC_Flow} */ d) => IS_EMPTY(d.currentVersionRef?.description),
                errorMessage: `This flow's current version does not have a description. Best practices force you to use the Description field to give some informative context about why and how it is used/set/govern.`,
                badField: 'currentVersionRef.description',
                applicable: [ SFDC_Flow ]
            }, {
                id: counter++,
                description: 'API Version too old for the current version of a flow',
                formula: (/** @type {SFDC_Flow} */ d) => IS_OLD_APIVERSION(currentApiVersion, d.currentVersionRef?.apiVersion),
                errorMessage: `The API version of this flow's current version is too old. Please update it to a newest version.`,
                badField: 'currentVersionRef.apiVersion',
                applicable: [ SFDC_Flow ]
            }, {
                id: counter++,
                description: 'This flow is running without sharing',
                formula: (/** @type {SFDC_Flow} */ d) => d.currentVersionRef?.runningMode === 'SystemModeWithoutSharing',
                errorMessage: `The running mode of this version without sharing. With great power comes great responsabilities. Please check if this is REALLY needed.`,
                badField: 'currentVersionRef.runningMode',
                applicable: [ SFDC_Flow ]
            }, {
                id: counter++,
                description: 'Too many nodes in this version',
                formula: (/** @type {SFDC_Flow} */ d) => d.currentVersionRef?.totalNodeCount > 100,
                errorMessage: `There are more than one hundred of nodes in this flow. Please consider using Apex? or cut it into multiple sub flows?`,
                badField: 'currentVersionRef.totalNodeCount',
                applicable: [ SFDC_Flow ]
            }, {
                id: counter++,
                description: 'Near the limit',
                formula: (/** @type {SFDC_Limit} */ d) => d.usedPercentage >= 0.80,
                errorMessage: 'This limit is almost reached (>80%). Please review this.',
                badField: 'usedPercentage',
                applicable: [ SFDC_Limit ]
            }, {
                id: counter++,
                description: 'Almost all licenses are used',
                formula: (/** @type {SFDC_PermissionSetLicense} */ d) => d.usedPercentage !== undefined && d.usedPercentage >= 0.80,
                errorMessage: 'The number of seats for this license is almost reached (>80%). Please review this.',
                badField: 'usedPercentage',
                applicable: [ SFDC_PermissionSetLicense ]
            }, {
                id: counter++,
                description: 'You could have licenses to free up',
                formula: (/** @type {SFDC_PermissionSetLicense} */ d) => d.remainingCount > 0 && d.distinctActiveAssigneeCount !==  d.usedCount,
                errorMessage: 'The Used count from that permission set license does not match the number of disctinct active user assigned to the same license. Please check if you could free up some licenses!',
                badField: 'distinctActiveAssigneeCount',
                applicable: [ SFDC_PermissionSetLicense ]
            }
        ];
        Object.freeze(this._allScoreRules); 
        this._instances = new Map();
    }

    /**
     * @see DataFactoryIntf.getScoreRule
     * @param {number} id
     * @returns {ScoreRule}
     */
    getScoreRule(id) {
        return this._allScoreRules[id];
    }

    /**
     * @see DataFactoryIntf.getAllScoreRules
     * @returns {Array<ScoreRule>} Information about score rules
     */
    getAllScoreRules() { 
        return this._allScoreRules;
    }

    /**
     * @see DataFactoryIntf.getInstance
     * @param {any} dataClass 
     * @returns {DataFactoryInstanceIntf}
     */
    getInstance(dataClass) {
        const isDataWithScoring = IS_CLASS_EXTENDS(dataClass, Data);
        const isDataWithDependencies = IS_CLASS_EXTENDS(dataClass, DataWithDependencies);
        const isDataWithoutScoring = IS_CLASS_EXTENDS(dataClass, DataWithoutScoring);
        // Checking dataClass
        if (isDataWithScoring === false && isDataWithoutScoring === false && isDataWithDependencies === false) {
            throw new TypeError('Given dataClass does not extends Data nor DataWithDependencies nor DataWithoutScoring');
        }
        // If this dataClass was never asked before, create it and store it in the cache
        if (this._instances.has(dataClass) === false) {
            this._instances.set(dataClass, new DataFactoryInstance(
                dataClass, 
                isDataWithScoring ? this._allScoreRules.filter(v => v.applicable?.includes(dataClass)) : [], 
                isDataWithDependencies
            ));
        }
        // Return the instance
        return this._instances.get(dataClass);
    }
}

/**
 * @description Data factory for a given data class
 * @public
 */
export class DataFactoryInstance extends DataFactoryInstanceIntf {

    /**
     * @type {any} 
     * @private
     */
    _dataClass;

    /**
     * @type {Array<ScoreRule>} 
     * @private
     */
    _scoreRules;

    /**
     * @type {boolean} 
     * @private
     */
    _isDependenciesNeeded;

    /**
     * @description Constructor
     * @param {any} dataClass 
     * @param {Array<ScoreRule>} scoreRules 
     * @param {boolean} isDependenciesNeeded 
     */
    constructor(dataClass, scoreRules, isDependenciesNeeded) {
        super();
        this._dataClass = dataClass;
        this._scoreRules = scoreRules;
        this._isDependenciesNeeded = isDependenciesNeeded;
    }

    /**
     * @description Creates a new instance of the given data class without computing the score
     * @param {any} configuration 
     * @returns {any}
     * @throws if configuration is null or configuration.properties is null
     * @public
     */
    create(configuration) {
        // Checks
        if (!configuration) throw new TypeError("Configuration can't be null.");
        if (!configuration.properties) throw new TypeError("Configuration.properties can't be null.");
        // Create a row from the protofype
        const row = new this._dataClass();
        // Copy properties from configuration.properties to object
        // NB: Please note that ONLY the properties explicitely set in the class will be copied to object
        Object.keys(row).forEach((p) => { row[p] = configuration.properties[p]; });
        // We want to make sure no new property is added to the row (there should be only the ones declared in classes!)
        Object.seal(row);
        // For this type if we have at least one Org Check "score rules", then score is needed
        if (this._scoreRules.length > 0) {
            row.score = 0;
            row.badFields = [];
            row.badReasonIds = [];
        }
        // If dependencies are needed...
        if (this._isDependenciesNeeded === true && configuration.dependencies) {
            row.dependencies = DataDependenciesFactory.create(configuration.dependencies.data, row[configuration.dependencies.idField || 'id']);
        }
        // Return the row finally
        return row;
    }

    /**
     * @description Computes the score on an existing row
     * @param {any} row 
     * @returns {any}
     * @public
     */
    computeScore(row) { 
        this._scoreRules.filter(v => { 
            try { 
                if (v.formula(row) === true) return true;
            } catch (error) { 
                console.error('COMPUTE SCORE', error, row); 
            }
            return false;
        }).forEach(v => {
            row.score++;
            row.badFields.push(v.badField);
            row.badReasonIds.push(v.id);
        });
        return row;
    }

    /**
     * @description Creates a new instance of the given data class AND computes the score
     * @param {any} configuration 
     * @returns {any}
     * @throws if configuration is null or configuration.properties is null
     * @public
     */
    createWithScore(configuration) {
        return this.computeScore(this.create(configuration));
    }
}