export interface WhereToGetData {

    /**
     * @description Property containing the value
     * @type {string}
     */
    value: string;
}

export interface WhereToGetScoreData {

    /**
     * @description Property containing the score
     * @type {string}
     */
    value: string;

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

export interface WhereToGetLinkData {

    /**
     * @description Property containing the url to be used in the link
     * @type {string}
     */
    value: string;

    /**
     * @description Property containing the label to be used in the link
     * @type {string}
     */
    label: string;
}

export interface WhereToGetLinksData extends WhereToGetLinkData {

    /**
     * @description Property containing the list to iterate over
     * @type {string}
     */
    values: string;
}

export interface WhereToGetObjectsData {

    /**
     * @description Property containing the list to iterate over
     * @type {string}
     */
    values: string;

    /**
     * @description Template function to generate a text based on the object
     * @type {function(any): string}
     */
    template(arg0: any): string;
}

export interface WhereToGetTextsData {

    /**
     * @description Property containing the list to iterate over
     * @type {string}
     */
    values: string;
}