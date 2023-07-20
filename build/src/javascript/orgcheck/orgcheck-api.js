(function (global, factory) { typeof exports === 'object' && typeof module !== 'undefined' ? 
  factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.orgcheck = global.orgcheck || {}));
  })(this, (function (exports) { 'use strict';
  
/**
 * Org Check API main class
 */
class OrgCheckAPI {

    /**
     * Org Check version
     * @return String representation of the Org Check version in a form of Element [El,n]
     */
    version() {
        return 'Beryllium [Be,4]';
    }
    
    /**
     * JSForce connection to your Salesforce org
     */
    #salesforceConnection;

    /**
     * Current user id in your Salesforce org
     */
    #salesforceCurrentUserId;

    /**
     * Information of your Salesforce org
     */
    #salesforceOrgInformation;

    /**
     * List of packages in your Salesforce Org
     */
    #salesforcePackages;

    /**
     * List of all 'interesting' objects in your Salesforce Org
     */
    #salesforceObjects;

    /**
     * Org Check constructor
     * 
     * @param setup Information to create the instance with <code>salesforceConnector</code> (=jsforce), 
     *              <code>accessToken</code> and <code>userId</code>
     */
    constructor(setup) {

        if (!setup) throw new Error('OrgCheck API constructor: Setup is not set');
        if (!setup.salesforceConnector) throw new Error('OrgCheck API constructor: Setup.salesforceConnector is not set');
        if (!setup.accessToken) throw new Error('OrgCheck API constructor: Setup.accessToken is not set');
        if (!setup.accessToken) throw new Error('OrgCheck API constructor: Setup.userId is not set');

        const THIS_YEAR = new Date().getFullYear();
        const THIS_MONTH = new Date().getMonth() + 1;
        const SF_API_VERSION = 3 * (THIS_YEAR - 2022) + 53 + (THIS_MONTH <= 2 ? 0 : (THIS_MONTH <= 6 ? 1 : (THIS_MONTH <= 10 ? 2 : 3 )));

        this.#salesforceConnection = new setup.salesforceConnector.Connection({
            accessToken: setup.accessToken,
            version: SF_API_VERSION + '.0',
            maxRequest: '10000'
        });

        this.#salesforceCurrentUserId = setup.userId;
    }

    /**
     * Private method to call a list of SOQL queries (tooling or not)
     */
    #soqlQuery(queries) {
        const promises = [];
        queries.forEach(q => {
            promises.push(new Promise((resolve, reject) => {
                const conn = q.tooling === true ? this.#salesforceConnection.tooling : this.#salesforceConnection;
                conn.query(q.string, (e, d) => {
                  if (e) reject(e);
                  resolve(d);
                });
            }));
        });
        return Promise.all(promises);
    }

    /**
     * Private method to call a list of sobjects
     */
    #describeGlobal() {
        return new Promise((resolve, reject) => {
            this.#salesforceConnection.describeGlobal((e, d) => {
                if (e) reject(e);
                resolve(d.sobjects);
            });
        });
    }

    /**
     * Private method to extract the package name from the name of a resource
     */
    #getPackageFromName(name) {
        const name_splitted = name?.split('__');
        switch (name_splitted?.length) {
            case 3: {
                // Use case #1: Custom object in a package
                // Example: MyPackage__CustomObj__c, MyPackage__CustomObj__mdt, ...
                return name_splitted[0];
            }
            case 2: {
                // Use case #2: Custom object in the org (no namespace)
                // Note: package_name is already set to ''
                return ''
            }
        }
        return '';
    };

    #salesforceIdFormat(id) {
        if (id && id.length == 18) return id.substr(0, 15);
        return id;
    }
    
    /**
     * Get Salesforce Organization limits
     * 
     * @returns JSON structure representing Organization limits with <code>dailyApiLimitRate</code>
     */
    getOrgLimits() {
        // Refresh the lastest Daily API Usage from JSForce (everytime we call that method)
        if (this.#salesforceConnection.limitInfo && this.#salesforceConnection.limitInfo.apiUsage) {
            const apiUsageUsed = this.#salesforceConnection.limitInfo.apiUsage.used;
            const apiUsageMax = this.#salesforceConnection.limitInfo.apiUsage.limit;
            return { dailyApiLimitRate: apiUsageUsed / apiUsageMax };
        }
        return {};
    }

    /**
     * Get Salesforce Organization information (async method)
     * 
     * @returns JSON structure representing Orgnization information with <code>id</code>, <code>type</code>, 
     *              and <code>isProduction</code>
     * 
     * @example As this is an async method, it returns in reality a Promise. So the prefered way to call it
     *          is to do the following: <code>
     *            api.getOrgInfo()
     *              .then((orgInfo) => { ... })
     *              .catch((error) =>  { ... });
     *          </code>
     */
    async getOrgInfo() {

        if (!this.#salesforceOrgInformation) {

            // Requesting information from the current salesforce org
            const results = await this.#soqlQuery([
                { string: 'SELECT Id, Name, IsSandbox, OrganizationType, TrialExpirationDate FROM Organization' }
            ]);
            const record = results[0].records[0];

            // Organization type
            let type = 'Production';
            if (record.OrganizationType === 'Developer Edition') type = 'Developer Edition';
            else if (record.IsSandbox === true) type = 'Sandbox';
            else if (record.IsSandbox === false && record.TrialExpirationDate) type = 'TrialOrDemo';

            this.#salesforceOrgInformation = {
                id: record.Id,
                name: record.Name,
                type: type,
                isProduction: (type === 'Production')
            }
        }
        return this.#salesforceOrgInformation;
    }

    /**
     * Get a list of your packages (local and distant) (async method)
     * 
     * @returns Array of JSON structure representing a package
     * 
     * @example As this is an async method, it returns in reality a Promise. So the prefered way to call it
     *          is to do the following: <code>
     *            api.getPackages()
     *              .then((packages) => { packages.forEach(p => {...}); })
     *              .catch((error) =>  { ... });
     *          </code>
     */
    async getPackages() {

        if (!this.#salesforcePackages) {

            // Requesting information from the current salesforce org
            const results = await this.#soqlQuery([{ 
                tooling: true,
                string: 'SELECT Id, SubscriberPackage.NamespacePrefix, SubscriberPackage.Name FROM InstalledSubscriberPackage ' 
            }, { 
                string: 'SELECT NamespacePrefix FROM Organization '
            }]);

            this.#salesforcePackages = [];

            // Mapping installed namespaces
            results[0].records.forEach(r => this.#salesforcePackages.push({
                id: r.Id,
                name: r.SubscriberPackage.Name,
                namespace: r.SubscriberPackage.NamespacePrefix,
                type: 'Installed'
            }));

            // If the organization has it own namespace...
            results[1].records.forEach(r => this.#salesforcePackages.push({
                id: r.NamespacePrefix,
                name: r.NamespacePrefix,
                namespace: r.NamespacePrefix,
                type: 'Local'
            }));
        }

        return this.#salesforcePackages;
    }

    /**
     * Get a list of types
     * 
     * @returns Array of JSON structure representing the supported types
     */
    getTypes() {
        return [
            { label: 'Standard Object', id: 'STANDARD_SOBJECT' },
            { label: 'Custom Object', id: 'CUSTOM_SOBJECT' },
            { label: 'External Object', id: 'CUSTOM_EXTERNAL_SOBJECT' },
            { label: 'Custom Setting', id: 'CUSTOM_SETTING' },
            { label: 'Custom Metadata Type', id: 'CUSTOM_METADATA_TYPE' },
            { label: 'Platform Event', id: 'CUSTOM_EVENT' },
            { label: 'Knowledge Article', id: 'KNOWLEDGE_ARTICLE' },
            { label: 'Big Object', id: 'CUSTOM_BIG_OBJECT' }
        ];
    }

    /**
     * Get a list of objects (async method)
     * 
     * @param namespace of the object you want to list (optional), '*' for any
     * @param type of the object you want to list (optional), '*' for any
     * 
     * @returns Array of JSON structure representing an object (simple version)
     * 
     * @example As this is an async method, it returns in reality a Promise. So the prefered way to call it
     *          is to do the following: <code>
     *            api.getObjects()
     *              .then((objects) => { objects.forEach(p => {...}); })
     *              .catch((error) =>  { ... });
     *          </code>
     */
    async getObjects(namespace, type) {

        if (!this.#salesforceObjects) {

            // Requesting information from the current salesforce org
            const objects = await this.#describeGlobal();

            this.#salesforceObjects = [];

            // Mapping sobjects records
            objects.filter((r) => r.keyPrefix).forEach(r => {
                let oType;
                if (r.custom === false) oType = 'STANDARD_SOBJECT';
                if (r.customSetting === true) oType = 'CUSTOM_SETTING';
                if (r.name.endsWith('__c')) oType = 'CUSTOM_SOBJECT';
                if (r.name.endsWith('__x')) oType = 'CUSTOM_EXTERNAL_SOBJECT';
                if (r.name.endsWith('__mdt')) oType = 'CUSTOM_METADATA_TYPE';
                if (r.name.endsWith('__e')) oType = 'CUSTOM_EVENT';
                if (r.name.endsWith('__ka')) oType = 'KNOWLEDGE_ARTICLE';
                if (r.name.endsWith('__b')) oType = 'CUSTOM_BIG_OBJECT';
                if (oType) {
                    this.#salesforceObjects.push({
                        id: r.name,
                        label: r.label,
                        developerName: r.name,
                        package: this.#getPackageFromName(r.name),
                        type: oType
                    });        
                }
            });
        }

        return this.#salesforceObjects.filter((o) => {
            if (namespace !== '*' && o.package !== namespace) return false;
            if (type !== '*' && o.type !== type) return false;
            return true;
        });
    }

    async getCustomFields(object) {

        const results = await this.#soqlQuery([{ 
            tooling: true,
            string: 'SELECT Id, EntityDefinition.QualifiedApiName, EntityDefinitionId, '+
                        'DeveloperName, NamespacePrefix, Description, CreatedDate, '+
                        'LastModifiedDate '+
                    'FROM CustomField '+
                    'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\') '+
                    (object === '*' ? '' : 'AND EntityDefinition.QualifiedApiName = \''+object+'\'')
        }]);

        const data = [];
        results[0].records.forEach((r) => data.push({
            id: this.#salesforceIdFormat(r.Id),
            objectId: this.#salesforceIdFormat(r.EntityDefinitionId),
            objectDeveloperName: r.EntityDefinition?.QualifiedApiName,
            fieldName: r.DeveloperName,
            developerName: r.DeveloperName,
            package: r.NamespacePrefix,
            fullName: r.DeveloperName,
            description: r.Description,
            createdDate: r.CreatedDate, 
            lastModifiedDate: r.LastModifiedDate
        }));
        return data;
    }
}

exports.OrgCheckAPI = OrgCheckAPI;
Object.defineProperty(exports, '__esModule', { value: true });
}));