import { SfdcApexClass, SfdcApexTestMethodResult } from 'src/api/data/orgcheck-api-data-apexclass';
import { SfdcApexTrigger } from 'src/api/data/orgcheck-api-data-apextrigger';
import { SfdcApplication } from 'src/api/data/orgcheck-api-data-application';
import { SfdcAppPermission } from 'src/api/data/orgcheck-api-data-apppermission';
import { SfdcBrowser } from 'src/api/data/orgcheck-api-data-browser';
import { SfdcCollaborationGroup } from 'src/api/data/orgcheck-api-data-collaborationgroup';
import { SfdcCustomLabel } from 'src/api/data/orgcheck-api-data-customlabel';
import { SfdcCustomTab } from 'src/api/data/orgcheck-api-data-customtab';
import { SfdcDashboard } from 'src/api/data/orgcheck-api-data-dashboard';
import { SfdcDocument } from 'src/api/data/orgcheck-api-data-document';
import { SfdcEmailTemplate } from 'src/api/data/orgcheck-api-data-emailtemplate';
import { SfdcField } from 'src/api/data/orgcheck-api-data-field';
import { SfdcFieldPermission } from 'src/api/data/orgcheck-api-data-fieldpermission';
import { SfdcFieldSet } from 'src/api/data/orgcheck-api-data-fieldset';
import { SfdcFlow, SfdcFlowVersion } from 'src/api/data/orgcheck-api-data-flow';
import { SfdcGroup } from 'src/api/data/orgcheck-api-data-group';
import { SfdcHomePageComponent } from 'src/api/data/orgcheck-api-data-homepagecomponent';
import { SfdcKnowledgeArticle } from 'src/api/data/orgcheck-api-data-knowledgearticle';
import { SfdcLightningAuraComponent } from 'src/api/data/orgcheck-api-data-lightningauracomponent';
import { SfdcLightningPage } from 'src/api/data/orgcheck-api-data-lightningpage';
import { SfdcLightningWebComponent } from 'src/api/data/orgcheck-api-data-lightningwebcomponent';
import { SfdcLimit } from 'src/api/data/orgcheck-api-data-limit';
import { SfdcObject } from 'src/api/data/orgcheck-api-data-object';
import { SfdcObjectPermission } from 'src/api/data/orgcheck-api-data-objectpermission';
import { SfdcObjectRelationShip } from 'src/api/data/orgcheck-api-data-objectrelationship';
import { SfdcObjectType } from 'src/api/data/orgcheck-api-data-objecttype';
import { SfdcOrganization } from 'src/api/data/orgcheck-api-data-organization';
import { SfdcPackage } from 'src/api/data/orgcheck-api-data-package';
import { SfdcPageLayout } from 'src/api/data/orgcheck-api-data-pagelayout';
import { SfdcPermissionSet } from 'src/api/data/orgcheck-api-data-permissionset';
import { SfdcPermissionSetLicense } from 'src/api/data/orgcheck-api-data-permissionsetlicense';
import { SfdcProfile } from 'src/api/data/orgcheck-api-data-profile';
import { SfdcProfilePasswordPolicy } from 'src/api/data/orgcheck-api-data-profilepasswordpolicy';
import { SfdcProfileIpRangeRestriction, SfdcProfileLoginHourRestriction, SfdcProfileRestrictions } from 'src/api/data/orgcheck-api-data-profilerestrictions';
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
import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataDependenciesFactory } from 'src/api/core/data/orgcheck-api-data-dependencies-factory';
import { DataFactoryIntf, DataFactoryInstanceIntf, DataFactoryInstanceCreateSetup, DataFactoryInstanceCreateSetup_WithDependencies } from 'src/api/core/data/orgcheck-api-datafactory';
import { SecretSauce } from 'src/api/core/orgcheck-api-secretsauce';
import { ScoreRule } from 'src/api/data/orgcheck-api-data-scorerule';

const DATA_METADATA = new Map([
   [ DataAliases.SfdcApexClass , { hasScore: true, hasDependencies: true, caster: (p) => (p as SfdcApexClass)}],
   [ DataAliases.SfdcApexTestMethodResult , { hasScore: false, hasDependencies: false, caster: (p) => (p as SfdcApexTestMethodResult)}],
   [ DataAliases.SfdcApexTrigger , { hasScore: true, hasDependencies: true, caster: (p) => (p as SfdcApexTrigger)}],
   [ DataAliases.SfdcApplication , { hasScore: false, hasDependencies: false, caster: (p) => (p as SfdcApplication)}],
   [ DataAliases.SfdcAppPermission , { hasScore: false, hasDependencies: false, caster: (p) => (p as SfdcAppPermission)}],
   [ DataAliases.SfdcBrowser , { hasScore: true, hasDependencies: false, caster: (p) => (p as SfdcBrowser)}],
   [ DataAliases.SfdcCollaborationGroup , { hasScore: true, hasDependencies: false, caster: (p) => (p as SfdcCollaborationGroup)}],
   [ DataAliases.SfdcCustomLabel , { hasScore: true, hasDependencies: true, caster: (p) => (p as SfdcCustomLabel)}],
   [ DataAliases.SfdcCustomTab , { hasScore: true, hasDependencies: true, caster: (p) => (p as SfdcCustomTab)}],
   [ DataAliases.SfdcDashboard , { hasScore: true, hasDependencies: false, caster: (p) => (p as SfdcDashboard)}],
   [ DataAliases.SfdcDocument , { hasScore: true, hasDependencies: false, caster: (p) => (p as SfdcDocument)}],
   [ DataAliases.SfdcEmailTemplate , { hasScore: true, hasDependencies: false, caster: (p) => (p as SfdcEmailTemplate)}],
   [ DataAliases.SfdcField , { hasScore: true, hasDependencies: true, caster: (p) => (p as SfdcField)}],
   [ DataAliases.SfdcFieldPermission , { hasScore: false, hasDependencies: false, caster: (p) => (p as SfdcFieldPermission)}],
   [ DataAliases.SfdcFieldSet , { hasScore: true, hasDependencies: false, caster: (p) => (p as SfdcFieldSet)}],
   [ DataAliases.SfdcFlow , { hasScore: true, hasDependencies: true, caster: (p) => (p as SfdcFlow)}],
   [ DataAliases.SfdcFlowVersion , { hasScore: false, hasDependencies: false, caster: (p) => (p as SfdcFlowVersion)}],
   [ DataAliases.SfdcGroup , { hasScore: true, hasDependencies: false, caster: (p) => (p as SfdcGroup)}],
   [ DataAliases.SfdcHomePageComponent , { hasScore: true, hasDependencies: true, caster: (p) => (p as SfdcHomePageComponent)}],
   [ DataAliases.SfdcKnowledgeArticle , { hasScore: true, hasDependencies: false, caster: (p) => (p as SfdcKnowledgeArticle)}],
   [ DataAliases.SfdcLightningAuraComponent , { hasScore: true, hasDependencies: true, caster: (p) => (p as SfdcLightningAuraComponent)}],
   [ DataAliases.SfdcLightningPage , { hasScore: true, hasDependencies: true, caster: (p) => (p as SfdcLightningPage)}],
   [ DataAliases.SfdcLightningWebComponent , { hasScore: true, hasDependencies: true, caster: (p) => (p as SfdcLightningWebComponent)}],
   [ DataAliases.SfdcLimit , { hasScore: true, hasDependencies: false, caster: (p) => (p as SfdcLimit)}],
   [ DataAliases.SfdcObject , { hasScore: true, hasDependencies: false, caster: (p) => (p as SfdcObject)}],
   [ DataAliases.SfdcObjectPermission , { hasScore: true, hasDependencies: false, caster: (p) => (p as SfdcObjectPermission)}],
   [ DataAliases.SfdcObjectRelationShip , { hasScore: false, hasDependencies: false, caster: (p) => (p as SfdcObjectRelationShip)}],
   [ DataAliases.SfdcObjectType , { hasScore: false, hasDependencies: false, caster: (p) => (p as SfdcObjectType)}],
   [ DataAliases.SfdcOrganization , { hasScore: false, hasDependencies: false, caster: (p) => (p as SfdcOrganization)}],
   [ DataAliases.SfdcPackage , { hasScore: true, hasDependencies: false, caster: (p) => (p as SfdcPackage)}],
   [ DataAliases.SfdcPageLayout , { hasScore: true, hasDependencies: true, caster: (p) => (p as SfdcPageLayout)}],
   [ DataAliases.SfdcPermissionSet , { hasScore: true, hasDependencies: false, caster: (p) => (p as SfdcPermissionSet)}],
   [ DataAliases.SfdcPermissionSetLicense , { hasScore: true, hasDependencies: false, caster: (p) => (p as SfdcPermissionSetLicense)}],
   [ DataAliases.SfdcProfile , { hasScore: true, hasDependencies: false, caster: (p) => (p as SfdcProfile)}],
   [ DataAliases.SfdcProfileIpRangeRestriction , { hasScore: false, hasDependencies: false, caster: (p) => (p as SfdcProfileIpRangeRestriction)}],
   [ DataAliases.SfdcProfileLoginHourRestriction , { hasScore: false, hasDependencies: false, caster: (p) => (p as SfdcProfileLoginHourRestriction)}],
   [ DataAliases.SfdcProfilePasswordPolicy , { hasScore: true, hasDependencies: false, caster: (p) => (p as SfdcProfilePasswordPolicy)}],
   [ DataAliases.SfdcProfileRestrictions , { hasScore: true, hasDependencies: false, caster: (p) => (p as SfdcProfileRestrictions)}],
   [ DataAliases.SfdcRecordType , { hasScore: true, hasDependencies: false, caster: (p) => (p as SfdcRecordType)}],
   [ DataAliases.SfdcReport , { hasScore: true, hasDependencies: false, caster: (p) => (p as SfdcReport)}],
   [ DataAliases.SfdcStaticResource , { hasScore: true, hasDependencies: true, caster: (p) => (p as SfdcStaticResource)}],
   [ DataAliases.SfdcUser , { hasScore: true, hasDependencies: false, caster: (p) => (p as SfdcUser)}],
   [ DataAliases.SfdcUserRole , { hasScore: true, hasDependencies: false, caster: (p) => (p as SfdcUserRole)}],
   [ DataAliases.SfdcValidationRule , { hasScore: true, hasDependencies: false, caster: (p) => (p as SfdcValidationRule)}],
   [ DataAliases.SfdcVisualForceComponent , { hasScore: true, hasDependencies: true, caster: (p) => (p as SfdcVisualForceComponent)}],
   [ DataAliases.SfdcVisualForcePage , { hasScore: true, hasDependencies: true, caster: (p) => (p as SfdcVisualForcePage)}],
   [ DataAliases.SfdcWebLink , { hasScore: true, hasDependencies: true, caster: (p) => (p as SfdcWebLink)}],
   [ DataAliases.SfdcWorkflow , { hasScore: true, hasDependencies: false, caster: (p) => (p as SfdcWorkflow)}]
]);

/**
 * @description Data factory implementation
 * @public
 */
export class DataFactory implements DataFactoryIntf {

    /**
     * @description Map of all factory instances given their "Sfdc*"" class
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
     * @type {ScoreRule[]} 
     * @private
     */
    private _scoreRules: ScoreRule[];

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
     * @param {ScoreRule[]} scoreRules - The list of score rules to apply on the data
     * @param {boolean} isDependenciesNeeded - If true, the data will have dependencies information, otherwise it won't
     * @param {Function} caster - The caster method to call
     */
    constructor(dataAlias: DataAliases, scoreRules: ScoreRule[], isDependenciesNeeded: boolean, caster: Function) {
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