import { LightningElement, api, track } from 'lwc';

export default class scanConfigurator extends LightningElement {
    @api rules;
    @track localRules;
    severityOptions = [
        { label: 'Error', value: 'error' },
        { label: 'Warning', value: 'warning' },
        { label: 'Info', value: 'info' },
        { label: 'Note', value: 'note' }
    ];

    connectedCallback() {
        this.localRules = this.rules ? JSON.parse(JSON.stringify(this.rules)) : [];
    }

    get allRulesDisabled() {
        return this.localRules.every(rule => !rule.isActive);
    }

    get allRulesEnabled() {
        return this.localRules.every(rule => rule.isActive);
    }

    get toggleAllLabel() {
        return this.allRulesDisabled ? 'Enable All Rules' : 'Disable All Rules';
    }

    handleToggleAllRules(event) {
        const isChecked = event.target.checked;
        this.localRules = this.localRules.map(rule => ({
            ...rule,
            isActive: isChecked
        }));

        this.dispatchEvent(
            new CustomEvent('rulechange', {
                detail: { rules: this.localRules }
            })
        );
    }

    handleRuleToggle(event) {
        const ruleId = event.target.dataset.ruleId;
        this.localRules = this.localRules.map(rule => {
            if (rule.id === ruleId) {
                return { ...rule, isActive: event.target.checked };
            }
            return rule;
        });

        this.dispatchEvent(
            new CustomEvent('rulechange', {
                detail: { rules: this.localRules }
            })
        );
    }

    handleSeverityChange(event) {
        const ruleId = event.target.dataset.ruleId;
        const newSeverity = event.target.value;
        this.localRules = this.localRules.map(rule => {
            if (rule.id === ruleId) {
                return { ...rule, severity: newSeverity };
            }
            return rule;
        });

        this.dispatchEvent(
            new CustomEvent('rulechange', {
                detail: { rules: this.localRules }
            })
        );
    }
}