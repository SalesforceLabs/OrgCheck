import { LoggerIntf, SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { LoggerSetup } from '../setup/orgcheck-api-setup-logger';

/**
 * @description Logger for  
 */ 
export class Logger implements LoggerIntf {

    private _isRunning: boolean;
    private _hadError: boolean;
    private _errors: Error[];
    private _isErrorIgnore: boolean;

    /**
     * @description Constructor
     * @param {string} name
     */
    constructor(private readonly name: string, private readonly setup: LoggerSetup) { 
        this._isRunning = true;
        this._hadError = false;
        this._errors = [];
        this._isErrorIgnore = false;
        this.setup?.started(this.name);
    }    

    /**
     * @description This method just logs a message
     * @param {string} [message] - the message to log
     * @public
     */
    public log(message?: string): void {
        if (this._isRunning === true) {
            this.setup?.messageLogged(this.name, message);
        }
    }

    public ignoreErrors(): void {
        this._isErrorIgnore = true;
    }

    public acknowledgeErrors(): void {
        this._isErrorIgnore = false;
    }

    public hadError(error?: Error): void {
        if (this._isRunning === true && this._isErrorIgnore === false) {
            if (error) {
                this._errors.push(error);
            }
            this._hadError = true;
        }
    }

    public end(): void {
        if (this._hadError === true) {
            this.setup?.endedWithErrors(this.name, this._errors);
        } else {
            this.setup?.endedSuccessfully(this.name)
        }
        this.setup?.stopped(this.name);
        this._isRunning = false;
    }

    /**
     * @description Turn this logger into a simple logger for a specific operation
     * @returns {SimpleLoggerIntf} - a simple logger or undefined if the operation has already been finished
     */ 
    public toSimpleLogger(): SimpleLoggerIntf {
        const that = this;
        return { 
            log: (message?: string | undefined) => { 
                if (that._isRunning) {
                    that.setup?.messageLogged(that.name, message); 
                }
            }
        }
    }
}