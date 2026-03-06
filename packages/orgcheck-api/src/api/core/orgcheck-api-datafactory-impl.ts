import { SFDC_ApexClass, SFDC_ApexTestMethodResult } from 'src/api/data/orgcheck-api-data-apexclass';
import { SFDC_ApexTrigger } from 'src/api/data/orgcheck-api-data-apextrigger';
import { SFDC_Application } from 'src/api/data/orgcheck-api-data-application';
import { SFDC_AppPermission } from 'src/api/data/orgcheck-api-data-apppermission';
import { SFDC_Browser } from 'src/api/data/orgcheck-api-data-browser';
import { SFDC_CollaborationGroup } from 'src/api/data/orgcheck-api-data-collaborationgroup';
import { SFDC_CustomLabel } from 'src/api/data/orgcheck-api-data-customlabel';
import { SFDC_CustomTab } from 'src/api/data/orgcheck-api-data-customtab';
import { SFDC_Dashboard } from 'src/api/data/orgcheck-api-data-dashboard';
import { SFDC_Document } from 'src/api/data/orgcheck-api-data-document';
import { SFDC_EmailTemplate } from 'src/api/data/orgcheck-api-data-emailtemplate';
import { SFDC_Field } from 'src/api/data/orgcheck-api-data-field';
import { SFDC_FieldPermission } from 'src/api/data/orgcheck-api-data-fieldpermission';
import { SFDC_FieldSet } from 'src/api/data/orgcheck-api-data-fieldset';
import { SFDC_Flow, SFDC_FlowVersion } from 'src/api/data/orgcheck-api-data-flow';
import { SFDC_Group } from 'src/api/data/orgcheck-api-data-group';
import { SFDC_HomePageComponent } from 'src/api/data/orgcheck-api-data-homepagecomponent';
import { SFDC_KnowledgeArticle } from 'src/api/data/orgcheck-api-data-knowledgearticle';
import { SFDC_LightningAuraComponent } from 'src/api/data/orgcheck-api-data-lightningauracomponent';
import { SFDC_LightningPage } from 'src/api/data/orgcheck-api-data-lightningpage';
import { SFDC_LightningWebComponent } from 'src/api/data/orgcheck-api-data-lightningwebcomponent';
import { SFDC_Limit } from 'src/api/data/orgcheck-api-data-limit';
import { SFDC_Object } from 'src/api/data/orgcheck-api-data-object';
import { SFDC_ObjectPermission } from 'src/api/data/orgcheck-api-data-objectpermission';
import { SFDC_ObjectRelationShip } from 'src/api/data/orgcheck-api-data-objectrelationship';
import { SFDC_ObjectType } from 'src/api/data/orgcheck-api-data-objecttype';
import { SFDC_Organization } from 'src/api/data/orgcheck-api-data-organization';
import { SFDC_Package } from 'src/api/data/orgcheck-api-data-package';
import { SFDC_PageLayout } from 'src/api/data/orgcheck-api-data-pagelayout';
import { SFDC_PermissionSet } from 'src/api/data/orgcheck-api-data-permissionset';
import { SFDC_PermissionSetLicense } from 'src/api/data/orgcheck-api-data-permissionsetlicense';
import { SFDC_Profile } from 'src/api/data/orgcheck-api-data-profile';
import { SFDC_ProfilePasswordPolicy } from 'src/api/data/orgcheck-api-data-profilepasswordpolicy';
import { SFDC_ProfileIpRangeRestriction, SFDC_ProfileLoginHourRestriction, SFDC_ProfileRestrictions } from 'src/api/data/orgcheck-api-data-profilerestrictions';
import { SFDC_RecordType } from 'src/api/data/orgcheck-api-data-recordtype';
import { SFDC_Report } from 'src/api/data/orgcheck-api-data-report';
import { SFDC_StaticResource } from 'src/api/data/orgcheck-api-data-staticresource';
import { SFDC_User } from 'src/api/data/orgcheck-api-data-user';
import { SFDC_UserRole } from 'src/api/data/orgcheck-api-data-userrole';
import { SFDC_ValidationRule } from 'src/api/data/orgcheck-api-data-validationrule';
import { SFDC_VisualForceComponent } from 'src/api/data/orgcheck-api-data-visualforcecomponent';
import { SFDC_VisualForcePage } from 'src/api/data/orgcheck-api-data-visualforcepage';
import { SFDC_WebLink } from 'src/api/data/orgcheck-api-data-weblink';
import { SFDC_Workflow } from 'src/api/data/orgcheck-api-data-workflow';
import { DataAliases } from 'src/api/core/orgcheck-api-data-aliases';
import { DataDependenciesFactory } from 'src/api/core/orgcheck-api-data-dependencies-factory';
import { DataFactoryIntf, DataFactoryInstanceIntf, ScoreRule, DataFactoryInstanceCreateSetup, DataFactoryInstanceCreateSetup_WithDependencies } from 'src/api/core/orgcheck-api-datafactory';
import { SecretSauce } from 'src/api/core/orgcheck-api-secretsauce';

const DATA_METADATA = new Map([
   [ DataAliases.SFDC_ApexClass , { hasScore: true, hasDependencies: true, caster: (p) => (p as SFDC_ApexClass)}],
   [ DataAliases.SFDC_ApexTestMethodResult , { hasScore: false, hasDependencies: false, caster: (p) => (p as SFDC_ApexTestMethodResult)}],
   [ DataAliases.SFDC_ApexTrigger , { hasScore: true, hasDependencies: true, caster: (p) => (p as SFDC_ApexTrigger)}],
   [ DataAliases.SFDC_Application , { hasScore: false, hasDependencies: false, caster: (p) => (p as SFDC_Application)}],
   [ DataAliases.SFDC_AppPermission , { hasScore: false, hasDependencies: false, caster: (p) => (p as SFDC_AppPermission)}],
   [ DataAliases.SFDC_Browser , { hasScore: true, hasDependencies: false, caster: (p) => (p as SFDC_Browser)}],
   [ DataAliases.SFDC_CollaborationGroup , { hasScore: true, hasDependencies: false, caster: (p) => (p as SFDC_CollaborationGroup)}],
   [ DataAliases.SFDC_CustomLabel , { hasScore: true, hasDependencies: true, caster: (p) => (p as SFDC_CustomLabel)}],
   [ DataAliases.SFDC_CustomTab , { hasScore: true, hasDependencies: true, caster: (p) => (p as SFDC_CustomTab)}],
   [ DataAliases.SFDC_Dashboard , { hasScore: true, hasDependencies: false, caster: (p) => (p as SFDC_Dashboard)}],
   [ DataAliases.SFDC_Document , { hasScore: true, hasDependencies: false, caster: (p) => (p as SFDC_Document)}],
   [ DataAliases.SFDC_EmailTemplate , { hasScore: true, hasDependencies: false, caster: (p) => (p as SFDC_EmailTemplate)}],
   [ DataAliases.SFDC_Field , { hasScore: true, hasDependencies: true, caster: (p) => (p as SFDC_Field)}],
   [ DataAliases.SFDC_FieldPermission , { hasScore: false, hasDependencies: false, caster: (p) => (p as SFDC_FieldPermission)}],
   [ DataAliases.SFDC_FieldSet , { hasScore: true, hasDependencies: false, caster: (p) => (p as SFDC_FieldSet)}],
   [ DataAliases.SFDC_Flow , { hasScore: true, hasDependencies: true, caster: (p) => (p as SFDC_Flow)}],
   [ DataAliases.SFDC_FlowVersion , { hasScore: false, hasDependencies: false, caster: (p) => (p as SFDC_FlowVersion)}],
   [ DataAliases.SFDC_Group , { hasScore: true, hasDependencies: false, caster: (p) => (p as SFDC_Group)}],
   [ DataAliases.SFDC_HomePageComponent , { hasScore: true, hasDependencies: true, caster: (p) => (p as SFDC_HomePageComponent)}],
   [ DataAliases.SFDC_KnowledgeArticle , { hasScore: true, hasDependencies: false, caster: (p) => (p as SFDC_KnowledgeArticle)}],
   [ DataAliases.SFDC_LightningAuraComponent , { hasScore: true, hasDependencies: true, caster: (p) => (p as SFDC_LightningAuraComponent)}],
   [ DataAliases.SFDC_LightningPage , { hasScore: true, hasDependencies: true, caster: (p) => (p as SFDC_LightningPage)}],
   [ DataAliases.SFDC_LightningWebComponent , { hasScore: true, hasDependencies: true, caster: (p) => (p as SFDC_LightningWebComponent)}],
   [ DataAliases.SFDC_Limit , { hasScore: true, hasDependencies: false, caster: (p) => (p as SFDC_Limit)}],
   [ DataAliases.SFDC_Object , { hasScore: true, hasDependencies: false, caster: (p) => (p as SFDC_Object)}],
   [ DataAliases.SFDC_ObjectPermission , { hasScore: true, hasDependencies: false, caster: (p) => (p as SFDC_ObjectPermission)}],
   [ DataAliases.SFDC_ObjectRelationShip , { hasScore: false, hasDependencies: false, caster: (p) => (p as SFDC_ObjectRelationShip)}],
   [ DataAliases.SFDC_ObjectType , { hasScore: false, hasDependencies: false, caster: (p) => (p as SFDC_ObjectType)}],
   [ DataAliases.SFDC_Organization , { hasScore: false, hasDependencies: false, caster: (p) => (p as SFDC_Organization)}],
   [ DataAliases.SFDC_Package , { hasScore: true, hasDependencies: false, caster: (p) => (p as SFDC_Package)}],
   [ DataAliases.SFDC_PageLayout , { hasScore: true, hasDependencies: true, caster: (p) => (p as SFDC_PageLayout)}],
   [ DataAliases.SFDC_PermissionSet , { hasScore: true, hasDependencies: false, caster: (p) => (p as SFDC_PermissionSet)}],
   [ DataAliases.SFDC_PermissionSetLicense , { hasScore: true, hasDependencies: false, caster: (p) => (p as SFDC_PermissionSetLicense)}],
   [ DataAliases.SFDC_Profile , { hasScore: true, hasDependencies: false, caster: (p) => (p as SFDC_Profile)}],
   [ DataAliases.SFDC_ProfileIpRangeRestriction , { hasScore: false, hasDependencies: false, caster: (p) => (p as SFDC_ProfileIpRangeRestriction)}],
   [ DataAliases.SFDC_ProfileLoginHourRestriction , { hasScore: false, hasDependencies: false, caster: (p) => (p as SFDC_ProfileLoginHourRestriction)}],
   [ DataAliases.SFDC_ProfilePasswordPolicy , { hasScore: true, hasDependencies: false, caster: (p) => (p as SFDC_ProfilePasswordPolicy)}],
   [ DataAliases.SFDC_ProfileRestrictions , { hasScore: true, hasDependencies: false, caster: (p) => (p as SFDC_ProfileRestrictions)}],
   [ DataAliases.SFDC_RecordType , { hasScore: true, hasDependencies: false, caster: (p) => (p as SFDC_RecordType)}],
   [ DataAliases.SFDC_Report , { hasScore: true, hasDependencies: false, caster: (p) => (p as SFDC_Report)}],
   [ DataAliases.SFDC_StaticResource , { hasScore: true, hasDependencies: true, caster: (p) => (p as SFDC_StaticResource)}],
   [ DataAliases.SFDC_User , { hasScore: true, hasDependencies: false, caster: (p) => (p as SFDC_User)}],
   [ DataAliases.SFDC_UserRole , { hasScore: true, hasDependencies: false, caster: (p) => (p as SFDC_UserRole)}],
   [ DataAliases.SFDC_ValidationRule , { hasScore: true, hasDependencies: false, caster: (p) => (p as SFDC_ValidationRule)}],
   [ DataAliases.SFDC_VisualForceComponent , { hasScore: true, hasDependencies: true, caster: (p) => (p as SFDC_VisualForceComponent)}],
   [ DataAliases.SFDC_VisualForcePage , { hasScore: true, hasDependencies: true, caster: (p) => (p as SFDC_VisualForcePage)}],
   [ DataAliases.SFDC_WebLink , { hasScore: true, hasDependencies: true, caster: (p) => (p as SFDC_WebLink)}],
   [ DataAliases.SFDC_Workflow , { hasScore: true, hasDependencies: false, caster: (p) => (p as SFDC_Workflow)}]
]);

/**
 * @description Data factory implementation
 * @public
 */
export class DataFactory implements DataFactoryIntf {

    /**
     * @description Map of all factory instances given their "SFDC_*"" class
     * @type {Map<any, DataFactoryInstanceIntf>}
     * @private
     */
    _instances: Map<any, DataFactoryInstanceIntf>;

    /**
     * @description Constructor
     * @public
     */
    constructor() {
        this._instances = new Map();
    }

    /**
     * @description Get the instance of the factiry for a given data alias
     * @see DataFactoryIntf.getInstance
     * @param {DataAliases} dataAlias - The data we want to get the factory instance for
     * @returns {DataFactoryInstanceIntf} Returns the instance of the factory for the given data class
     */
    getInstance(dataAlias: DataAliases): DataFactoryInstanceIntf {
        const metadata = DATA_METADATA.get(dataAlias);
        if (metadata === undefined) {
            throw new Error(`No metadata information for dataAlias: ${dataAlias}`);
        }
        // If this dataClass was never asked before, create it and store it in the cache
        if (this._instances.has(dataAlias) === false) {
            this._instances.set(dataAlias, new DataFactoryInstance(
                dataAlias, 
                metadata.hasScore ? SecretSauce.AllScoreRules.filter(v => v.applicable?.includes(dataAlias)) : [], 
                metadata.hasDependencies,
                metadata.caster
            ));
        }
        const instance: DataFactoryInstanceIntf | undefined = this._instances.get(dataAlias);
        if (instance === undefined) {
            throw new Error(`Couldn't find the instance for given class`);
        }
        // Return the instance
        return instance;
    }
}

/**
 * @description Data factory for a given data class
 * @public
 */
export class DataFactoryInstance implements DataFactoryInstanceIntf {

    /**
     * @type {DataAliases} 
     * @private
     */
    private _dataAlias: DataAliases;

    /**
     * @type {Array<ScoreRule>} 
     * @private
     */
    private _scoreRules: Array<ScoreRule>;

    /**
     * @type {boolean} 
     * @private
     */
    private _isDependenciesNeeded: boolean;

    /**
     * @type {Function}
     * @private
     */
    private _caster: Function;

    /**
     * @description Constructor
     * @param {DataAliases} dataAlias - Alias of the data for which we want to create the factory instance
     * @param {Array<ScoreRule>} scoreRules - The list of score rules to apply on the data
     * @param {boolean} isDependenciesNeeded - If true, the data will have dependencies information, otherwise it won't
     * @param {Function} caster - The caster method to call
     */
    constructor(dataAlias: DataAliases, scoreRules: Array<ScoreRule>, isDependenciesNeeded: boolean, caster: Function) {
        this._dataAlias = dataAlias;
        this._scoreRules = scoreRules;
        this._isDependenciesNeeded = isDependenciesNeeded;
        this._caster = caster;
    }

    /**
     * @description Creates a new instance of the given data class without computing the score
     * @param {DataFactoryInstanceCreateSetup | DataFactoryInstanceCreateSetup_WithDependencies} setup - The setup containing properties and dependencies to create a new instance
     * @returns {any} Returns the new row
     * @throws if configuration is null or configuration.properties is null
     * @public
     */
    public create(setup: DataFactoryInstanceCreateSetup | DataFactoryInstanceCreateSetup_WithDependencies): any {
        // Checks
        if (!setup) throw new TypeError("Setup can't be null.");
        if (!setup.properties) throw new TypeError("Setup.properties can't be null.");
        // Cast the property into the row
        const row = this._caster(setup.properties);
        // For this type if we have at least one Org Check "score rules", then score is needed
        if (this._scoreRules?.length > 0) {
            row.score = 0;
            row.badFields = [];
            row.badReasonIds = [];
        }
        // If dependencies are needed...
        if (this._isDependenciesNeeded === true) {
            if (setup['dependencyData']) {
                row.dependencies = DataDependenciesFactory.create(
                    setup['dependencyData'], 
                    (setup['dependencyIdFields'] || ['id']).map((/** @type {string} */ f: string) => row[f])
                );
            } else {
                throw new TypeError(`This data (of type ${this._dataAlias}) is defined as with dependencies, but no dependencies were provided.`);
            }
        } else {
            if (setup['dependencyData']) {
                throw new TypeError(`This data (of type ${this._dataAlias}) is defined as without dependencies, but some dependencies were provided.`);
            }
        }
        // Return the row finally
        return row;
    }

    /**
     * @description Computes the score on an existing row
     * @param {any} row - The row to compute the score on
     * @returns {any} Returns the row with computed score
     * @public
     */
    public computeScore(row: any): any { 
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
     * @param {DataFactoryInstanceCreateSetup | DataFactoryInstanceCreateSetup_WithDependencies} setup - The setup containing properties and dependencies to create a new instance
     * @returns {any} Returns the row with computed score
     * @throws if setup is null or configuration.properties is null
     * @public
     */
    public createWithScore(setup: DataFactoryInstanceCreateSetup | DataFactoryInstanceCreateSetup_WithDependencies): any {
        return this.computeScore(this.create(setup));
    }
}