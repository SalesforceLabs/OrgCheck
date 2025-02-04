import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_ProfilePasswordPolicy extends OrgCheckData {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Password Policy from a Profile' };

    forgotPasswordRedirect;
    lockoutInterval;
    maxLoginAttempts;
    minimumPasswordLength;
    minimumPasswordLifetime;
    obscure;
    passwordComplexity;
    passwordExpiration;
    passwordHistory;
    passwordQuestion;
    profileName;
}