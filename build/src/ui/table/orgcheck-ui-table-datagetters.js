export class WhereToGetData {

    /**
     * @description Property containing the value
     * @type {string}
     */
    value;
}

export class WhereToGetScoreData {

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

export class WhereToGetLinkData {

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

export class WhereToGetLinksData extends WhereToGetLinkData {

    /**
     * @description Property containing the list to iterate over
     * @type {string}
     */
    values;
}

export class WhereToGetObjectsData {

    /**
     * @description Property containing the list to iterate over
     * @type {string}
     */
    values;

    /**
     * @description Template function to generate a text based on the object
     * @type {function(any): string}
     */
    template;
}

export class WhereToGetTextsData {

    /**
     * @description Property containing the list to iterate over
     * @type {string}
     */
    values;
}