import { WhereToGetData, WhereToGetScoreData, WhereToGetLinkData, WhereToGetLinksData, WhereToGetObjectsData, WhereToGetTextsData } from "./orgcheck-ui-table-datagetters";
import { TextTruncatedModifier, PreformattedModifier, EmptyModifier, NumericMinimumModifier, NumericMaximumModifier, NumericMinMaxModifier } from "./orgcheck-ui-table-datamodifiers";


export const Orientation = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical'
}

export const ColumnType = {
    IDX:  'index',
    SCR:  'score',
    TXT:  'text',
    TXTS: 'texts',
    NUM:  'numeric',
    PRC:  'percentage',
    URL:  'id',
    URLS: 'ids',
    CHK:  'boolean',
    DTM:  'datetime',
    DEP:  'dependencies',
    OBJS: 'objects'
}

export class TableColumn {

    /** 
     * @description Label used in the header of the column
     * @type {string}
     */ 
    label;

    /** 
     * @description Type used in the header of the column
     * @see ColumnType
     * @type {string}
     */ 
    type;
}

export class TableColumnWithData {

    /** 
     * @description Label used in the header of the column
     * @type {string}
     */ 
    label;

    /** 
     * @description Type used in the header of the column
     * @see ColumnType
     * @type {string}
     */ 
    type;

    /**
     * @description Defines how to retrieve the data -- in which property
     * @type {WhereToGetData | WhereToGetScoreData | WhereToGetLinkData | WhereToGetLinksData | WhereToGetObjectsData | WhereToGetTextsData}
     */
    data;
}

export class TableColumnWithModifiers extends TableColumn {

    /** 
     * @description 
     * @type {TextTruncatedModifier | PreformattedModifier | EmptyModifier | NumericMinimumModifier | NumericMaximumModifier | NumericMinMaxModifier}
     */
    modifier;
}

export class TableColumnWithOrientation extends TableColumn {

    /** 
     * @description In which orientation the column should be.
     * @see Orientation
     * @type {string}
     */
    orientation;
}