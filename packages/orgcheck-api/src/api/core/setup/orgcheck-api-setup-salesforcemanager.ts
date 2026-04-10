export interface SalesforceAuthenticationOptions {
    accessToken?: string; 
    clientId?: string; 
    clientSecret?: string; 
    redirectUri?: string;
}

export interface SalesforceManagerSetup {
    connection?: any;
    authenticationOptions?: SalesforceAuthenticationOptions;
}