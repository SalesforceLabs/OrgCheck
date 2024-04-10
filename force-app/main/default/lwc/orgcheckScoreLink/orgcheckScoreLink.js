import { LightningElement, api } from 'lwc';

export default class OrgcheckScoreLink extends LightningElement {

    @api whatId;
    @api whatName;
    @api score;
    @api reasonIds; 
    @api fields;

    handleClick() {
        this.dispatchEvent(new CustomEvent('view', { detail: { 
            whatId: this.whatId,
            whatName: this.whatName,
            score: this.score,
            reasonIds: this.reasonIds, 
            fields: this.fields 
        }}));
    }

}