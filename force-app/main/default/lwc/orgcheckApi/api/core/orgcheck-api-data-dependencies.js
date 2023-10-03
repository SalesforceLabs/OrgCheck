export class OrgCheckDataDependencies {

    using;
    referenced;
    referencedByTypes;

    constructor(data, whatid) {

        this.using = data.filter(e => e.id === whatid).map(n => { 
            return { 
                id: n.refId, 
                name: n.refName, 
                type: n.refType
            }; 
        });
        this.referencedByTypes = {};
        this.referenced = data.filter(e => e.refId === whatid).map(n => {
            if (this.referencedByTypes[n.type] === undefined) {
                this.referencedByTypes[n.type] = 1;
            } else {
                this.referencedByTypes[n.type]++; 
            }
            return { 
                id: n.id, 
                name: n.name, 
                type: n.type
            };
        });
    }
}