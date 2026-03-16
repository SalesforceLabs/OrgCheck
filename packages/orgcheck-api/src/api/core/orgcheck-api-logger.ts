/**
 * @description Basic logger Interface for  
 */ 
export interface LoggerIntf {

    /**
     * @description Flag that turns fatal() to simple warning() if set to true
     * @type {boolean}
     * @public
     */
    optimisticByPass: boolean;

    /**
     * @description This method just logs a message for a given operation
     *              If the operation was not started yet, it will after this call
     *              The given operation is expeted to just continue
     * @param {string} operationName - the name of the operation
     * @param {string} [message] - the message to log
     * @public
     */
    log(operationName: string, message?: string): void;

    /**
     * @description This method logs a message for a given operation and then stops the operation
     * @param {string} operationName - the name of the operation
     * @param {string} [message] - the message to log
     * @public
     */
    finalLog(operationName: string, message?: string): void;

    /**
     * @description This method logs a simple warning (message or error)for a given operation
     *              The given operation is expeted to just continue
     * @param {string} operationName - the name of the operation
     * @param {Error | string} [error] - the error to log
     * @public
     */
    warn(operationName: string, error?: Error | string): void;

    /**
     * @description This method logs a fatal error for a given operation
     *              The operation is supposed to be stopped after this call
     * @param {string} operationName - the name of the operation
     * @param {Error | string} [error] - the error to log
     * @public
     */
    fatal(operationName: string, error?: Error | string): void;

    /**
     * @description Turn this logger into a simple logger for a specific operation
     * @param {string} operationName - the name of the operation
     * @returns {SimpleLoggerIntf} - a simple logger
     */ 
    toSimpleLogger(operationName: string): SimpleLoggerIntf;
}

/**
 * @description Simple Logger interface
 */
export interface SimpleLoggerIntf {

    /**
     * @description Simple log method with a message to output somewhere
     * @param {string} message - the message to log
     * @public
     */
    log(message: string): void;

    /**
     * @description Simple debug method with a message to output somewhere
     * @param {string} message - the message to debug
     * @public
     */
    debug(message: string): void;
}