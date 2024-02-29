import { OrgCheckDataDependencies } from './orgcheck-api-data-dependencies';

export class OrgCheckData {

    badScore;
    badFields;
    dependencies;

    initData(setup) { 

        // Copy properties from setup to object
        // NB: Please note that ONLY the properties explicitely set in
        //     the class will be copied from setup to object
        Object.keys(this).forEach((p) => { this[p] = setup[p]; });

        // If need scoring...
        if (setup.isScoreNeeded === true) {
            this.badFields = [];
        }

        // If dependencies are needed...
        if (setup.isDependenciesNeeded === true) {
            if (!setup.allDependencies) {
                throw new TypeError(`Missing 'allDependencies' information in setup as this data does need dependencies.`);
            }
            if (!setup.dependenciesFor) {
                throw new TypeError(`Missing 'dependenciesFor' information in setup as this data does need dependencies.`);
            }
            const id = this[setup.dependenciesFor];
            if (!id) {
                throw new TypeError(`The property "${setup.dependenciesFor}" is undefined for this data. Impossible to calculate dependencies.`);
            }
            this.dependencies = new OrgCheckDataDependencies(setup.allDependencies, id);
        }

        Object.seal(this);
    }

    setBadField(field) {
        if (!this.badFields) {
            throw new TypeError('Should not call setBadField() as this data does not need score.');
        }
        if (!field) {
            throw new TypeError('Field is a mandatory when calling setBadField()');
        }
        if (this.badFields.includes(field) === false) {
            this.badFields.push(field);
            this.badScore = this.badFields.length;
        }
    }

    isItReferenced() {
        if (!this.dependencies) {
            throw new TypeError('Should not call isItReferenced() as this data does not need dependencies.');
        }
        return this.dependencies.referenced.length > 0;
    }
}