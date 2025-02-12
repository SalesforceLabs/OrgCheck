export class TextTruncateModifier {

    /**
     * @description If text value has more than this maximum length of characters, the string will be truncated accordingly.
     * @type {number}
     */
    maximumLength;
}

export class PreformattedModifier {

    /**
     * @description If text value will be rendered as preformatted (like code or formulas etc.)
     * @type {boolean}
     */
    preformatted;
}

export class IfEmptyModifier {

    /**
     * @description If value is empty, this is the substitute text to use
     * @type {string}
     */
    valueIfEmpty;
}

export class IfLessModifier {

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

export class IfGreaterModifier {

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
