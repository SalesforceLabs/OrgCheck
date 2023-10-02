import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckMap } from '../core/orgcheck-api-type-map';
import { SFDC_OrgInformation } from '../data/orgcheck-api-data-orginfo';

export class OrgCheckDatasetOrgInformation extends OrgCheckDataset {

    run(sfdcManager, resolve, reject) {

        // SOQL queries on InstalledSubscriberPackage and Organization
        sfdcManager.soqlQuery([{ 
            string: 'SELECT Id, Name, IsSandbox, OrganizationType, TrialExpirationDate, '+
                        'NamespacePrefix FROM Organization'
        }]).then((results) => {

            // Init the map
            const information = new OrgCheckMap();

            // Set the map
            const organization = results[0].records[0];
            let type;
            if (organization.OrganizationType === 'Developer Edition') type = 'Developer Edition';
            else if (organization.IsSandbox === true) type = 'Sandbox';
            else if (organization.IsSandbox === false && organization.TrialExpirationDate) type = 'TrialOrDemo';
            else type = 'Production';
            information.set(organization.Id, new SFDC_OrgInformation({
                id: organization.Id,
                name: organization.Name,
                type: type,
                isProduction: (type === 'Production'),
                localNamespace: (organization.NamespacePrefix || '')
            }));

            // Return data
            resolve(information);
        }).catch(reject);
    } 
}