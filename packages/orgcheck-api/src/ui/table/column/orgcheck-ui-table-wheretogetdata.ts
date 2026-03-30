/**
 * @description This interface describe the field/property name in a Row where we find the "value" to show
 */
export interface WhereToGetData {

    /**
     * @description Property containing the value
     * @type {string}
     */
    value: string;
}

/**
 * @description This interface describe the field/property name in a Row where we find the "values" to iterate over
 */
export interface WhereToGetMultipleData {

    /**
     * @description Property containing the values
     * @type {string}
     */
    values: string;
}

/**
 * @description The score is the value in this case, and we add the fields to find the id and name of the item that has this score
 */
export interface WhereToGetScoreData extends WhereToGetData {

    /**
     * @description Property containing the Salesforce ID of the entity that has this score
     * @type {string}
     */
    id: string;

    /**
     * @description Property containing the name/label of the entity that has this score
     * @type {string}
     */
    name: string;
}

/**
 * @description The text is the value in this case, no additional field needed
 */ 
export interface WhereToGetTextData extends WhereToGetData {
}

/**
 * @description The URL is the value in this case, and we add the field to find the label for the hyperlink
 */
export interface WhereToGetLinkData extends WhereToGetData {

    /**
     * @description Property containing the label to be used in the link
     * @type {string}
     */
    label: string;
}

/**
 * @description The Object is the value in this case, and we add a method to render this object as a string
 */
export interface WhereToGetObjectData extends WhereToGetData {

    /**
     * @description Template function to generate a text based on the object
     * @type {function(any): string}
     */
    template(arg0: any): string;
}


/**
 * @description Values is the list, Value is the field to get the object (for each item)
 */ 
export interface WhereToGetObjectsData extends WhereToGetObjectData, WhereToGetMultipleData {
}

/**
 * @description Values is the list, Value is the field to get the text (for each item)
 */ 
export interface WhereToGetTextsData extends WhereToGetTextData, WhereToGetMultipleData {
}

/**
 * @description Values is the list, Value is the field to get the URL (for each item)
 */ 
export interface WhereToGetLinksData extends WhereToGetLinkData, WhereToGetMultipleData {
}