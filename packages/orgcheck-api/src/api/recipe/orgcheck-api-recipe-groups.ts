import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_User } from '../data/orgcheck-api-data-user';
import { SFDC_Group } from '../data/orgcheck-api-data-group';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';

const QUEUE_FILTER = (/** @type {SFDC_Group} */ g: SFDC_Group) => g.isQueue === true; 
const PUBLICGROUP_FILTER = (/** @type {SFDC_Group} */ g: SFDC_Group) => g.isPublicGroup === true;

const QUEUE_TYPE = 'queue';
const PUBLICGROUP_TYPE = 'publicgroup';

class AbstractRecipeGroups implements Recipe {


    /**
     * @description Function to filter the apex classes
     * @type {Function}
     * @private
     */ 
    _filterFunction: Function;

    /**
     * @description Constructor letting us choose the type of apex classes to check
     * @param {string} type - Type of apex classes to check
     * @public
     */ 
    constructor(type: string) {
        switch (type) {
            case QUEUE_TYPE: {
                this._filterFunction = QUEUE_FILTER; 
                break;
            }
            case PUBLICGROUP_TYPE: 
            default: {
                this._filterFunction = PUBLICGROUP_FILTER; 
            }
        }
    }
    
    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [DatasetAliases.INTERNALACTIVEUSERS, DatasetAliases.PUBLICGROUPSANDQUEUES];
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf): Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map<string, any>> {

        // Get data and parameters
        const /** @type {Map<string, SFDC_Group>} */ groups: Map<string, SFDC_Group> = data.get(DatasetAliases.PUBLICGROUPSANDQUEUES);
        const /** @type {Map<string, SFDC_User>} */ users: Map<string, SFDC_User> = data.get(DatasetAliases.INTERNALACTIVEUSERS);

        // Checking data
        if (!groups) throw new Error(`RecipePublicGroups: Data from dataset alias 'PUBLICGROUPSANDQUEUES' was undefined.`);
        if (!users) throw new Error(`RecipePublicGroups: Data from dataset alias 'INTERNALACTIVEUSERS' was undefined.`);

        // Augment and filter data
        /** @type {Array<SFDC_Group>} */ 
        const array: Array<SFDC_Group> = [];
        await Processor.forEach(groups, async (/** @type {SFDC_Group} */ group: SFDC_Group) => {
            // Augment data
            group.directUserRefs = await Processor.map(
                group.directUserIds,
                (/** @type {string} */ id: string) => users.get(id),
                (/** @type {string} */ id: string) => users.has(id)
            );
            group.directGroupRefs = await Processor.map(
                group.directGroupIds,
                (/** @type {string} */ id: string) => groups.get(id),
                (/** @type {string} */ id: string) => groups.has(id)
            );
            // Filter data
            if (this._filterFunction(group) === true) {
                array.push(group);
            }
        });

        // Return data
        return array;
    }
}

export class RecipeQueues extends AbstractRecipeGroups {
    constructor() {
        super(QUEUE_TYPE);
    }
}

export class RecipePublicGroups extends AbstractRecipeGroups {
    constructor() {
        super(PUBLICGROUP_TYPE);
    }
}