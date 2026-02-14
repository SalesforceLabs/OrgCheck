import { BasicLoggerIntf, LoggerIntf, SimpleLoggerIntf } from "./orgcheck-api-logger";

export const LOG_OPERATION_IN_PROGRESS = 0;
export const LOG_OPERATION_DONE = 1;
export const LOG_OPERATION_FAILED = 2;

/**
 * @description Logger for  
 */ 
export class Logger implements LoggerIntf {

    /**
     * @description Logger gets an injected logger :)
     * @type {BasicLoggerIntf}
     * @private
     */
    _logger: BasicLoggerIntf;

    /**
     * @description Is the failed logging enabled?
     * @type {boolean}
     * @private
     */
    _enabledFailed: boolean = true;

    /**
     * @description Constructor
     * @param {BasicLoggerIntf} logger - The injected logger
     */
    constructor(logger: BasicLoggerIntf) {
        this._logger = logger;
    }

    /**
     * @description Returns true if the logger is a console fallback logger
     * @returns {boolean} True if the logger is a console fallback logger
     */
    isConsoleFallback(): boolean {
        return this._logger?.isConsoleFallback();
    }

    /**
     * @see LoggerIntf.log
     * @param {string} operationName - The name of the operation
     * @param {string} [message] - The message to log
     */
    log(operationName: string, message: string) { 
        if (this._logger?.isConsoleFallback()) {
            CONSOLE_LOG(operationName, 'LOG', message);
        }
        this._logger?.log(operationName, message);
    }

    /**
     * @see LoggerIntf.ended
     * @param {string} operationName - The name of the operation
     * @param {string} [message] - The message to log
     */
    ended(operationName: string, message: string) { 
        if (this._logger?.isConsoleFallback()) {
            CONSOLE_LOG(operationName, 'ENDED', message);
        }
        this._logger?.ended(operationName, message);
    }

    /**
     * @see LoggerIntf.failed
     * @param {string} operationName - The name of the operation
     * @param {Error | string} [error] - The error to log
     * @public
     */
    failed(operationName: string, error: Error | string) { 
        if (this._enabledFailed === true) {
            if (this._logger?.isConsoleFallback()) {
                CONSOLE_LOG(operationName, 'FAILED', error);
            }
            this._logger?.failed(operationName, error);
        }
    }

    /**
     * @description Enable or disable the failed logging
     * @param {boolean} [flag] - Enable or disable the failed logging
     * @public
     */
    enableFailed(flag: boolean=true) { 
        this._enabledFailed = (flag === true);
    }

    /**
     * @description Turn this logger into a simple logger for a specific section
     * @param {string} operationName - The name of the operation
     * @returns {SimpleLoggerIntf} The simple logger created from the logger for that specific section
     */ 
    toSimpleLogger(operationName: string): SimpleLoggerIntf {
        return { 
            log: (message) => { 
                if (this._logger?.isConsoleFallback() ?? true) {
                    CONSOLE_LOG(operationName, 'LOG', message);
                }
                this._logger?.log(operationName, message);
            },
            debug: (message) => { 
                if (this._logger?.isConsoleFallback() ?? true) {
                    CONSOLE_LOG(operationName, 'DEBUG', message);
                }
            }
        };
    }
}

/**
 * @description Logs the end of this section
 * @param {string} operationName - The name of the operation
 * @param {string} event - The event to log
 * @param {string | Error} [message] - The message to log
 */
const CONSOLE_LOG = (operationName: string, event: string, message: string | Error='...') => { 
    console.log(`${new Date().toISOString()} - ${operationName} - ${event} - ${message}`); 
}