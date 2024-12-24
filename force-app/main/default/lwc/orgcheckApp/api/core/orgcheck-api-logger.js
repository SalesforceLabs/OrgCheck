// @ts-check

export class OrgCheckLogger {

    #setup;
    #countSuccesses;
    #countFailures;

    constructor(setup) {
        this.#setup = setup;
        this.#countSuccesses = 0;
        this.#countFailures = 0;
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
        this.#countSuccesses++;
        if (this.#setup.sectionEnded) {
            this.#setup.sectionEnded(sectionName, message);
        } else {
            console.info(sectionName, message);
        }
    }

    sectionFailed(sectionName, error) {
        this.#countFailures++;
        if (this.#setup.sectionFailed) {
            this.#setup.sectionFailed(sectionName, error);
        } else {
            console.error(sectionName, error);
        }
    }

    end() {
        if (this.#setup.end) {
            this.#setup.end(this.#countSuccesses, this.#countFailures);
        } else {
            console.info(`All shows come to an end, in your case you had ${this.#countSuccesses} success(es) and ${this.#countFailures} failure(s).`);
        }
        this.#countSuccesses = 0;
        this.#countFailures = 0;
    }
}