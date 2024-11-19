import { OrgCheckSalesforceManager } from './core/orgcheck-api-sfconnectionmanager';
import { OrgCheckLogger } from './core/orgcheck-api-logger';
import { OrgCheckDatasetManager } from './core/orgcheck-api-datasetmanager';
import { OrgCheckRecipeManager,
    RECIPE_ACTIVEUSERS_ALIAS,
    RECIPE_CUSTOMFIELDS_ALIAS, 
    RECIPE_CUSTOMLABELS_ALIAS,
    RECIPE_GLOBALFILTERS_ALIAS,
    RECIPE_OBJECT_ALIAS,
    RECIPE_OBJECTPERMISSIONS_ALIAS,
    RECIPE_APPPERMISSIONS_ALIAS,
    RECIPE_ORGANIZATION_ALIAS,
    RECIPE_CURRENTUSERPERMISSIONS_ALIAS,
    RECIPE_PERMISSIONSETS_ALIAS,
    RECIPE_PROFILES_ALIAS,
    RECIPE_PROFILERESTRICTIONS_ALIAS,
    RECIPE_PROFILEPWDPOLICIES_ALIAS,
    RECIPE_VISUALFORCEPAGES_ALIAS,
    RECIPE_LIGHTNINGPWEBCOMPONENTS_ALIAS,
    RECIPE_LIGHTNINGAURACOMPONENTS_ALIAS,
    RECIPE_LIGHTNINGPAGES_ALIAS,
    RECIPE_VISUALFORCECOMPONENTS_ALIAS,
    RECIPE_GROUPS_ALIAS, 
    RECIPE_APEXCLASSES_ALIAS, 
    RECIPE_APEXTRIGGERS_ALIAS,
    RECIPE_USERROLES_ALIAS,
    RECIPE_FLOWS_ALIAS,
    RECIPE_PROCESSBUILDERS_ALIAS,
    RECIPE_WORKFLOWS_ALIAS } from './core/orgcheck-api-recipemanager';

/**
 * Org Check API main class
 */
export class OrgCheckAPI {

    /**
     * Org Check version
     * 
     * @return String representation of the Org Check version in a form of Element [El,n]
     */
    getVersion() {
        return 'Beryllium [Be,4]';
    }

    /**
     * @property {OrgCheckRecipeManager} recipeManager
     */
    #recipeManager;

    /**
     * @property {OrgCheckDatasetManager} datasetManager
     */
    #datasetManager;

    /**
     * @property {OrgCheckSalesforceManager} sfdcManager
     */
    #sfdcManager;

    /**
     * @property {OrgCheckLogger} logger
     */
    #logger;

    /**
     * Org Check constructor
     * 
     * @param {JsForce} jsConnectionFactory
     * @param {FFlate} jsCompression
     * @param {String} accessToken
     * @param {String} userId
     * @param {JSon} loggerSetup
     */
    constructor(jsConnectionFactory, jsCompression, accessToken, userId, loggerSetup) {
        this.#logger = new OrgCheckLogger(loggerSetup);
        this.#sfdcManager = new OrgCheckSalesforceManager(jsConnectionFactory, accessToken, userId, this.#logger);
        this.#datasetManager = new OrgCheckDatasetManager(this.#sfdcManager, jsCompression, this.#logger);
        this.#recipeManager = new OrgCheckRecipeManager(this.#datasetManager, this.#logger);
    }
    
    /**
     * Remove all cache from dataset manager
     */
    removeAllCache() {
        this.#datasetManager.removeAllCache();
    }

    /**
     * Remove a given cache from dataset manager
     * 
     * @param {string} name 
     */
    removeCache(name) {
        this.#datasetManager.removeCache(name);
    }

    /**
     * Get cache information from dataset manager
     * 
     * @returns {Array<DatasetCacheInfo>} list of cache information 
     */
    getCacheInformation() {
        return this.#datasetManager.getCacheInformation();
    }

    getValidationRule(id) {
        return this.#datasetManager.getValidationRule(id);
    }

    /**
     * Get the lastest Daily API Usage from JSForce, and the level of confidence 
     * we have in this ratio to continue using org check.
     * 
     * @returns {DailyApiRequestLimitInformation} Percentage of the daily api usage and a confidence precentage.
     */
    getDailyApiRequestLimitInformation() {
        return this.#sfdcManager.getDailyApiRequestLimitInformation();
    }

    /**
     * Send a request to run all tests in the org.
     * When this method is finished, it does not mean all tests are run.
     * 
     * @returns The Salesforce Id of the AsyncApexJob
     * @throws Exception if rate >= THRESHOLD
     */
    async runAllTestsAsync() {
        return this.#sfdcManager.runAllTests();
    }

    async compileClasses(classes) {
        return this.#sfdcManager.compileClasses(classes);
    }
    
    /**
     * Get information about the organization
     * 
     * @returns {SFDC_Organization} Org information to return
     * @throws Exception if rate >= THRESHOLD
     */
    async getOrganizationInformation() {
        return this.#recipeManager.run(RECIPE_ORGANIZATION_ALIAS);
    }

    /**
     * Check if the current user can run the application
     * 
     * @returns true
     * @throws Exception if not enough permissions to run the application
     */
    async checkCurrentUserPermissions() {
        const perms = await this.#recipeManager.run(RECIPE_CURRENTUSERPERMISSIONS_ALIAS, [ 'ModifyAllData','AuthorApex','ApiEnabled','InstallPackaging' ]);
        if (perms.get('ModifyAllData') === false || 
            perms.get('AuthorApex') === false ||
            perms.get('ApiEnabled') === false ||
            perms.get('InstallPackaging') === false) {
                const error = new TypeError(
                    'Current User Permission Access is not enough to run the application <br /><br />'+
                    `- <b>Modify All Data</b> (Create, edit, and delete all organization data, regardless of sharing settings) [PermissionsModifyAllData] is set to ${perms.get('PermissionsModifyAllData')} <br />`+
                    `- <b>Author Apex</b> (Create Apex classes and triggers) [PermissionsAuthorApex] is set to ${perms.get('PermissionsAuthorApex')} <br />`+
                    `- <b>API Enabled</b> (Access any Salesforce.com API) [PermissionsApiEnabled] is set to ${perms.get('PermissionsApiEnabled')} <br />`+
                    `- <b>Download AppExchange Packages</b> (Install or uninstall AppExchange packages as system administrators) [PermissionsInstallPackaging] is set to ${perms.get('PermissionsInstallPackaging')} <br />`
                );
                throw (error);
        }
        return true;
    }

    /**
     * Get information about the packages, the object types and objects (used for global filters)
     * 
     * @returns {Any} Information about packages (list of SFDC_Package), types (list of SFDC_ObjectType) and objects (list of SFDC_Object)
        }
     * @throws Exception if rate >= THRESHOLD
     */
    async getPackagesTypesAndObjects(namespace, sobjectType) {
        return this.#recipeManager.run(RECIPE_GLOBALFILTERS_ALIAS, namespace, sobjectType);
    }

    removeAllPackagesTypesAndObjects() {
        return this.#recipeManager.clean(RECIPE_GLOBALFILTERS_ALIAS);
    }

    /**
     * Get information about a specific sobject
     * 
     * @returns {SFDC_Object[]} List of items to return
     * @throws Exception if rate >= THRESHOLD
     */
    async getObject(sobject) {
        return this.#recipeManager.run(RECIPE_OBJECT_ALIAS, sobject);
    }

    removeAllObjectsCache(sobject) {
        this.#recipeManager.clean(RECIPE_OBJECT_ALIAS, sobject);
    }

    /**
     * Get information about object permissions per parent (kind of matrix view)
     * 
     * @returns {Any} Information about objects (list of string) and permissions (list of SFDC_ObjectPermissionsPerParent)
     * @throws Exception if rate >= THRESHOLD
     */
    async getObjectPermissionsPerParent(namespace) {
        return this.#recipeManager.run(RECIPE_OBJECTPERMISSIONS_ALIAS, namespace);
    }

    removeAllObjectPermissionsCache() {
        this.#recipeManager.clean(RECIPE_OBJECTPERMISSIONS_ALIAS);
    }

    /**
     * Get information about application permissions per parent (kind of matrix view)
     * 
     * @returns {Any} Information about applications (list of string) and permissions (list of SFDC_AppPermissionsPerParent)
     * @throws Exception if rate >= THRESHOLD
     */
    async getApplicationPermissionsPerParent(namespace) {
        return this.#recipeManager.run(RECIPE_APPPERMISSIONS_ALIAS, namespace);
    }

    removeAllAppPermissionsCache() {
        this.#recipeManager.clean(RECIPE_APPPERMISSIONS_ALIAS);
    }

    /**
     * Get information about custom fields (filtered out by namespace/pakage, type and sobject)
     * 
     * @returns {SFDC_Field[]} List of items to return
     * @throws Exception if rate >= THRESHOLD
     */
    async getCustomFields(namespace, sobjectType, sobject) {
        return this.#recipeManager.run(RECIPE_CUSTOMFIELDS_ALIAS, namespace, sobjectType, sobject);
    }

    removeAllCustomFieldsCache() {
        this.#recipeManager.clean(RECIPE_CUSTOMFIELDS_ALIAS);
    }

    /**
     * Get information about permission sets (filtered out by namespace/pakage)
     * 
     * @returns {SFDC_Profile[]} List of items to return
     * @throws Exception if rate >= THRESHOLD
     */
    async getPermissionSets(namespace) {
        return this.#recipeManager.run(RECIPE_PERMISSIONSETS_ALIAS, namespace);
    }
    
    removeAllPermSetsCache() {
        this.#recipeManager.clean(RECIPE_PERMISSIONSETS_ALIAS);
    }

    /**
     * Get information about profiles (filtered out by namespace/pakage)
     * 
     * @returns {SFDC_Profile[]} List of items to return
     * @throws Exception if rate >= THRESHOLD
     */
    async getProfiles(namespace) {
        return this.#recipeManager.run(RECIPE_PROFILES_ALIAS, namespace);
    }

    removeAllProfilesCache() {
        this.#recipeManager.clean(RECIPE_PROFILES_ALIAS);
    }

    /**
     * Get information about profile restrictions (filtered out by namespace/pakage)
     * 
     * @returns {SFDC_ProfileRestiction[]} List of items to return
     * @throws Exception if rate >= THRESHOLD
     */
    async getProfileRestrictions(namespace) {
        return this.#recipeManager.run(RECIPE_PROFILERESTRICTIONS_ALIAS, namespace);
    }

    removeAllProfileRestrictionsCache() {
        this.#recipeManager.clean(RECIPE_PROFILERESTRICTIONS_ALIAS);
    }

    /**
     * Get information about profile password policies
     * 
     * @returns {SFDC_ProfilePasswordPolicy[]} List of items to return
     * @throws Exception if rate >= THRESHOLD
     */
    async getProfilePasswordPolicies() {
        return this.#recipeManager.run(RECIPE_PROFILEPWDPOLICIES_ALIAS);
    }

    removeAllProfilePasswordPoliciesCache() {
        this.#recipeManager.clean(RECIPE_PROFILEPWDPOLICIES_ALIAS);
    }

    /**
     * Get information about active users
     * 
     * @returns {SFDC_User[]} List of items to return
     * @throws Exception if rate >= THRESHOLD
     */
    async getActiveUsers() {
        return this.#recipeManager.run(RECIPE_ACTIVEUSERS_ALIAS);
    }

    removeAllActiveUsersCache() {
        this.#recipeManager.clean(RECIPE_ACTIVEUSERS_ALIAS);
    }

    /**
     * Get information about custom labels (filtered out by namespace/pakage)
     * 
     * @returns {SFDC_CustomLabel[]} List of items to return
     * @throws Exception if rate >= THRESHOLD
     */
    async getCustomLabels(namespace) {
        return this.#recipeManager.run(RECIPE_CUSTOMLABELS_ALIAS, namespace);
    }

    removeAllCustomLabelsCache() {
        this.#recipeManager.clean(RECIPE_CUSTOMLABELS_ALIAS);
    }

    /**
     * Get information about LWCs (filtered out by namespace/pakage)
     * 
     * @returns {SFDC_LightningWebComponent[]} List of items to return
     * @throws Exception if rate >= THRESHOLD
     */
    async getLightningWebComponents(namespace) {
        return this.#recipeManager.run(RECIPE_LIGHTNINGPWEBCOMPONENTS_ALIAS, namespace);
    }
    
    removeAllLightningWebComponentsCache() {
        this.#recipeManager.clean(RECIPE_LIGHTNINGPWEBCOMPONENTS_ALIAS);
    }

    /**
     * Get information about Aura Components (filtered out by namespace/pakage)
     * 
     * @returns {SFDC_LightningAuraComponent[]} List of items to return
     * @throws Exception if rate >= THRESHOLD
     */
    async getLightningAuraComponents(namespace) {
        return this.#recipeManager.run(RECIPE_LIGHTNINGAURACOMPONENTS_ALIAS, namespace);
    }

    removeAllLightningAuraComponentsCache() {
        this.#recipeManager.clean(RECIPE_LIGHTNINGAURACOMPONENTS_ALIAS);
    }

    /**
     * Get information about flexipages (filtered out by namespace/pakage)
     * 
     * @returns {SFDC_LightningPage[]} List of items to return
     * @throws Exception if rate >= THRESHOLD
     */
    async getLightningPages(namespace) {
        return this.#recipeManager.run(RECIPE_LIGHTNINGPAGES_ALIAS, namespace);
    }

    removeAllLightningPagesCache() {
        this.#recipeManager.clean(RECIPE_LIGHTNINGPAGES_ALIAS);
    }
    
    /**
     * Get information about VFCs (filtered out by namespace/pakage)
     * 
     * @returns {SFDC_VisualForceComponent[]} List of items to return
     * @throws Exception if rate >= THRESHOLD
     */
    async getVisualForceComponents(namespace) {
        return this.#recipeManager.run(RECIPE_VISUALFORCECOMPONENTS_ALIAS, namespace);
    }
    
    removeAllVisualForceComponentsCache() {
        this.#recipeManager.clean(RECIPE_VISUALFORCECOMPONENTS_ALIAS);
    }

    /**
     * Get information about VFPs (filtered out by namespace/pakage)
     * 
     * @returns {SFDC_VisualForcePage[]} List of items to return
     * @throws Exception if rate >= THRESHOLD
     */
    async getVisualForcePages(namespace) {
        return this.#recipeManager.run(RECIPE_VISUALFORCEPAGES_ALIAS, namespace);
    }

    removeAllVisualForcePagesCache() {
        this.#recipeManager.clean(RECIPE_VISUALFORCEPAGES_ALIAS);
    }
    
    /**
     * Get information about Public Groups and Queues
     * 
     * @returns {SFDC_Group[]} List of items to return
     * @throws Exception if rate >= THRESHOLD
     */
    async getGroups() {
        return this.#recipeManager.run(RECIPE_GROUPS_ALIAS);
    }

    removeAllGroups() {
        this.#recipeManager.clean(RECIPE_GROUPS_ALIAS);
    }

    /**
     * Get information about Apex Classes (filtered out by namespace/pakage)
     * 
     * @returns {SFDC_ApexClass[]} List of items to return
     * @throws Exception if rate >= THRESHOLD
     */
    async getApexClasses(namespace) {
        return this.#recipeManager.run(RECIPE_APEXCLASSES_ALIAS, namespace);
    }

    removeAllApexClassesCache() {
        this.#recipeManager.clean(RECIPE_APEXCLASSES_ALIAS);
    }
    
    /**
     * Get information about Apex triggers (filtered out by namespace/pakage)
     * 
     * @returns {SFDC_ApexTrigger[]} List of items to return
     * @throws Exception if rate >= THRESHOLD
     */
    async getApexTriggers(namespace) {
        return this.#recipeManager.run(RECIPE_APEXTRIGGERS_ALIAS, namespace);
    }

    removeAllApexTriggersCache() {
        this.#recipeManager.clean(RECIPE_APEXTRIGGERS_ALIAS);
    }

    /**
     * Get information about User roles in a tabular view
     * 
     * @returns {SFDC_UserRole[]} List of items to return
     * @throws Exception if rate >= THRESHOLD
     */
    async getRoles() {
        return this.#recipeManager.run(RECIPE_USERROLES_ALIAS);
    }

    removeAllRolesCache() {
        this.#recipeManager.clean(RECIPE_USERROLES_ALIAS);
    }

    /**
     * Get information about User Roles in a tree view
     * 
     * @returns {SFDC_UserRole} Tree
     * @throws Exception if rate >= THRESHOLD
     */
    async getRolesTree() {
        // Get data
        const allRoles = await this.#recipeManager.run(RECIPE_USERROLES_ALIAS);
        // Create a map that stores all nodes
        // Where:
        //   - key is the id of the node (string)
        //   - value is the node with properties: 
        //        * 'id' (mandatory string), 
        //        * 'children' (optional array), and,
        //        * 'record' (undefined for root, mandatory for other than root -- of type: SFDC_UserRole)
        const allNodes = new Map();
        // Key for artificial ROOT
        const ROOT_KEY = '##i am root##';
        // Note that 'allRoles' is an 'Array'
        allRoles.forEach((role) => { 
            // is this node already registered? if false create (with no children!) and set in the map
            if (allNodes.has(role.id) === false) { allNodes.set(role.id, { id: role.id }) }
            // get a reference to this node
            const node = allNodes.get(role.id);
            // if that node just got registered, it has no 'record' yet
            // if that node was previously a parent (and got registered at that time), it has no 'record' yet
            if (!node.record) node.record = role; // for this reasons, we set the record property if not set
            // get the id of its parent (if no parent using the artificial 'root' node)
            const parentId = role.hasParent === true ? role.parentId : ROOT_KEY;
            // is the parent already registered? if false create (with no record!) and set in the map
            if (allNodes.has(parentId) === false) { allNodes.set(parentId, { id: parentId }) }
            // get a reference to this parent node
            const parentNode = allNodes.get(parentId);
            // if that parent just got registered, it has no 'children' yet
            // if that parent was previously a child (and got registered at that time), it has no 'children' yet
            if (!parentNode.children) parentNode.children = []; // for this reasons, we set the children property if not set
            parentNode.children.push(node);
        });
        return allNodes.get(ROOT_KEY);
    }

    /**
     * Get information about Workflows
     * 
     * @returns {SFDC_Workflow[]} List of items to return
     * @throws Exception if rate >= THRESHOLD
     */
    async getWorkflows() {
        return this.#recipeManager.run(RECIPE_WORKFLOWS_ALIAS);
    }

    removeAllWorkflowsCache() {
        this.#recipeManager.clean(RECIPE_WORKFLOWS_ALIAS);
    }

    /**
     * Get information about Flows
     * 
     * @returns {SFDC_Flow[]} List of items to return
     * @throws Exception if rate >= THRESHOLD
     */
    async getFlows() {
        return this.#recipeManager.run(RECIPE_FLOWS_ALIAS);
    }

    removeAllFlowsCache() {
        this.#recipeManager.clean(RECIPE_FLOWS_ALIAS);
    }
    
    /**
     * Get information about Process Builders
     * 
     * @returns {SFDC_Flow[]} List of items to return
     * @throws Exception if rate >= THRESHOLD
     */
    async getProcessBuilders() {
        return this.#recipeManager.run(RECIPE_PROCESSBUILDERS_ALIAS);
    }

    removeAllProcessBuildersCache() {
        this.#recipeManager.clean(RECIPE_PROCESSBUILDERS_ALIAS);
    }    
}