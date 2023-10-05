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

    @api async getCustomLabels(namespace) {
        this._updateLimits();
        return this.#api.getCustomLabels(namespace);
    }

    @api async getLightningWebComponents(namespace) {
        this._updateLimits();
        return this.#api.getLightningWebComponents(namespace);
    }

    @api async getLightningAuraComponents(namespace) {
        this._updateLimits();
        return this.#api.getLightningAuraComponents(namespace);
    }

    @api async getLightningPages(namespace) {
        this._updateLimits();
        return this.#api.getLightningPages(namespace);
    }

    @api async getVisualForceComponents(namespace) {
        this._updateLimits();
        return this.#api.getVisualForceComponents(namespace);
    }

    @api async getVisualForcePages(namespace) {
        this._updateLimits();
        return this.#api.getVisualForcePages(namespace);
    }

    @api async getCacheInformation() {
        this._updateLimits();
        return this.#api.getCacheInformation();
    }
}