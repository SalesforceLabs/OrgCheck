import { DataCollectionStatisticsIntf } from 'src/api/core/data/orgcheck-api-data-datacollectionstats';
import { Data } from 'src/api/core/data/orgcheck-api-data';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { ScoreRule } from 'src/api/data/orgcheck-api-data-scorerule';
import { RecipeAliases } from 'src/api/core/recipe/orgcheck-api-recipes-aliases';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { GlobalViewAsTable } from 'src/api/recipecollection/orgcheck-api-recipe-globalview';

/**
 * @description The super class for recipe collections that are defined only by executing a set of other recipes
 */
export interface RecipeCollection {

    /**
     * @description Title of this recipe collection
     * @type {string}
     * @public
     */
    title: string;

    /**
     * @description List all recipe aliases that this recipe collection needs
     * @param {SimpleLoggerIntf} logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {RecipeAliases[]} List of recipe aliases that this recipe collection needs
     * @public
     */
    ingredients(logger: SimpleLoggerIntf, parameters?: Map<string, any>): RecipeAliases[];

    /**
     * @description List the parameters that this recipe collection dependes on
     * @returns {string[]} List of parameters that this recipe collection dependes on
     * @public
     */
    ingredientsDependencies(): string[];

    /**
     * @description Filter the data items by score rules
     * @param {SimpleLoggerIntf} logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {ScoreRule[]} List of score rule to filter by. Empty array means no filtering
     * @public
     */ 
    filterByScoreRules(logger: SimpleLoggerIntf, parameters?: Map<string, any>): ScoreRule[];

    /**
     * @description Serve the mixture from a designated recipe collection to a table
     * @param {DataCollectionStatisticsIntf[]} mixture - The mixture
     * @returns {Table | GlobalViewAsTable} The tables
     * @async
     * @public
     */
    serveToTable(mixture: DataCollectionStatisticsIntf[]): Promise<Table | GlobalViewAsTable>;

    /**
     * @description We put your plate in a doggy bag
     * @param {Table | Table[]} plates - Plates which were on the table
     * @returns {Promise<ExportedTable | ExportedTable[]>} Meal in a doggy bag, ready to take back home!
     * @async
     * @public
     */
    serveToGo(plates: Table | GlobalViewAsTable): Promise<ExportedTable | ExportedTable[]>;
}

export class DataCollectionStatisticsOK implements DataCollectionStatisticsIntf {
    
    /**
     * @description Constructor
     * @param recipeAlias Alias of the corresponding recipe
     * @param recipeTitle Title of the corresponding recipe
     * @param countAll Number of all records
     * @param countBad Number of records that are considered "bad" (i.e. at least one bad reason id)
     * @param countBadByRule Number of bad records by rule
     * @param distinctBadValues List of distinct values automatically computed based on the rule description
     * @param data List of all data items that are part of this collection
     */
    constructor(public readonly recipeAlias: string, public readonly recipeTitle: string, 
        public readonly countAll: number, public readonly countBad: number, 
        public readonly countBadByRule: { ruleId: number; ruleName: string; count: number; }[], 
        public readonly distinctBadValues: any[], public readonly data: Data[]) {
        this.countGood = countAll - countBad;
    }

    /** 
     * @description Indicates if an error occurred while building the collection
     * @type {boolean}
     * @public
     */
    public readonly hadError: boolean = false;

    /** 
     * @description Last error message if any
     * @type {string}
     * @public
     */
    public readonly lastErrorMessage: string = '';

    /** 
     * @description Number of records that are considered "good" (i.e. no bad reason ids)
     * @type {number}
     * @public
     */
    public readonly countGood: number;
}

export class DataCollectionStatisticsWithError implements DataCollectionStatisticsIntf {
    
    /**
     * @description Constructor
     * @param recipeAlias Alias of the corresponding recipe
     * @param recipeTitle Title of the corresponding recipe
     * @param lastErrorMessage Last error message if any
     */
    constructor(public readonly recipeAlias: string, public readonly recipeTitle: string, public readonly lastErrorMessage: string) { }

    /** 
     * @description Indicates if an error occurred while building the collection
     * @type {boolean}
     * @public
     */
    public readonly hadError: boolean = true;

    /** 
     * @description Number of all records
     * @type {number}
     * @public
     */
    public readonly countAll: number = 0;

    /** 
     * @description Number of records that are considered "bad" (i.e. at least one bad reason id)
     * @type {number}
     * @public
     */
    public readonly countBad: number = 0;

    /** 
     * @description Number of records that are considered "good" (i.e. no bad reason ids)
     * @type {number}
     * @public
     */
    public readonly countGood: number = 0;

    /**
     * @description Number of bad records by rule
     * @type {{ruleId: number, ruleName: string, count: number}[]}
     * @default []
     * @public
     */
    public readonly countBadByRule: { ruleId: number; ruleName: string; count: number; }[] = [];

    /**
     * @description List of distinct values automatically computed based on the rule description
     * @type {any[]}
     * @public
     */
    public readonly distinctBadValues: any[] = [];

    /**
     * @description List of all data items that are part of this collection
     * @type {Data[]}
     * @default []
     * @public
     */ 
    public readonly data: Data[] = [];
}