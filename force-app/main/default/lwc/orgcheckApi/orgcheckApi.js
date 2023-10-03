import { LightningElement, api } from 'lwc';
import OrgCheckStaticRessource from "@salesforce/resourceUrl/OrgCheck_SR";
import { OrgCheckAPI } from './api/orgcheck-api';
import { loadScript } from 'lightning/platformResourceLoader';

const NORMAL_LOGO = OrgCheckStaticRessource + '/img/Logo.svg';
const DEBUG_LOGO  = OrgCheckStaticRessource + '/img/Mascot.svg';

export default class OrgcheckApi extends LightningElement {

    @api accesstoken;
    @api userid;

    #api;
    isDebug;

    logoURL;
    orgName;
    orgType;
    orgLimit;
    themeForOrgLimit;

    connectedCallback() {
        
        this.isDebug = false;
        this.logoURL = NORMAL_LOGO;

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
                    end: (s, f) => { this.dispatchEvent(new CustomEvent('log', { detail: { status: 'end', nbSuccesses: s, nbFailures: f }, bubbles: false })); }
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

    handleDoubleClick() {
        this._switchDebugMode();
    }
    
    handleKeyDown(event) {
        if (event.key === 'Shift') {
            this._switchDebugMode();
        }
    }

    _switchDebugMode() {
        if (this.isDebug === true) {
            this.isDebug = false;
            this.logoURL = NORMAL_LOGO;
            console.debug(`Stopping debug mode. Good night!`);
        } else {
            this.isDebug = true;
            this.logoURL = DEBUG_LOGO;
            console.debug(`Switching to debug mode...`);
        }
    }

    @api removeAllCache() {
        if (this.isDebug) console.debug(`Calling <removeAllCache> of the API..`);
        this.#api.removeAllCache();
        if (this.isDebug) console.debug(`Returned from calling <removeAllCache>`);
    }

    @api removeCache(name) {
        if (this.isDebug) console.debug(`Calling <removeCache> of the API..`);
        this.#api.removeCache(name);
        if (this.isDebug) console.debug(`Returned from calling <removeCache>`);
    }

    _updateLimits() {
        if (this.isDebug) console.debug(`Calling <getOrgDailyApiLimitRate> of the API..`);
        const dailyApiLimitRate = this.#api.getOrgDailyApiLimitRate();
        if (this.isDebug) console.debug(`Returned from calling <getOrgDailyApiLimitRate> and got dailyApiLimitRate=${dailyApiLimitRate}`);
        const dailyApiLimitPercentage = (dailyApiLimitRate * 100).toFixed(3);
        if (this.isDebug) console.debug(`Updating <orgLimit> with dailyApiLimitPercentage=${dailyApiLimitPercentage}`);
        this.orgLimit = 'Daily API Limit: ' + ((dailyApiLimitRate * 100).toFixed(3)) + ' %';
        if (this.isDebug) console.debug(`Setting the color accroding to the percentage`);
        if (dailyApiLimitRate > 0.9) this.themeForOrgLimit = 'slds-theme_error';
        else if (dailyApiLimitRate > 0.7) this.themeForOrgLimit = 'slds-theme_warning'
        else this.themeForOrgLimit = 'slds-badge_lightest';
    }

    @api async getPackagesTypesAndObjects(namespace, sobjectType) {
        this._updateLimits();
        if (this.isDebug) console.debug(`Calling ASYNC <getPackagesTypesAndObjects> of the API with namespace=${namespace} and sobjectType=${sobjectType}..`);
        const data = this.#api.getPackagesTypesAndObjects(namespace, sobjectType);
        if (this.isDebug) console.debug(`Returned from calling <getPackagesTypesAndObjects> with promise`);
        return data;
    }

    @api async getObject(sobject) {
        this._updateLimits();
        if (this.isDebug) console.debug(`Calling ASYNC <getObject> of the API with sobject=${sobject}..`);
        const data = this.#api.getObject(sobject);
        if (this.isDebug) console.debug(`Returned from calling <getObject> with promise`);
        return data;
    }

    @api async getCustomFields(namespace, sobjectType, sobject) {
        this._updateLimits();
        if (this.isDebug) console.debug(`Calling ASYNC <getCustomFields> of the API with namespace=${namespace}, sobjectType=${sobjectType} and sobject=${sobject}..`);
        const data = this.#api.getCustomFields(namespace, sobjectType, sobject);
        if (this.isDebug) console.debug(`Returned from calling <getCustomFields> with promise`);
        return data;
    }

    @api async getPermissionSets(namespace) {
        this._updateLimits();
        if (this.isDebug) console.debug(`Calling ASYNC <getPermissionSets> of the API with namespace=${namespace}..`);
        const data = this.#api.getPermissionSets(namespace);
        if (this.isDebug) console.debug(`Returned from calling <getPermissionSets> with promise`);
        return data;
    }

    @api async getProfiles(namespace) {
        this._updateLimits();
        if (this.isDebug) console.debug(`Calling ASYNC <getProfiles> of the API with namespace=${namespace}..`);
        const data = this.#api.getProfiles(namespace);
        if (this.isDebug) console.debug(`Returned from calling <getProfiles> with promise`);
        return data;
    }

    @api async getActiveUsers() {
        this._updateLimits();
        if (this.isDebug) console.debug(`Calling ASYNC <getActiveUsers> of the API..`);
        const data = this.#api.getActiveUsers();
        if (this.isDebug) console.debug(`Returned from calling <getActiveUsers> with promise`);
        return data;
    }

    @api async getCustomLabels(namespace) {
        this._updateLimits();
        if (this.isDebug) console.debug(`Calling ASYNC <getCustomLabels> of the API..`);
        const data = this.#api.getCustomLabels(namespace);
        if (this.isDebug) console.debug(`Returned from calling <getCustomLabels> with promise`);
        return data;
    }

    @api async getCacheInformation() {
        this._updateLimits();
        if (this.isDebug) console.debug(`Calling ASYNC <getCacheInformation> of the API..`);
        const data = this.#api.getCacheInformation();
        if (this.isDebug) console.debug(`Returned from calling <getCacheInformation> with promise`);
        return data;
    }
}