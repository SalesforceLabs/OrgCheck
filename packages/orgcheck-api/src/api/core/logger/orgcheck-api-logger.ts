/**
 * @description Logger Interface
 */ 
export interface LoggerIntf {

    /**
     * @description This method just logs a message
     * @param {string} [message] - the message to log
     * @public
     */
    log(message?: string): void;

    /**
     * @description Instruct the logger to silently swallow any subsequent errors instead of recording them.
     * @public
     */
    ignoreErrors(): void;

    /**
     * @description Restore normal error recording after a prior call to ignoreErrors().
     * @public
     */
    acknowledgeErrors(): void;

    /**
     * @description Record an error that occurred during this operation.
     *              Ignored when the logger is not running or error-ignore mode is active.
     * @param {Error} [error] - the error to record
     * @public
     */
    hadError(error?: Error): void;

    /**
     * @description Mark the operation as finished, triggering either endedSuccessfully or
     *              endedWithErrors on the LoggerSetup depending on whether any errors were recorded.
     * @public
     */
    end(): void;

    /**
     * @description Allow to use this logger only to log and nothing else
     * @returns {SimpleLoggerIntf} - a simple logger
     */ 
    toSimpleLogger(): SimpleLoggerIntf;
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
}