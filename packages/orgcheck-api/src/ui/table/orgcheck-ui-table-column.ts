import { 
    WhereToGetTextData, 
    WhereToGetScoreData, 
    WhereToGetLinkData, 
    WhereToGetObjectData,
    WhereToGetTextsData,
    WhereToGetLinksData, 
    WhereToGetObjectsData } from 'src/ui/table/orgcheck-ui-table-datagetters';
import { Modifier } from 'src/ui/table/orgcheck-ui-table-datamodifiers';
import { ColumnType } from 'src/ui/table/orgcheck-ui-table-columntype';
import { Orientation } from 'src/ui/table/orgcheck-ui-table-columnorientation';

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
     * @type { WhereToGetTextData | WhereToGetScoreData | WhereToGetLinkData | WhereToGetObjectData | WhereToGetTextsData | WhereToGetLinksData | WhereToGetObjectsData }
     */
    data?: WhereToGetTextData | WhereToGetScoreData | WhereToGetLinkData | WhereToGetObjectData | WhereToGetTextsData | WhereToGetLinksData | WhereToGetObjectsData;

    /** 
     * @description Optional modifier around the data
     * @type { Modifier }
     */
    modifier?: Modifier;

    /** 
     * @description In which orientation the column should be. This is optional, by default the column will be horizontal.
     * @type {Orientation}
     */
    orientation?: Orientation;
}