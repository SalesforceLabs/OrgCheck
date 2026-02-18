import { WhereToGetData, WhereToGetScoreData, WhereToGetLinkData, WhereToGetLinksData, WhereToGetObjectsData, WhereToGetTextsData } from "./orgcheck-ui-table-datagetters";
import { TextTruncatedModifier, PreformattedModifier, EmptyModifier, NumericMinimumModifier, NumericMaximumModifier, NumericMinMaxModifier } from "./orgcheck-ui-table-datamodifiers";


export enum Orientation {
    HORIZONTAL, VERTICAL
}

export enum ColumnType {
    IDX  = 'index',
    SCR  = 'score',
    TXT  = 'text',
    TXTS = 'texts',
    NUM  = 'numeric',
    PRC  = 'percentage',
    URL  = 'id',
    URLS = 'ids',
    CHK  = 'boolean',
    DTM  = 'datetime',
    DEP  = 'dependencies',
    OBJS = 'objects'
}

export interface TableColumn {

    /** 
     * @description Label used in the header of the column
     * @type {string}
     */ 
    label: string;

    /** 
     * @description Type used in the header of the column
     * @type {ColumnType}
     */ 
    type: ColumnType;

    /**
     * @description Defines how to retrieve the data -- in which property
     * @type {WhereToGetData | WhereToGetScoreData | WhereToGetLinkData | WhereToGetLinksData | WhereToGetObjectsData | WhereToGetTextsData}
     */
    data?: WhereToGetData | WhereToGetScoreData | WhereToGetLinkData | WhereToGetLinksData | WhereToGetObjectsData | WhereToGetTextsData;
}

export interface TableColumnWithModifiers extends TableColumn {

    /** 
     * @description 
     * @type {TextTruncatedModifier | PreformattedModifier | EmptyModifier | NumericMinimumModifier | NumericMaximumModifier | NumericMinMaxModifier}
     */
    modifier: TextTruncatedModifier | PreformattedModifier | EmptyModifier | NumericMinimumModifier | NumericMaximumModifier | NumericMinMaxModifier;
}

export interface TableColumnWithOrientation extends TableColumn {

    /** 
     * @description In which orientation the column should be.
     * @type {Orientation}
     */
    orientation: Orientation;
}