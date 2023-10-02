export class OrgCheckDataDependencies {

    using;
    referenced;
    referencedByTypes;

    constructor(data, whatid) {
        this.using = data.filter(e => e.id === whatid).map(n => { 
            return { id: n.refId, name: n.refName, type: n.refType }; 
        });
        this.referencedByTypes = {};
        this.referenced = data.filter(e => e.refId === whatid).map(n => {
            if (this.referencedByTypes[n.type] === undefined) {
                this.referencedByTypes[n.type] = 1;
            } else {
                this.referencedByTypes[n.type]++; 
            }
            return { id: n.id, name: n.name, type: n.type };
        });
    }

    isItReferenced() {
        return this.referenced.length === 0;
    }
}

export class OrgCheckData {

    #badFields;
    dependencies;

    initData(setup) { 

        // Copy properties from setup to object
        // NB: Please note that ONLY the properties explicitely set in
        //     the class will be copied from setup to object
        Object.keys(this).forEach((p) => { this[p] = setup[p]; });

        // If need scoring...
        if (setup.isScoreNeeded === true) {
            this.#badFields = [];
        }

        // If dependencies are needed...
        if (setup.isDependenciesNeeded === true) {
            if (!setup.dependencies) {
                throw new Error(`Missing 'dependencies' information in setup as this data does need dependencies.`);
            }
            if (!setup.dependenciesFor) {
                throw new Error(`Missing 'dependenciesFor' information in setup as this data does need dependencies.`);
            }
            const id = this[setup.dependenciesFor];
            if (!id) {
                throw new Error(`The property "${setup.dependenciesFor}" is undefined for this data. Impossible to calculate dependencies.`);
            }
            this.dependencies = new OrgCheckDataDependencies(setup.dependencies, id);
        }
    }

    setBadField(field) {
        if (!this.#badFields) {
            throw new Error('Should not call setBadField() as this data does not need score.');
        }
        if (!field) {
            throw new Error('Field is a mandatory when calling hasBadField()');
        }
        if (this.#badFields.includes(field) === false) {
            this.#badFields.push(field);
            this.badScore = this.#badFields.length;
        }
    }

    hasBadField(field) {
        if (!this.#badFields) {
            throw new Error('Should not call hasBadField() as this data does not need score.');
        }
        if (!field) {
            throw new Error('Field is a mandatory when calling hasBadField()');
        }
        return this.#badFields.includes(field);
    }

    getBadScore() {
        if (!this.#badFields) {
            throw new Error('Cannot call getBadScore() because this data does not need score.');
        }
        return this.#badFields.length;
    }
}