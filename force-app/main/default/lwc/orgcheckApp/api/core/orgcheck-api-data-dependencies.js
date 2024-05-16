export class OrgCheckDataDependencies {

    using;
    referenced;
    referencedByTypes;

    constructor(data, whatId) {

        this.using = data.filter(e => e.id === whatId).map(n => { 
            return { 
                id: n.refId, 
                name: n.refName, 
                type: n.refType,
                url: n.refUrl
            }; 
        });
        this.referencedByTypes = {};
        this.referenced = data.filter(e => e.refId === whatId).map(n => {
            if (this.referencedByTypes[n.type] === undefined) {
                this.referencedByTypes[n.type] = 1;
            } else {
                this.referencedByTypes[n.type]++; 
            }
            return { 
                id: n.id, 
                name: n.name, 
                type: n.type,
                url: n.url
            };
        });
    }
}