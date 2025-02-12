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

export class WhereToGetTextsData {

    /**
     * @description Property containing the list to iterate over
     * @type {string}
     */
    values;
}