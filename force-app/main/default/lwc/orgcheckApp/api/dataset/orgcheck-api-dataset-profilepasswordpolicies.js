import { OrgCheckDataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckSalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_ProfilePasswordPolicy } from '../data/orgcheck-api-data-profilepasswordpolicy';

export class OrgCheckDatasetProfilePasswordPolicies extends OrgCheckDataset {

    /**
     * @description Run the dataset and return the result
     * @param {OrgCheckSalesforceManagerIntf} sfdcManager
     * @param {OrgCheckDataFactoryIntf} dataFactory
     * @param {OrgCheckSimpleLoggerIntf} logger
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
        const profilePasswordPolicies = results?.ProfilePasswordPolicy;
        if (!profilePasswordPolicies) return new Map();

        // Init the factory and records
        const policyDataFactory = dataFactory.getInstance(SFDC_ProfilePasswordPolicy);

        // Create the map
        logger?.log(`Parsing ${profilePasswordPolicies.length} profile password policies...`);        
        const policies = new Map(
            await OrgCheckProcessor.map(
                profilePasswordPolicies,
                (ppp) => {
                    // Create the instance
                    const policy = policyDataFactory.createWithScore({
                        properties: {
                            forgotPasswordRedirect: (ppp.forgotPasswordRedirect === 'true'),
                            lockoutInterval: parseInt(ppp.lockoutInterval, 10),
                            maxLoginAttempts: parseInt(ppp.maxLoginAttempts, 10),
                            minimumPasswordLength: parseInt(ppp.minimumPasswordLength, 10),
                            minimumPasswordLifetime: (ppp.minimumPasswordLifetime === 'true'),
                            obscure: (ppp.obscure === 'true'),
                            passwordComplexity: parseInt(ppp.passwordComplexity, 10),
                            passwordExpiration: parseInt(ppp.passwordExpiration, 10),
                            passwordHistory: parseInt(ppp.passwordHistory, 10),
                            passwordQuestion: (ppp.passwordQuestion === '1'),
                            profileName: ppp.profile
                        }
                    });
                    // Add it to the map  
                    return [ policy.profileName, policy ];
                },
                // Metadata could return profile pwd policy for deleted profile
                // In this case, r.profile will be equal to { $: {xsi:nil: 'true'} }
                // And we expect r.profile to be the name of the profile so....
                (ppp) => typeof ppp.profile === 'string' // if string this is the profile's name, so the profile exists.
            )
        );

        // Return data as map
        logger?.log(`Done`);
        return policies;
    } 
}