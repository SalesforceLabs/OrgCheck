import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_ProfilePasswordPolicy } from '../data/orgcheck-api-data-profilepasswordpolicy';

export class OrgCheckDatasetProfilePasswordPolicies extends OrgCheckDataset {

    run(sfdcManager, localLogger, resolve, reject) {

        localLogger.log('Calling Metadata API about ProfilePasswordPolicy...');
        sfdcManager.readMetadata([{ 
            type: 'ProfilePasswordPolicy',
            members: [ '*' ]
        }]).then((results) => {
            
            // List of policies
            const profilePasswordPolicies = results['ProfilePasswordPolicy'];

            // Init the map
            const policies = new Map();

            // Parse the records
            if (profilePasswordPolicies) {
                localLogger.log(`Parsing ${profilePasswordPolicies.length} policies...`);
                profilePasswordPolicies.forEach(ppp => {
                    if (typeof ppp.profile !== 'string') {
                        // Metadata could return profile pwd policy for deleted profile
                        // In this case, r.profile will be equal to { $: {xsi:nil: 'true'} }
                        // And we expect r.profile to be the name of the profile so....
                        return
                    };
                    // Create the instance
                    const policy = new SFDC_ProfilePasswordPolicy({
                        forgotPasswordRedirect: (ppp.forgotPasswordRedirect === 'true'),
                        lockoutInterval: parseInt(ppp.lockoutInterval),
                        maxLoginAttempts: parseInt(ppp.maxLoginAttempts),
                        minimumPasswordLength: parseInt(ppp.minimumPasswordLength),
                        minimumPasswordLifetime: (ppp.minimumPasswordLifetime === 'true'),
                        obscure: (ppp.obscure === 'true'),
                        passwordComplexity: parseInt(rppppasswordComplexity),
                        passwordExpiration: parseInt(ppp.passwordExpiration),
                        passwordHistory: parseInt(ppp.passwordHistory),
                        passwordQuestion: (ppp.passwordQuestion === 'true'),
                        profileName: ppp.profile,
                        isScoreNeeded: true
                    });

                    // Add it to the map                        
                    policies.set(policy.profileName, policy);                  

                    // Compute the score of this profile restriction, with the following rule:
                    //   - If question can include the password, then you get +1.
                    if (policy.passwordQuestion === true) policy.setBadField('passwordQuestion');
                });
            }

            // Return data
            resolve(policies);
        }).catch(reject);
    } 
}