import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_ProfilePasswordPolicy } from '../data/orgcheck-api-data-profilepasswordpolicy';

export class DatasetProfilePasswordPolicies extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_ProfilePasswordPolicy>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First Metadata API query
        logger?.log(`Querying Metadata API about ProfilePasswordPolicy...`);
        const results = await sfdcManager.readMetadata([{ 
            type: 'ProfilePasswordPolicy',
            members: [ '*' ]
        }], logger);
            
        // List of policies
        const profilePasswordPolicies = results?.get('ProfilePasswordPolicy') || [];
        if (!profilePasswordPolicies) return new Map();

        // Init the factory and records
        const policyDataFactory = dataFactory.getInstance(SFDC_ProfilePasswordPolicy);

        // Create the map
        logger?.log(`Parsing ${profilePasswordPolicies.length} profile password policies...`);        
        const policies = new Map(
            await Processor.map(
                profilePasswordPolicies,
                (/** @type {any} */ ppp) => {
                    // Create the instance
                    /** @type {SFDC_ProfilePasswordPolicy} */
                    const policy = policyDataFactory.createWithScore({
                        properties: {
                            lockoutInterval: parseInt(ppp.lockoutInterval, 10),
                            maxLoginAttempts: parseInt(ppp.maxLoginAttempts, 10),
                            minimumPasswordLength: parseInt(ppp.minimumPasswordLength, 10),
                            minimumPasswordLifetime: (ppp.minimumPasswordLifetime === 'true'),
                            obscure: (ppp.obscure === 'true'),
                            passwordComplexity: parseInt(ppp.passwordComplexity, 10),
                            passwordExpiration: parseInt(ppp.passwordExpiration, 10),
                            passwordHistory: parseInt(ppp.passwordHistory, 10),
                            passwordQuestion: (ppp.passwordQuestion === '0'), // If set to 1, the answer to the password hint cannot contain the password itself. If 0, the answer has no restrictions.
                            profileName: ppp.profile
                        }
                    });
                    // Add it to the map  
                    return [ policy.profileName, policy ];
                },
                // Metadata could return profile pwd policy for deleted profile
                // In this case, profile will be equal to { $: {xsi:nil: 'true'} } or an empty string
                // And we expect profile to be the name of the profile so....
                (/** @type {any} */ ppp) => (typeof ppp.profile === 'string') && (ppp.profile !== '') // if "profile" is a string and is not empty, then the profile exists.
            )
        );

        // Return data as map
        logger?.log(`Done`);
        return policies;
    } 
}