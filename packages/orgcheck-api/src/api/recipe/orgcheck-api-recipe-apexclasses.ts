import { Recipe } from 'src/api/core/orgcheck-api-recipe';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/orgcheck-api-datasets-aliases';
import { SfdcApexClass }from 'src/api/data/orgcheck-api-data-apexclass';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';

const REGULAR_FILTER = (ac: SfdcApexClass) => ac.isTest === false && ac.needsRecompilation === false;
const TEST_FILTER = (ac: SfdcApexClass) => ac.isTest === true && ac.needsRecompilation === false;
const UNCOMPILED_FILTER = (ac: SfdcApexClass) => ac.needsRecompilation === true;

const TESTS_TYPE = 'tests';
const UNCOMPILED_TYPE = 'uncompiled';
const REGULAR_TYPE = 'regular';

class AbstractRecipeApexClasses implements Recipe<SfdcApexClass[]> {

    /**
     * @description Function to filter the apex classes
     * @type {Function}
     * @private
     */ 
    private _filterFunction: Function;

    /**
     * @description Constructor letting us choose the type of apex classes to check
     * @param {string} type - Type of apex classes to check
     * @public
     */ 
    constructor(type: string) {
        switch (type) {
            case TESTS_TYPE: {
                this._filterFunction = TEST_FILTER; 
                break;
            }
            case UNCOMPILED_TYPE: {
                this._filterFunction = UNCOMPILED_FILTER; 
                break;
            }
            case REGULAR_TYPE: 
            default: {
                this._filterFunction = REGULAR_FILTER; 
            }
        }
    }

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    public extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [
            DatasetAliases.APEXCLASSES
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Promise<SfdcApexClass[]>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    public async transform(data: Map<string, any>, _logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<SfdcApexClass[]> {

        // Get data and parameters
        const apexClasses: Map<string, SfdcApexClass> = data.get(DatasetAliases.APEXCLASSES);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!apexClasses) throw new Error(`RecipeApexClasses: Data from dataset alias 'APEXCLASSES' was undefined.`);

        // Augment and filter data
        const array: Array<SfdcApexClass> = [];
        await Processor.forEach(apexClasses, async (apexClass: SfdcApexClass) => {            
            // Augment data
            const results = await Promise.all([
                Processor.map(apexClass.relatedTestClassIds, (id: string) => apexClasses.get(id)),
                Processor.map(apexClass.relatedClassIds, (id: string) => apexClasses.get(id))
            ]);
            apexClass.relatedTestClassRefs = results[0];
            apexClass.relatedClassRefs = results[1];
            // Filter data
            if ((namespace === OrgCheckGlobalParameter.ALL_VALUES || apexClass.package === namespace) && this._filterFunction(apexClass)) {
                array.push(apexClass);
            }
        });

        // Return data
        return array;
    }
}

export class RecipeApexClasses extends AbstractRecipeApexClasses {
    constructor() {
        super(REGULAR_TYPE);
    }
}

export class RecipeApexTests extends AbstractRecipeApexClasses {
    constructor() {
        super(TESTS_TYPE);
    }
}

export class RecipeApexUncompiled extends AbstractRecipeApexClasses {
    constructor() {
        super(UNCOMPILED_TYPE);
    }
}