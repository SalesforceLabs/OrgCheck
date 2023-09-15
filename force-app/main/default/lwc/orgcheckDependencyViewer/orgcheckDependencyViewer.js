import { LightningElement, api } from 'lwc';

export default class OrgcheckDependencyViewer extends LightningElement {

    isShow;
    whatid;
    whatname;
    dependencies;

    @api open(whatid, whatname, dependencies) {
        this.isShow = false;
        this.whatid = whatid;
        this.whatname = whatname;
        this.dependencies = dependencies;
        this.isShow = true;
    }

    handleClose() {
        this.isShow = false;
    }
}