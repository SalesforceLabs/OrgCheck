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
                    begin: () => { this.dispatchEvent(new CustomEvent('log', { detail: { status: 'begin' } })); },
                    sectionStarts: (s, m) => { this.dispatchEvent(new CustomEvent('log', { detail: { status: 'section-starts', section: s, message: m } })); },
                    sectionContinues: (s, m) => { this.dispatchEvent(new CustomEvent('log', { detail: { status: 'section-in-progress', section: s, message: m } })); },
                    sectionEnded: (s, m) => { this.dispatchEvent(new CustomEvent('log', { detail: { status: 'section-ended', section: s, message: m } })); },
                    sectionFailed: (s, e) => { this.dispatchEvent(new CustomEvent('log', { detail: { status: 'section-failed', section: s, error: e } })); },
                    end: (s, f) => { this.dispatchEvent(new CustomEvent('log', { detail: { status: 'end', nbSuccesses: s, nbFailures: f } })); }
                }
            );
            this.#api.getOrgInformation().then((orgInfo) => {
                this.orgName = `${orgInfo.name} (${orgInfo.id})`;
                this.orgType = orgInfo.type;
                this.dispatchEvent(new CustomEvent('load'));
            });
        }).catch((e) => {
            this.dispatchEvent(new CustomEvent('fail', { detail: { error: e } }));
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
        } else {
            this.isDebug = true;
            this.logoURL = DEBUG_LOGO;
        }
    }

    @api removeAllCache() {
        this.#api.removeAllCache();
    }

    @api removeCache(name) {
        this.#api.removeCache(name);
    }

    _updateLimits() {
        const dailyApiLimitRate = this.#api.getOrgDailyApiLimitRate();
        const dailyApiLimitPercentage = (dailyApiLimitRate * 100).toFixed(3);
        this.orgLimit = `Daily API Limit: ${dailyApiLimitPercentage} %`;
        if (dailyApiLimitRate > 0.9) this.themeForOrgLimit = 'slds-theme_error';
        else if (dailyApiLimitRate > 0.7) this.themeForOrgLimit = 'slds-theme_warning'
        else this.themeForOrgLimit = 'slds-badge_lightest';
    }

    @api async getPackagesTypesAndObjects(namespace, sobjectType) {
        this._updateLimits();
        const data = await this.#api.getPackagesTypesAndObjects(namespace, sobjectType);
        return JSON.stringify(data);
    }

    @api async getObject(sobject) {
        this._updateLimits();
        const data = await this.#api.getObject(sobject);
        return JSON.stringify(data);
    }

    @api async getCustomFields(namespace, sobjectType, sobject) {
        this._updateLimits();
        const data = await this.#api.getCustomFields(namespace, sobjectType, sobject);
        return JSON.stringify(data);
    }

    @api async getPermissionSets(namespace) {
        this._updateLimits();
        const data = await this.#api.getPermissionSets(namespace);
        return JSON.stringify(data);
    }

    @api async getProfiles(namespace) {
        this._updateLimits();
        const data = await this.#api.getProfiles(namespace);
        return JSON.stringify(data);
    }

    @api async getActiveUsers() {
        this._updateLimits();
        const data = await this.#api.getActiveUsers();
        return JSON.stringify(data);
    }

    @api async getCustomLabels(namespace) {
        this._updateLimits();
        const data = await this.#api.getCustomLabels(namespace);
        return JSON.stringify(data);
    }

    @api async getLightningWebComponents(namespace) {
        this._updateLimits();
        const data = await this.#api.getLightningWebComponents(namespace);
        return JSON.stringify(data);
    }

    @api async getLightningAuraComponents(namespace) {
        this._updateLimits();
        const data = await this.#api.getLightningAuraComponents(namespace);
        return JSON.stringify(data);
    }

    @api async getLightningPages(namespace) {
        this._updateLimits();
        const data = await this.#api.getLightningPages(namespace);
        return JSON.stringify(data);
    }

    @api async getVisualForceComponents(namespace) {
        this._updateLimits();
        const data = await this.#api.getVisualForceComponents(namespace);
        return JSON.stringify(data);
    }

    @api async getVisualForcePages(namespace) {
        this._updateLimits();
        const data = await this.#api.getVisualForcePages(namespace);
        return JSON.stringify(data);
    }

    @api async getPublicGroups(namespace) {
        this._updateLimits();
        const data = await this.#api.getPublicGroups(namespace);
        return JSON.stringify(data);
    }

    @api async getQueues(namespace) {
        this._updateLimits();
        const data = await this.#api.getQueues(namespace);
        return JSON.stringify(data);
    }

    @api async getCacheInformation(namespace) {
        this._updateLimits();
        const data = await this.#api.getCacheInformation(namespace);
        return JSON.stringify(data);
    }

    @api async getApexClasses(namespace) {
        this._updateLimits();
        const data = await this.#api.getApexClasses(namespace);
        return JSON.stringify(data);
    }
}