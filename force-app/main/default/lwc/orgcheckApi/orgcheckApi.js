import { LightningElement, api } from 'lwc';
import OrgCheckStaticRessource from "@salesforce/resourceUrl/OrgCheck_SR";
import { OrgCheckAPI } from './orgcheck-api';
import { loadScript } from 'lightning/platformResourceLoader';

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

    _updateLimits() {
        const dailyApiLimitRate = this.#api.getOrgDailyApiLimitRate();
        this.orgLimit = 'Daily API Limit: ' + ((dailyApiLimitRate * 100).toFixed(3)) + ' %';
        if (dailyApiLimitRate > 0.9) this.themeForOrgLimit = 'slds-theme_error';
        else if (dailyApiLimitRate > 0.7) this.themeForOrgLimit = 'slds-theme_warning'
        else this.themeForOrgLimit = 'slds-badge_lightest';
    }

    @api async getPackagesTypesAndObjects(namespace, sobjectType) {
        this._updateLimits();
        return this.#api.getPackagesTypesAndObjects(namespace, sobjectType);
    }

    @api async getObject(sobject) {
        this._updateLimits();
        return this.#api.getObject(sobject);
    }

    @api async getCustomFields(namespace, sobjectType, sobject) {
        this._updateLimits();
        return this.#api.getCustomFields(namespace, sobjectType, sobject);
    }

    @api async getPermissionSets(namespace) {
        this._updateLimits();
        return this.#api.getPermissionSets(namespace);
    }

    @api async getProfiles(namespace) {
        this._updateLimits();
        return this.#api.getProfiles(namespace);
    }

    @api async getActiveUsers() {
        this._updateLimits();
        return this.#api.getActiveUsers();
    }

    @api async getCacheInformation() {
        this._updateLimits();
        return this.#api.getCacheInformation();
    }
}