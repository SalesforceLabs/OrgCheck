import { OrgCheckLoggerIntf, OrgCheckSimpleLoggerIntf } from "./orgcheck-api-logger";

/**
 * @description Logger for OrgCheck 
 */ 
export class OrgCheckLogger extends OrgCheckLoggerIntf {

    /**
     * @description Logger gets an injected logger :)
     * @type {OrgCheckLoggerIntf}
     * @private
     */
    _logger;

    /**
     * @description Count of successful sections
     * @type {number}
     * @private
     */
    _countSuccesses;

    /**
     * @description Count of failed sections
     * @type {number}
     * @private
     */
    _countFailures;

    /**
     * @description Constructor
     * @param {OrgCheckLoggerIntf} logger 
     */
    constructor(logger) {
        super()
        this._logger = logger;
        this._countSuccesses = 0;
        this._countFailures = 0;
    }

    /**
     * @see OrgCheckLoggerIntf.begin
     */ 
    begin() {
        // CONSOLE_LOG('global', 'begin');
        this._logger?.begin();
    }

    /**
     * @see OrgCheckLoggerIntf.sectionStarts
     * @param {string} sectionName 
     * @param {string} [message] 
     */ 
    sectionStarts(sectionName, message='...') {
        // CONSOLE_LOG(sectionName, 'start', message);
        this._logger?.sectionStarts(sectionName, message);
    }

    /**
     * @see OrgCheckLoggerIntf.sectionContinues
     * @param {string} sectionName 
     * @param {string} [message] 
     */ 
    sectionContinues(sectionName, message='...') {
        // CONSOLE_LOG(sectionName, 'in-progress', message);
        this._logger?.sectionContinues(sectionName, message);
    }

    /**
     * @see OrgCheckLoggerIntf.sectionEnded
     * @param {string} sectionName 
     * @param {string} [message] 
     */ 
    sectionEnded(sectionName, message='...') {
        this._countSuccesses++;
        // CONSOLE_LOG(sectionName, 'end', message);
        this._logger?.sectionEnded(sectionName, message);
    }

    /**
     * @see OrgCheckLoggerIntf.sectionFailed
     * @param {string} sectionName 
     * @param {Error | string} [error] 
     */ 
    sectionFailed(sectionName, error) {
        this._countFailures++;
        // CONSOLE_LOG(sectionName, 'failure', error);
        this._logger?.sectionFailed(sectionName, error);
    }

    /**
     * @see OrgCheckLoggerIntf.end
     */ 
    end() {
        // CONSOLE_LOG('global', 'end', `Successes: ${this._countSuccesses}, Failures: ${this._countFailures}`);
        this._logger?.end(this._countSuccesses, this._countFailures);
        this._countSuccesses = 0;
        this._countFailures = 0;
    }

    /**
     * @description Turn this logger into a simple logger for a specific section
     * @param {string} sectionName 
     * @returns {OrgCheckSimpleLoggerIntf}
     */ 
    toSimpleLogger(sectionName) {
        const internalLogger = this._logger;
        return { 
            log: (message) => { 
                // CONSOLE_LOG(sectionName, 'log', message);
                internalLogger?.sectionContinues(sectionName, message);
            },
            debug: (message) => { 
                // CONSOLE_LOG(sectionName, 'debug', message);
            }
        };
    }
}

/**
 * @description Logs the end of this section
 * @param {string} section 
 * @param {string} moment 
 * @param {string | Error} [message='...']
 */
const CONSOLE_LOG = (section, moment, message='...') => { 
    console.error(`${new Date().toISOString()} - ${section} - ${moment} - ${message}`); 
}