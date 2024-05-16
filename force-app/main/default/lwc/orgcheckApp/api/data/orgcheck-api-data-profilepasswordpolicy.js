import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_ProfilePasswordPolicy extends OrgCheckData {
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