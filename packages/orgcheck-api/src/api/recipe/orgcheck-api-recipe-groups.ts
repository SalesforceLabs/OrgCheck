import { Recipe } from 'src/api/core/orgcheck-api-recipe';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/orgcheck-api-datasets-aliases';
import { SfdcUser }from 'src/api/data/orgcheck-api-data-user';
import { SfdcGroup }from 'src/api/data/orgcheck-api-data-group';

const QUEUE_FILTER = (g: SfdcGroup) => g.isQueue === true; 
const PUBLICGROUP_FILTER = (g: SfdcGroup) => g.isPublicGroup === true;

const QUEUE_TYPE = 'queue';
const PUBLICGROUP_TYPE = 'publicgroup';

class AbstractRecipeGroups implements Recipe<SfdcGroup[]> {

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
    public extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [DatasetAliases.INTERNALACTIVEUSERS, DatasetAliases.PUBLICGROUPSANDQUEUES];
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Promise<SfdcGroup[]>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    public async transform(data: Map<string, any>, _logger: SimpleLoggerIntf): Promise<SfdcGroup[]> {

        // Get data and parameters
        const groups: Map<string, SfdcGroup> = data.get(DatasetAliases.PUBLICGROUPSANDQUEUES);
        const users: Map<string, SfdcUser> = data.get(DatasetAliases.INTERNALACTIVEUSERS);

        // Checking data
        if (!groups) throw new Error(`RecipePublicGroups: Data from dataset alias 'PUBLICGROUPSANDQUEUES' was undefined.`);
        if (!users) throw new Error(`RecipePublicGroups: Data from dataset alias 'INTERNALACTIVEUSERS' was undefined.`);

        // Augment and filter data
        
        const array: Array<SfdcGroup> = [];
        await Processor.forEach(groups, async (group: SfdcGroup) => {
            // Augment data
            group.directUserRefs = await Processor.map(
                group.directUserIds,
                (id: string) => users.get(id),
                (id: string) => users.has(id)
            );
            group.directGroupRefs = await Processor.map(
                group.directGroupIds,
                (id: string) => groups.get(id),
                (id: string) => groups.has(id)
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