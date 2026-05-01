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

    ignoreErrors(): void;

    acknowledgeErrors(): void;

    hadError(error?: Error): void;

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