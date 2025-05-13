import { Data, DataWithDependencies, DataWithoutScoring } from './orgcheck-api-data';
import { DataDependenciesFactory } from './orgcheck-api-data-dependencies-factory';
import { DataFactoryIntf, ScoreRule, DataFactoryInstanceIntf } from './orgcheck-api-datafactory';
import { SecretSauce } from './orgcheck-api-secretsauce';

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
 * @description Data factory implementation
 * @public
 */
export class DataFactory extends DataFactoryIntf {

    /**
     * @description Map of all factory instances given their "SFDC_*"" class
     * @type {Map}
     * @private
     */
    _instances;

    /**
     * @description Constructor
     * @public
     */
    constructor() {
        super();
        this._instances = new Map();
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
                isDataWithScoring ? SecretSauce.AllScoreRules.filter(v => v.applicable?.includes(dataClass)) : [], 
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
            row.dependencies = DataDependenciesFactory.create(configuration.dependencies.data, (configuration.dependencies.idFields || ['id']).map(f => row[f]));
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