export class OrgCheckLogger {

    #setup;

    constructor(setup) {
        this.#setup = setup;
    }

    begin() {
        if (this.#setup.begin) {
            this.#setup.begin();
        } else {
            console.info('Let the show begin...');
        }
    }

    sectionStarts(sectionName, message='...') {
        if (this.#setup.sectionStarts) {
            this.#setup.sectionStarts(sectionName, message);
        } else {
            console.info(sectionName, message);
        }
    }

    sectionContinues(sectionName, message='...') {
        if (this.#setup.sectionContinues) {
            this.#setup.sectionContinues(sectionName, message);
        } else {
            console.info(sectionName, message);
        }
    }

    sectionEnded(sectionName, message='...') {
        if (this.#setup.sectionEnded) {
            this.#setup.sectionEnded(sectionName, message);
        } else {
            console.info(sectionName, message);
        }
    }

    sectionFailed(sectionName, message='...') {
        if (this.#setup.sectionFailed) {
            this.#setup.sectionFailed(sectionName, message);
        } else {
            console.error(sectionName, message);
        }
    }

    end() {
        if (this.#setup.end) {
            this.#setup.end();
        } else {
            console.info('All shows come to an end.');
        }
    }
}