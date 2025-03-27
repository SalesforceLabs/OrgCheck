import { Data } from '../core/orgcheck-api-data';

export class SFDC_ProfilePasswordPolicy extends Data {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Password Policy from a Profile' };

    /** 
     * @description The duration of the login lockout, in minutes. If users are locked out, they 
     *                  must wait until the lockout period expires. Valid values: 0, 15, 30, 60
     * @type {number}
     * @public
     */ 
    lockoutInterval;

    /**
     * @description The number of times a user can enter a wrong password before getting locked 
     *                  out. Valid values: 0, 3, 5, 10.
     * @type {number}
     * @public 
     */
    maxLoginAttempts;

    /**
     * @description Minimum number of characters required for a password. Valid values: 5–50.
     * @type {number}
     * @public 
     */
    minimumPasswordLength;

    /**
     * @description If true, a user cannot change a password more than once in a 24-hour period.
     * @type {boolean}
     * @public 
     */
    minimumPasswordLifetime;

    /**
     * @description If true, answers to security questions are hidden as the user types.
     * @type {boolean}
     * @public 
     */
    obscure;

    /**
     * @description Level of complexity required for the character types in a user’s password.
     *                  If 0, the password can contain any type of character.
     *                  If 1, the password must contain at least one alphabetic character and 1 number.
     *                  If 2, the password must contain at least one alphabetic character, one number, 
     *                      and one of the following special characters: ! # $ % - _ = + < >.
     *                  If 3, the password must contain at least one number, one uppercase letter, and 
     *                      one lowercase letter.
     *                  If 4, the password must contain at least one number, one uppercase letter, one 
     *                      lowercase letter, and one of the following special 
     *                      characters: ! # $ % - _ = + < >.
     * @type {number}
     * @public 
     */
    passwordComplexity;

    /**
     * @description Number of days until user passwords expire and must be changed. Valid values:
     *                  0 (If set to 0, the password never expires), 30, 60, 90, 180 or 365
     * @type {number}
     * @public 
     */
    passwordExpiration;

    /**
     * @description Number of previous passwords to save. Saving passwords is required to ensure 
     *                  that users reset their password to a new, unique password. This value must 
     *                  be set before a password reset succeeds. If 0, passwordExpiration must
     *                  be set to 0.
     * @type {number}
     * @public 
     */
    passwordHistory;

    /**
     * @description If set to true, the answer to the password hint cannot contain the password itself.
     *                  If false, the answer has no restrictions.
     * @type {boolean}
     * @public 
     */
    passwordQuestion;

    /**
     * @description Name of the associated user profile.
     * @type {string}
     * @public 
     */
    profileName;
}