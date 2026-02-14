/**
 * @description Basic logger Interface for  
 */ 
export interface BasicLoggerIntf {

    /**
     * @description Check if this logger is a console fallback logger
     * @returns {boolean | undefined} true if this logger is a console fallback logger, false otherwise
     * @public
     */
    isConsoleFallback(): boolean | undefined;

    /**
     * @description The logger logs
     * @param {string} operationName - the name of the operation
     * @param {string} [message] - the message to log
     * @public
     */
    log(operationName: string, message?: string): void;

    /**
     * @description The given operation ended (with an optional message)
     * @param {string} operationName - the name of the operation
     * @param {string} [message] - the message to log
     * @public
     */
    ended(operationName: string, message?: string): void;

    /**
     * @description The given operation failed (with an optional message/error)
     * @param {string} operationName - the name of the operation
     * @param {Error | string} [error] - the error to log
     * @public
     */
    failed(operationName: string, error?: Error | string): void;
}

/**
 * @description Logger Interface for  
 */ 
export interface LoggerIntf extends BasicLoggerIntf {

    /**
     * @description Turn this logger into a simple logger for a specific operation
     * @param {string} operationName - the name of the operation
     * @returns {SimpleLoggerIntf | undefined} - a simple logger
     */ 
    toSimpleLogger(operationName: string): SimpleLoggerIntf | undefined;

    /**
     * @description Enable or disable the failed logging
     * @param {boolean} [flag] - Enable or disable the failed logging
     * @public
     */
    enableFailed(flag?: boolean): void;
}

/**
 * @description Simple Logger interface
 */
export interface SimpleLoggerIntf {

    /**
     * @description Simple log method with a message to output somewhere
     * @type {(message: string) => void}
     * @public
     */
    log(message: string): void;

    /**
     * @description Simple debug method with a message to output somewhere
     * @type {(message: string) => void}
     * @public
     */
    debug(message: string): void;
}