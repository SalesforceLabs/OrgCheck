import { BasicLoggerIntf, LoggerIntf, SimpleLoggerIntf } from "./orgcheck-api-logger";

export const LOG_OPERATION_IN_PROGRESS = 0;
export const LOG_OPERATION_DONE = 1;
export const LOG_OPERATION_FAILED = 2;

/**
 * @description Logger for  
 */ 
export class Logger extends LoggerIntf {

    /**
     * @description Logger gets an injected logger :)
     * @type {BasicLoggerIntf}
     * @private
     */
    _logger;

    /**
     * @description Operation names that are/were logged
     * @type {Map<string, number>}}
     * @private
     */
    _operationNames;

    /**
     * @description Count of successful operations
     * @type {number}
     * @private
     */
    _countSuccesses;

    /**
     * @description Count of failed operations
     * @type {number}
     * @private
     */
    _countFailures;

    /**
     * @description Constructor
     * @param {BasicLoggerIntf} logger 
     */
    constructor(logger) {
        super()
        this._logger = logger;
        this._countSuccesses = 0;
        this._countFailures = 0;
        this._operationNames = new Map();
    }

    /**
     * @see LoggerIntf.log
     * @param {string} operationName
     * @param {string} [message] 
     */
    log(operationName, message) { 
        CONSOLE_LOG(operationName, 'LOG', message);
        this._logger?.log(operationName, message);
        this._operationNames.set(operationName, LOG_OPERATION_IN_PROGRESS);
    }

    /**
     * @see LoggerIntf.ended
     * @param {string} operationName
     * @param {string} [message] 
     */
    ended(operationName, message) { 
        CONSOLE_LOG(operationName, 'ENDED', message);
        this._countSuccesses++;
        this._logger?.ended(operationName, message);
        this._operationNames.set(operationName, LOG_OPERATION_DONE);
    }

    /**
     * @see LoggerIntf.failed
     * @param {string} operationName
     * @param {Error | string} [error] 
     * @public
     */
    failed(operationName, error) { 
        CONSOLE_LOG(operationName, 'FAILED', error);
        this._countFailures++;
        this._logger?.failed(operationName, error);
        this._operationNames.set(operationName, LOG_OPERATION_FAILED);
    }

    /**
     * @description Turn this logger into a simple logger for a specific section
     * @param {string} operationName
     * @returns {SimpleLoggerIntf}
     */ 
    toSimpleLogger(operationName) {
        const internalLogger = this._logger;
        return { 
            log: (message) => { 
                CONSOLE_LOG(operationName, 'LOG', message);
                internalLogger?.log(operationName, message);
            },
            debug: (message) => { 
                CONSOLE_LOG(operationName, 'DEBUG', message);
            }
        };
    }
}

/**
 * @description Logs the end of this section
 * @param {string} operationName
 * @param {string} event 
 * @param {string | Error} [message='...']
 */
const CONSOLE_LOG = (operationName, event, message='...') => { 
    console.error(`${new Date().toISOString()} - ${operationName} - ${event} - ${message}`); 
}