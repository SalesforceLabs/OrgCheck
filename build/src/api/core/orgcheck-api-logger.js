/**
 * @description Basic logger Interface for  
 */ 
export class BasicLoggerIntf {

    /**
     * @description Check if this logger is a console fallback logger
     * @returns {boolean | undefined} true if this logger is a console fallback logger, false otherwise
     * @public
     */
    isConsoleFallback() { throw new Error(`Method isConsoleFallback() not implemented yet.`); }

    /**
     * @description The logger logs
     * @param {string} operationName - the name of the operation
     * @param {string} [message] - the message to log
     * @public
     */
    log(operationName, message) { throw new Error(`Method log(operationName=${operationName}, message=${message}) not implemented yet.`); }

    /**
     * @description The given operation ended (with an optional message)
     * @param {string} operationName - the name of the operation
     * @param {string} [message] - the message to log
     * @public
     */
    ended(operationName, message) { throw new Error(`Method ended(operationName=${operationName}, message=${message}) not implemented yet.`); }

    /**
     * @description The given operation failed (with an optional message/error)
     * @param {string} operationName - the name of the operation
     * @param {Error | string} [error] - the error to log
     * @public
     */
    failed(operationName, error) { throw new Error(`Method failed(operationName=${operationName}, error=${error}) not implemented yet.`); }
}

/**
 * @description Logger Interface for  
 */ 
export class LoggerIntf extends BasicLoggerIntf {

    /**
     * @description Turn this logger into a simple logger for a specific operation
     * @param {string} operationName - the name of the operation
     * @returns {SimpleLoggerIntf | undefined} - a simple logger
     */ 
    toSimpleLogger(operationName) { throw new Error(`Method toSimpleLogger(operationName=${operationName}) not implemented yet.`); }

    /**
     * @description Enable or disable the failed logging
     * @param {boolean} [flag] - Enable or disable the failed logging
     * @public
     */
    enableFailed(flag=true) { throw new Error(`Method enableFailed(flag=${flag}) not implemented yet.`); }
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
    log(message) { throw new Error(`Method log(message=${message}) not implemented yet.`); };

    /**
     * @description Simple debug method with a message to output somewhere
     * @type {(message: string) => void}
     * @public
     */
    debug(message) { throw new Error(`Method debug(message=${message}) not implemented yet.`); };
}