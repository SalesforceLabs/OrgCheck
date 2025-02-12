import { WhereToGetData, WhereToGetScoreData, WhereToGetLinkData, WhereToGetLinksData, WhereToGetObjectsData, WhereToGetTextsData } from "./orgcheck-ui-datagetters";
import { TextTruncateModifier, IfEmptyModifier, IfLessModifier, IfGreaterModifier, PreformattedModifier } from "./orgcheck-ui-datamodifiers";

export const Type = {
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

export const Orientation = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical'
}

export class TableColumn {

    /** 
     * @description Label used in the header of the column
     * @type {string}
     */ 
    label;

    /** 
     * @description Type used in the header of the column
     * @see Type
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
     * @type {Array<TextTruncateModifier | IfEmptyModifier | IfLessModifier | IfGreaterModifier | PreformattedModifier>}
     */
    modifiers;
}

export class TableColumnWithOrientation extends TableColumn {

    /** 
     * @description In which orientation the column should be.
     * @see Orientation
     * @type {string}
     */
    orientation;
}