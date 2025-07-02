/**
 * @description Basic logger Interface for  
 */ 
export class BasicLoggerIntf {

    /**
     * @description Check if this logger is a console fallback logger
     * @returns {boolean} true if this logger is a console fallback logger, false otherwise
     * @public
     */
    isConsoleFallback() {
        throw new TypeError(`You need to implement the method "isConsoleFallback()"`);
    }

    /**
     * @description The logger logs
     * @param {string} operationName
     * @param {string} [message] 
     * @public
     */
    log(operationName, message) { throw new TypeError(`You need to implement the method "log()"`); }

    /**
     * @description The given operation ended (with an optional message)
     * @param {string} operationName
     * @param {string} [message] 
     * @public
     */
    ended(operationName, message) { throw new TypeError(`You need to implement the method "ended()"`); }

    /**
     * @description The given operation failed (with an optional message/error)
     * @param {string} operationName
     * @param {Error | string} [error] 
     * @public
     */
    failed(operationName, error) { throw new TypeError(`You need to implement the method "failed()"`); }
}

/**
 * @description Logger Interface for  
 */ 
export class LoggerIntf extends BasicLoggerIntf {

    /**
     * @description Turn this logger into a simple logger for a specific operation
     * @param {string} operationName 
     * @returns {SimpleLoggerIntf}
     */ 
    toSimpleLogger(operationName) { throw new TypeError(`You need to implement the method "toSimpleLogger()"`); }
}

/**
 * @description Simple Logger interface
 */
export class SimpleLoggerIntf {

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