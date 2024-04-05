import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_Organization } from '../data/orgcheck-api-data-organization';

const ORGTYPE_PROD = 'Production';
const ORGTYPE_DE = 'Developer Edition';
const ORGTYPE_SANDBOX = 'Sandbox';
const ORGTYPE_TRIAL = 'Trial';

export class OrgCheckDatasetOrganization extends OrgCheckDataset {

    run(sfdcManager, dataFactory, localLogger, resolve, reject) {

        // SOQL queries on InstalledSubscriberPackage and Organization
        sfdcManager.soqlQuery([{ 
            string: 'SELECT Id, Name, IsSandbox, OrganizationType, TrialExpirationDate, '+
                        'NamespacePrefix FROM Organization'
        }]).then((results) => {

            // Init the map
            const information = new Map();

            // Init the factory
            const organizationDataFactory = dataFactory.getInstance(SFDC_Organization);

            // Set the map
            const organization = results[0].records[0];
            let type;
            if (organization.OrganizationType === 'Developer Edition') type = ORGTYPE_DE;
            else if (organization.IsSandbox === true) type = ORGTYPE_SANDBOX;
            else if (organization.IsSandbox === false && organization.TrialExpirationDate) type = ORGTYPE_TRIAL;
            else type = ORGTYPE_PROD;
            information.set(organization.Id, organizationDataFactory.create({
                id: organization.Id,
                name: organization.Name,
                type: type,
                isDeveloperEdition: (type === ORGTYPE_DE),
                isSandbox: (type === ORGTYPE_SANDBOX),
                isTrial: (type === ORGTYPE_TRIAL),
                isProduction: (type === ORGTYPE_PROD),
                localNamespace: (organization.NamespacePrefix || '')
            }));

            // Return data
            resolve(information);
        }).catch(reject);
    } 
}