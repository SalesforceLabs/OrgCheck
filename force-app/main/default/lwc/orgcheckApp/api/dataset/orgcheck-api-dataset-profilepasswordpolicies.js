import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_ProfilePasswordPolicy } from '../data/orgcheck-api-data-profilepasswordpolicy';

export class OrgCheckDatasetProfilePasswordPolicies extends OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger) {

        // First Metadata API query
        localLogger.log(`Querying Metadata API about ProfilePasswordPolicy...`);
        const results = await sfdcManager.readMetadata([{ 
            type: 'ProfilePasswordPolicy',
            members: [ '*' ]
        }], localLogger);
            
        // List of policies
        const profilePasswordPolicies = results?.ProfilePasswordPolicy;
        if (!profilePasswordPolicies) return new Map();

        // Init the factory and records
        const policyDataFactory = dataFactory.getInstance(SFDC_ProfilePasswordPolicy);

        // Create the map
        localLogger.log(`Parsing ${results[0].records.length} profile password policies...`);
        const policies = new Map(profilePasswordPolicies
            // Metadata could return profile pwd policy for deleted profile
            // In this case, r.profile will be equal to { $: {xsi:nil: 'true'} }
            // And we expect r.profile to be the name of the profile so....
            .filter((ppp) => typeof ppp.profile === 'string') // if string this is the profile's name, so the profile exists.
            .map((ppp) => {
                // Create the instance
                const policy = policyDataFactory.createWithScore({
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
                });

            // Add it to the map  
            return [ policy.profileName, policy ];
        }));

        // Return data as map
        localLogger.log(`Done`);
        return policies;
    } 
}