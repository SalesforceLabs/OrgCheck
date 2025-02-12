class WhereToGetData {

    /**
     * @description Property containing the value
     * @type {string}
     */
    value;
}

class WhereToGetScoreData {

    /**
     * @description Property containing the score
     * @type {string}
     */
    value;

    /**
     * @description Property containing the Salesforce ID of the entity that has this score
     * @type {string}
     */
    id;

    /**
     * @description Property containing the name/label of the entity that has this score
     * @type {string}
     */
    name;
}

class WhereToGetLinkData {

    /**
     * @description Property containing the url to be used in the link
     * @type {string}
     */
    value;

    /**
     * @description Property containing the label to be used in the link
     * @type {string}
     */
    label;
}

class WhereToGetLinksData extends WhereToGetLinkData {

    /**
     * @description Property containing the list to iterate over
     * @type {string}
     */
    values;
}

class WhereToGetObjectsData {

    /**
     * @description Template to use to generate a text which is a mix of hard coded text and merge fields
     * @type {string}
     */
    value;

    /**
     * @description Property containing the list to iterate over
     * @type {string}
     */
    values;
}

class WhereToGetTextsData {

    /**
     * @description Property containing the list to iterate over
     * @type {string}
     */
    values;
}

class TextTruncateModifier {

    /**
     * @description If text value has more than this maximum length of characters, the string will be truncated accordingly.
     * @type {number}
     */
    maximumLength;
}

class PreformattedModifier {

    /**
     * @description If text value will be rendered as preformatted (like code or formulas etc.)
     * @type {boolean}
     */
    preformatted;
}

class IfEmptyModifier {

    /**
     * @description If value is empty, this is the substitute text to use
     * @type {string}
     */
    valueIfEmpty;
}

class IfLessModifier {

    /**
     * @description If the value is less that this value, the text will be substituted.
     * @type {number}
     */
    minimum;

    /**
     * @description If value is less than 'min', this is the substitute text to use
     * @type {string}
     */
    valueBeforeMin;
}

class IfGreaterModifier {

    /**
     * @description If the value is greater that this value, the text will be substituted.
     * @type {number}
     */
    maximum;

    /**
     * @description If value is greater than 'max', this is the substitute text to use
     * @type {string}
     */
    valueAfterMax;
}

const Type = {
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
};

const Orientation = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical'
};

class TableColumn {

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

class TableColumnWithModifiers extends TableColumn {

    /** 
     * @description 
     * @type {Array<TextTruncateModifier | IfEmptyModifier | IfLessModifier | IfGreaterModifier | PreformattedModifier>}
     */
    modifiers;
}

class TableColumnWithOrientation extends TableColumn {

    /** 
     * @description In which orientation the column should be.
     * @see Orientation
     * @type {string}
     */
    orientation;
}

const SortOrder = {
    DESC: 'desc',
    ASC: 'asc'
};

class Table {

    /**
     * @description List of columns in a table
     * @type {Array<TableColumn | TableColumnWithModifiers | TableColumnWithOrientation>}
     */
    columns;
}

class TableWithOrdering extends Table {

    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex;

    /**
     * @description What is the sort order: ASC or DESC?
     * @see SortOrder
     * @type {string}
     */
    orderSort;
}

export { IfEmptyModifier, IfGreaterModifier, IfLessModifier, Orientation, PreformattedModifier, SortOrder, Table, TableColumn, TableColumnWithModifiers, TableColumnWithOrientation, TableWithOrdering, TextTruncateModifier, Type, WhereToGetData, WhereToGetLinkData, WhereToGetLinksData, WhereToGetObjectsData, WhereToGetScoreData, WhereToGetTextsData };
