import { LightningElement, api } from 'lwc';
import OrgCheckStaticRessource from "@salesforce/resourceUrl/OrgCheck_SR";
import { OrgCheckAPI } from './orgcheck-api';
import { loadScript } from 'lightning/platformResourceLoader';

export const METHOD_TYPES = 'types';
export const METHOD_PACKAGES = 'packages';
export const METHOD_OBJECTS = 'objects';
export const METHOD_CUSTOM_FIELD = 'custom-fields';
export const METHOD_OBJECT_DESCRIBE = 'object-describe';
export const METHOD_PERMISSION_SETS = 'permission-sets';
export const METHOD_PROFILES = 'profiles';
export const METHOD_USERS = 'users';

export default class OrgcheckApi extends LightningElement {

    @api accesstoken;
    @api userid;

    #api;

    orgName;
    orgType;
    orgLimit;
    themeForOrgLimit;

    logoURL = OrgCheckStaticRessource + '/img/Logo.svg';

    connectedCallback() {
        Promise.all([
            loadScript(this, OrgCheckStaticRessource + '/js/jsforce.js')
        ]).then(() => {
            this.#api = new OrgCheckAPI(
                // eslint-disable-next-line no-undef
                jsforce,
                this.accesstoken,
                this.userid
            );
            this.#api.getOrgInformation().then((orgInfo) => {
                this.orgName = `${orgInfo.name} (${orgInfo.id})`;
                this.orgType = orgInfo.type;
                this.dispatchEvent(new CustomEvent('load', { bubbles: false }));
            });
        }).catch((e) => {
            this.dispatchEvent(new CustomEvent('fail', { detail: { error: e }, bubbles: false }));
        });
    }
    
    get orgCheckVersion() {
        return this.#api?.version();
    }

    @api removeAllCache() {
        this.#api.removeAllCache();
    }

    @api async callingApi(method, args) {

        const dailyApiLimitRate = this.#api.getOrgDailyApiLimitRate();
        this.orgLimit = 'Daily API Limit: ' + ((dailyApiLimitRate * 100).toFixed(3)) + ' %';
        if (dailyApiLimitRate > 0.9) this.themeForOrgLimit = 'slds-theme_error';
        else if (dailyApiLimitRate > 0.7) this.themeForOrgLimit = 'slds-theme_warning'
        else this.themeForOrgLimit = 'slds-badge_lightest';

        switch (method) {
            case METHOD_TYPES:
                return Promise.resolve(this.#api.getTypes());
            case METHOD_PACKAGES:
                return this.#api.getPackages();
            case METHOD_OBJECTS:
                return this.#api.getObjects(args.package, args.sobjectType);
            case METHOD_CUSTOM_FIELD:
                return this.#api.getCustomFields(args.package, args.sobjectType, args.sobject);
            case METHOD_PERMISSION_SETS:
                return this.#api.getPermissionSets(args.package);
            case METHOD_PROFILES:
                return this.#api.getProfiles(args.package);
            case METHOD_USERS:
                return this.#api.getActiveUsers();
            case METHOD_OBJECT_DESCRIBE:
            default:
                return Promise.reject(new Error(`Calling the api with method=${method} is not permitted.`));
        }
    }
}