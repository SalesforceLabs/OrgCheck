import { LightningElement, api } from 'lwc';
import OrgCheckStaticRessource from "@salesforce/resourceUrl/OrgCheck_SR";
import { OrgCheckAPI } from './orgcheck-api';
import { loadScript } from 'lightning/platformResourceLoader';

export const METHOD_TYPES_PACKAGES_OBJECTS = 'types+packages+objects';
export const METHOD_CUSTOM_FIELD = 'custom-fields';
export const METHOD_OBJECT_DESCRIBE = 'object-describe';
export const METHOD_PERMISSION_SETS = 'permission-sets';
export const METHOD_PROFILES = 'profiles';
export const METHOD_USERS = 'users';
export const METHOD_CACHE_MANAGER = 'cache-manager';

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
                this.userid,
                {
                    begin: () => { this.dispatchEvent(new CustomEvent('log', { detail: { status: 'begin' }, bubbles: false })); },
                    sectionStarts: (s, m) => { this.dispatchEvent(new CustomEvent('log', { detail: { status: 'section-starts', section: s, message: m }, bubbles: false })); },
                    sectionContinues: (s, m) => { this.dispatchEvent(new CustomEvent('log', { detail: { status: 'section-in-progress', section: s, message: m }, bubbles: false })); },
                    sectionEnded: (s, m) => { this.dispatchEvent(new CustomEvent('log', { detail: { status: 'section-ended', section: s, message: m }, bubbles: false })); },
                    sectionFailed: (s, m) => { this.dispatchEvent(new CustomEvent('log', { detail: { status: 'section-failed', section: s, message: m }, bubbles: false })); },
                    end: () => { this.dispatchEvent(new CustomEvent('log', { detail: { status: 'end' }, bubbles: false })); }
                }
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

    @api removeCache(name) {
        this.#api.removeCache(name);
    }

    @api async callingApi(method, args) {

        const dailyApiLimitRate = this.#api.getOrgDailyApiLimitRate();
        this.orgLimit = 'Daily API Limit: ' + ((dailyApiLimitRate * 100).toFixed(3)) + ' %';
        if (dailyApiLimitRate > 0.9) this.themeForOrgLimit = 'slds-theme_error';
        else if (dailyApiLimitRate > 0.7) this.themeForOrgLimit = 'slds-theme_warning'
        else this.themeForOrgLimit = 'slds-badge_lightest';

        switch (method) {
            case METHOD_TYPES_PACKAGES_OBJECTS:
                return this.#api.getPackagesTypesAndObjects(args.package, args.sobjectType);
            case METHOD_CUSTOM_FIELD:
                return this.#api.getCustomFields(args.package, args.sobjectType, args.sobject);
            case METHOD_PERMISSION_SETS:
                return this.#api.getPermissionSets(args.package);
            case METHOD_PROFILES:
                return this.#api.getProfiles(args.package);
            case METHOD_USERS:
                return this.#api.getActiveUsers();
            case METHOD_CACHE_MANAGER:
                return this.#api.getCacheInformation();
            case METHOD_OBJECT_DESCRIBE:
            default:
                return Promise.reject(new Error(`Calling the api with method=${method} is not permitted.`));
        }
    }
}