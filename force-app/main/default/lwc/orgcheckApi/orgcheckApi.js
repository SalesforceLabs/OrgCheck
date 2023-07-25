/*global jsforce, orgcheck*/
/*eslint no-undef: "error"*/

import { LightningElement, api } from 'lwc';
import OrgCheckStaticRessource from "@salesforce/resourceUrl/OrgCheck_SR";
import { loadScript } from 'lightning/platformResourceLoader';

const errorHandling = (me, what, error) => {
    me.dispatchEvent(new CustomEvent('error', { detail: { from: what, error: error }, bubbles: false }));
}

const successHandling = (me) => {
    me.dispatchEvent(new CustomEvent('load', { bubbles: false }));
}

export default class OrgcheckApi extends LightningElement {

    @api accesstoken;
    @api userid;

    #api;

    orgName;
    orgType;
    orgLimit;
    themeForOrgType;
    themeForOrgLimit;

    logoURL = OrgCheckStaticRessource + '/img/Logo.svg';

    get orgCheckVersion() {
        return this.#api?.version();
    }

    @api packages() {
        this.updateDailyAPILimit();
        return this.#api.getPackages().catch((e) => errorHandling(this, 'packages', e));
    }

    @api types() {
        try {
            return this.#api.getTypes();
        } catch (e) {
            errorHandling(this, 'types', e);
            return [];
        }
    }

    @api objects(packageApiName, sobjectType) {
        this.updateDailyAPILimit();
        return this.#api.getObjects(packageApiName, sobjectType).catch((e) => errorHandling(this, 'objects', e));
    }

    @api customFields(packageApiName, sobjectType, sobjectApiName) {
        this.updateDailyAPILimit();
        return this.#api.getCustomFields(sobjectApiName).catch((e) => errorHandling(this, 'customFields', e));
    }

    updateDailyAPILimit() {
        const dailyApiLimitRate = this.#api.getOrgLimits().dailyApiLimitRate;
        this.orgLimit = 'Daily API Limit: ' + ((dailyApiLimitRate * 100).toFixed(3)) + ' %';
        this.themeForOrgLimit = (dailyApiLimitRate > 0.9) ? 'slds-theme_error' : 
                                ((dailyApiLimitRate > 0.7) ? 'slds-theme_warning' : 
                                'slds-badge_lightest');
    }

    connectedCallback() {

        Promise.all([
            loadScript(this, OrgCheckStaticRessource + '/js/jsforce.js'),
            loadScript(this, OrgCheckStaticRessource + '/js/orgcheck-api.js')
        ]).then(() => {

            this.#api = new orgcheck.OrgCheckAPI({
                salesforceConnector: jsforce,
                accessToken: this.accesstoken,
                userId: this.userid
            });

            this.#api.getOrgInfo().then((orgInfo) => {
                this.isCurrentOrgAProduction = (orgInfo.isProduction === true);
                this.orgName = orgInfo.name + ' (' + orgInfo.id + ')';
                this.orgType = orgInfo.type;
                this.themeForOrgType = (orgInfo.isProduction === true && this.settingUseInProductionConfirmation !== true) ? 'slds-theme_error' : 'slds-theme_success';
                this.updateDailyAPILimit();
                
                successHandling(this);

            }).catch((e) => errorHandling(this, 'connectedCallback', e));
        });
    }
}