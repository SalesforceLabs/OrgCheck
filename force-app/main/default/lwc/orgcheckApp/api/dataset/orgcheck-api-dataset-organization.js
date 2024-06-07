import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_Organization } from '../data/orgcheck-api-data-organization';

const ORGTYPE_PROD = 'Production';
const ORGTYPE_DE = 'Developer Edition';
const ORGTYPE_SANDBOX = 'Sandbox';
const ORGTYPE_TRIAL = 'Trial';

export class OrgCheckDatasetOrganization extends OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger) {

        // First SOQL query
        localLogger.log(`Querying REST API about Organization in the org...`);            
        const results = await sfdcManager.soqlQuery([{ 
            string: 'SELECT Id, Name, IsSandbox, OrganizationType, TrialExpirationDate, '+
                        'NamespacePrefix FROM Organization LIMIT 1'
        }], localLogger);
        const record = results[0].records[0];
        localLogger.log(`Parsing the result...`);

        // Init the factory and records
        const organizationDataFactory = dataFactory.getInstance(SFDC_Organization);

        // Set the type
        let type;
        if (record.OrganizationType === 'Developer Edition') type = ORGTYPE_DE;
        else if (record.IsSandbox === true) type = ORGTYPE_SANDBOX;
        else if (record.IsSandbox === false && record.TrialExpirationDate) type = ORGTYPE_TRIAL;
        else type = ORGTYPE_PROD;
        
        // Create the data
        const organization = organizationDataFactory.create({
            id: sfdcManager.caseSafeId(record.Id),
            name: record.Name,
            type: type,
            isDeveloperEdition: (type === ORGTYPE_DE),
            isSandbox: (type === ORGTYPE_SANDBOX),
            isTrial: (type === ORGTYPE_TRIAL),
            isProduction: (type === ORGTYPE_PROD),
            localNamespace: (record.NamespacePrefix || '')
        });

        // Return data as map
        localLogger.log(`Done`);
        return new Map([[ organization.id, organization ]]);
    } 
}