import { LightningElement, api } from 'lwc';

export default class OrgcheckDependencyViewer extends LightningElement {

    isShown;
    whatid;
    whatname;
    dependencies;

    @api open(whatid, whatname, dependencies) {
        this.isShown = false;
        this.whatid = whatid;
        this.whatname = whatname;
        this.dependencies = dependencies;
        this.isShown = true;
    }

    handleClose() {
        this.isShown = false;
    }
}