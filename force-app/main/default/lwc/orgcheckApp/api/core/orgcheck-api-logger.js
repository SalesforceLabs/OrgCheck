/**
 * @description Logger Interface for OrgCheck 
 */ 
export class OrgCheckLoggerIntf {

    /**
     * @description The logger begins
     * @public
     */
    begin() { throw new TypeError(`You need to implement the method "begin()"`); }

    /**
     * @description The given section starts (with an optional message)
     * @param {string} sectionName 
     * @param {string} [message] 
     * @public
     */
    sectionStarts(sectionName, message) { throw new TypeError(`You need to implement the method "sectionStarts()"`); }

    /**
     * @description The given section continues (with an optional message)
     * @param {string} sectionName 
     * @param {string} [message] 
     * @public
     */
    sectionContinues(sectionName, message) { throw new TypeError(`You need to implement the method "sectionContinues()"`); }

    /**
     * @description The given section ends (with an optional message)
     * @param {string} sectionName 
     * @param {string} [message] 
     * @public
     */
    sectionEnded(sectionName, message) { throw new TypeError(`You need to implement the method "sectionEnded()"`); }

    /**
     * @description The given section starts (with an optional message)
     * @param {string} sectionName 
     * @param {Error | string} [error] 
     * @public
     */
    sectionFailed(sectionName, error) { throw new TypeError(`You need to implement the method "sectionFailed()"`); }

    /**
     * @description The logger ends
     * @param {number} [countSuccesses=0]
     * @param {number} [countFailures=0]
     * @public
     */
    end(countSuccesses=0, countFailures=0) { throw new TypeError(`You need to implement the method "end()"`); }

    /**
     * @description Turn this logger into a simple logger for a specific section
     * @param {string} sectionName 
     * @returns {OrgCheckSimpleLoggerIntf}
     */ 
    toSimpleLogger(sectionName) { throw new TypeError(`You need to implement the method "toSimpleLogger()"`); }
}

/**
 * @description Simple Logger interface
 */
export class OrgCheckSimpleLoggerIntf {

    /**
     * @description Simple log method with a message to output somewhere
     * @type {(message: string) => void}
     * @public
     */
    log(message) { throw new TypeError(`You need to implement the method "log()"`); };

    /**
     * @description Simple debug method with a message to output somewhere
     * @type {(message: string) => void}
     * @public
     */
    debug(message) { throw new TypeError(`You need to implement the method "debug()"`); };
}