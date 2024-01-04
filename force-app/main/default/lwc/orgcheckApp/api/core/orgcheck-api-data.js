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
                throw new Error(`Missing 'allDependencies' information in setup as this data does need dependencies.`);
            }
            if (!setup.dependenciesFor) {
                throw new Error(`Missing 'dependenciesFor' information in setup as this data does need dependencies.`);
            }
            const id = this[setup.dependenciesFor];
            if (!id) {
                throw new Error(`The property "${setup.dependenciesFor}" is undefined for this data. Impossible to calculate dependencies.`);
            }
            this.dependencies = new OrgCheckDataDependencies(setup.allDependencies, id);
        }
    }

    setBadField(field) {
        if (!this.badFields) {
            throw new Error('Should not call setBadField() as this data does not need score.');
        }
        if (!field) {
            throw new Error('Field is a mandatory when calling setBadField()');
        }
        if (this.badFields.includes(field) === false) {
            this.badFields.push(field);
            this.badScore = this.badFields.length;
        }
    }

    isItReferenced() {
        if (!this.dependencies) {
            throw new Error('Should not call isItReferenced() as this data does not need dependencies.');
        }
        return this.dependencies.referenced.length > 0;
    }
}