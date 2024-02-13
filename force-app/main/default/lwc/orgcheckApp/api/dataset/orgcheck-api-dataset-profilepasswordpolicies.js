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
                        passwordComplexity: parseInt(ppp.passwordComplexity),
                        passwordExpiration: parseInt(ppp.passwordExpiration),
                        passwordHistory: parseInt(ppp.passwordHistory),
                        passwordQuestion: (ppp.passwordQuestion === '1'),
                        profileName: ppp.profile,
                        isScoreNeeded: true
                    });

                    // Add it to the map                        
                    policies.set(policy.profileName, policy);                  

                    // Compute the score of this profile restriction, with the following rule:
                    //   - If question can include the password, then you get +1.
                    //   - If password expires more than 90 days, then you get +1.
                    //   - If password never expires (= 0 days), then you get +1.
                    //   - If password history less than 3, then you get +1.
                    //   - If max attempt is not defined, then you get +1.
                    //   - If lockout inteval is not defined, then you get +1.
                    if (policy.passwordQuestion === true) policy.setBadField('passwordQuestion');
                    if (policy.passwordExpiration > 90 || policy.passwordExpiration === 0) policy.setBadField('passwordExpiration');
                    if (policy.passwordHistory < 3) policy.setBadField('passwordHistory');
                    if (policy.minimumPasswordLength < 8) policy.setBadField('minimumPasswordLength');
                    if (policy.passwordComplexity < 3) policy.setBadField('passwordComplexity');
                    if (policy.maxLoginAttempts === undefined) policy.setBadField('maxLoginAttempts');
                    if (policy.lockoutInterval === undefined) policy.setBadField('lockoutInterval');
                });
            }

            // Return data
            resolve(policies);
        }).catch(reject);
    } 
}