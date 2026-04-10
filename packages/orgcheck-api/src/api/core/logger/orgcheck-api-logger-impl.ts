import { LoggerIntf, SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { LoggerSetup } from '../setup/orgcheck-api-setup-logger';

/**
 * @description Logger for  
 */ 
export class Logger implements LoggerIntf {

    /**
     * @description List of running operations
     * @type {Set<string>}
     * @private
     */
    private _runningOperations: Set<string>;

    /**
     * @description Flag that turns fatal() to simple warning() if set to true
     * @type {boolean}
     * @public
     */
    optimisticByPass: boolean;

    /**
     * @description Constructor
     * @param {LoggerSetup} setup
     */
    constructor(private readonly setup: LoggerSetup) {
        this.optimisticByPass = false;
        this._runningOperations = new Set();
    }    

    /**
     * @description Start the operation if needed
     * @param {string} operationName - the name of the operation
     */
    private _startOperationIfNeeded(operationName: string): void {
        if (this._runningOperations.has(operationName) === false) {
            this._runningOperations.add(operationName);
            this.setup?.started(operationName);
        }
    }

    /**
     * @description Stop the operation if needed
     * @param {string} operationName - the name of the operation
     */
    private _stopOperationIfNeeded(operationName: string): void {
        if (this._runningOperations.has(operationName) === true) {
            this._runningOperations.delete(operationName);
            this.setup?.stopped(operationName);
        }
    }

    /**
     * @description This method just logs a message for a given operation
     *              If the operation was not started yet, it will after this call
     *              The given operation is expeted to just continue
     * @param {string} operationName - the name of the operation
     * @param {string} [message] - the message to log
     * @public
     */
    public log(operationName: string, message?: string): void {
        this._startOperationIfNeeded(operationName);
        this.setup?.messageLogged(operationName, message);
    }

    /**
     * @description This method logs a message for a given operation and then stops the operation
     * @param {string} operationName - the name of the operation
     * @param {string} [message] - the message to log
     * @public
     */
    public finalLog(operationName: string, message?: string): void {
        this._stopOperationIfNeeded(operationName);
        this.setup.endedSuccessfully(operationName, message);
    }

    /**
     * @description This method logs a simple warning (message or error)for a given operation
     *              The operation is can continue
     * @param {string} operationName - the name of the operation
     * @param {Error | string} [error] - the error to log
     * @public
     */
    public warn(operationName: string, error?: Error | string): void {
        if (error instanceof Error) {
            this.setup?.messageLogged(operationName, `Warning: ${error.message}`);
        } else {
            this.setup?.messageLogged(operationName, `Warning: ${error}`);
        }
    }

    /**
     * @description This method logs a fatal error for a given operation, and stop the operation
     *              If bypass=true, we consider this call equivalent to finalLog
     * @param {string} operationName - the name of the operation
     * @param {Error | string} [error] - the error to log
     * @public
     */
    public fatal(operationName: string, error?: Error | string): void {
        if (this.optimisticByPass === true) {
            if (error instanceof Error) {
                this.setup?.endedSuccessfully(operationName, `Fatal (by-passed): ${error.message}`);
            } else {
                this.setup?.endedSuccessfully(operationName, `Fatal (by-passed): ${error}`);
            }
        } else {
            this.setup?.endedWithError(operationName, error);
        }
        this._stopOperationIfNeeded(operationName);
    }

    /**
     * @description Turn this logger into a simple logger for a specific operation
     * @param {string} operationName - the name of the operation
     * @returns {SimpleLoggerIntf | undefined} - a simple logger or undefined if the operation has already been finished
     */ 
    public toSimpleLogger(operationName: string): SimpleLoggerIntf | undefined {
        if (this._runningOperations.has(operationName)) {
            const that = this;
            const shouldRun = () => (that._runningOperations.has(operationName));
            const simpleLogger = { 
                log: (message?: string | undefined) => { if (shouldRun()) that.setup?.messageLogged(operationName, message); },
                isDebugEnabled: () => (shouldRun() ? that.setup?.messageSilentlyLogged !== undefined : false),
                debug: (message?: string | undefined) => { if (shouldRun())that.setup?.messageSilentlyLogged(operationName, message); }
            };
            return simpleLogger;
        }
        return undefined;
    }
}