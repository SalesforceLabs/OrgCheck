import { LoggerIntf, SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { LoggerSetup } from './orgcheck-api-setup-logger';

/**
 * @description Logger for  
 */ 
export class Logger implements LoggerIntf {

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
        this.setup?.messageLogged(operationName, message);
    }

    /**
     * @description This method logs a message for a given operation and then stops the operation
     * @param {string} operationName - the name of the operation
     * @param {string} [message] - the message to log
     * @public
     */
    public finalLog(operationName: string, message?: string): void {
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
            this.setup?.messageLogged(operationName, `Warning: error.message`);
        } else {
            this.setup?.messageLogged(operationName, `Warning: error}`);
        }
    }

    /**
     * @description This method logs a fatal error for a given operation
     *              The operation is supposed to be stopped after this call
     * @param {string} operationName - the name of the operation
     * @param {Error | string} [error] - the error to log
     * @public
     */
    public fatal(operationName: string, error?: Error | string): void {
        if (this.optimisticByPass === true) {
            if (error instanceof Error) {
                this.setup?.messageLogged(operationName, `Warning: error.message`);
            } else {
                this.setup?.messageLogged(operationName, `Warning: error}`);
            }
        } else {
            this.setup?.endedWithError(operationName, error);
        }
    }

    /**
     * @description Turn this logger into a simple logger for a specific operation
     * @param {string} operationName - the name of the operation
     * @returns {SimpleLoggerIntf} - a simple logger
     */ 
    public toSimpleLogger(operationName: string): SimpleLoggerIntf {
        return { 
            log: (message) => { 
                this.setup?.messageLogged(operationName, message);
            },
            debug: (message) => { 
                if (console && console.debug) {
                    console.debug(`${new Date().toISOString()} - ${operationName} - ${message}`);
                }
            }
        };
    }
}