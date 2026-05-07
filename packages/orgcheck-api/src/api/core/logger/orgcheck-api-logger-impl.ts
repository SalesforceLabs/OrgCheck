import { LoggerIntf, SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { LoggerSetup } from '../setup/orgcheck-api-setup-logger';

const MAX_TIME_BEFORE_INTERRUPTABLE = 60000; // 1 minute

/**
 * @description Logger implementation that tracks one named operation and forwards
 *              lifecycle events (started, messageLogged, endedSuccessfully, endedWithErrors, stopped)
 *              to the provided LoggerSetup.
 */ 
export class Logger implements LoggerIntf {

    /** @description Whether the logger is still active and accepting log/error calls */
    private _isRunning: boolean;

    /** @description Whether at least one error has been recorded */
    private _hadError: boolean;

    /** @description Accumulated list of errors recorded via hadError() */
    private _errors: Error[];

    /** @description When true, hadError() calls are silently ignored */
    private _isErrorIgnore: boolean;

    /** @description Timestamp (ms) recorded when this logger was constructed */
    private readonly _startedAt: number;

    /** @description Whether to interrupt the logger as soon as possible */
    private _interruptAsap: boolean;

    /** @description Whether the logger has been notified that it can be interrupted */
    private _canBeInterruptedNotified: boolean;

    /**
     * @description Constructor — immediately marks the operation as started via LoggerSetup.
     * @param {string} _name - The display name of the operation, used as the section identifier.
     * @param {boolean} _willItBeInterruptible - Whether this logger will be interruptible when it exceed the maximum allowed time.
     * @param {LoggerSetup} _setup - Host-provided hooks that receive lifecycle events.
     */
    constructor(private readonly _name: string, private readonly _willItBeInterruptible: boolean, private readonly _setup: LoggerSetup) { 
        this._isRunning = true;
        this._hadError = false;
        this._errors = [];
        this._isErrorIgnore = false;
        this._startedAt = Date.now();
        this._interruptAsap = false;
        this._canBeInterruptedNotified = false;
        this._setup?.started(this._name);
    }    

    /**
     * @description This method just logs a message, prefixed with the elapsed time since this logger started.
     * @param {string} [message] - the message to log
     * @public
     */
    public log(message?: string): void {
        if (this._isRunning === true) {
            if (this._interruptAsap === true) {
                this._isErrorIgnore = true;
                throw new Error(`Operation "${this._name}" has been interrupted.`);
            } else {
                if (Date.now() - this._startedAt >= MAX_TIME_BEFORE_INTERRUPTABLE && this._willItBeInterruptible === true && this._canBeInterruptedNotified === false) {
                    this._setup?.canBeInterrupted(this._name, () => { 
                        this._interruptAsap = true; 
                        this._isErrorIgnore = true; 
                    });
                    this._canBeInterruptedNotified = true;
                }
            }
            this._setup?.messageLogged(this._name, message ?? '');
        }
    }

    /**
     * @description Instruct the logger to silently swallow any subsequent errors instead of recording them.
     * @public
     */
    public ignoreErrors(): void {
        this._isErrorIgnore = true;
    }

    /**
     * @description Restore normal error recording after a prior call to ignoreErrors().
     * @public
     */
    public acknowledgeErrors(): void {
        this._isErrorIgnore = false;
    }

    /**
     * @description Record an error that occurred during this operation.
     *              Ignored when the logger is not running or error-ignore mode is active.
     * @param {Error} [error] - the error to record
     * @public
     */
    public hadError(error?: Error): void {
        if (this._isRunning === true && this._isErrorIgnore === false && error) {
            this._hadError = true;
            this._errors.push(error);
        }
    }

    /**
     * @description Mark the operation as finished, triggering either endedSuccessfully or
     *              endedWithErrors on the LoggerSetup depending on whether any errors were recorded.
     *              Sets the logger as no longer running.
     * @public
     */
    public end(): void {
        if (this._hadError === true) {
            this._setup?.endedWithErrors(this._name, this._errors);
        } else {
            this._setup?.endedSuccessfully(this._name)
        }
        this._setup?.stopped(this._name);
        this._isRunning = false;
    }

    /**
     * @description Turn this logger into a simple logger for a specific operation
     * @returns {SimpleLoggerIntf} - a simple logger or undefined if the operation has already been finished
     */ 
    public toSimpleLogger(): SimpleLoggerIntf {
        const logMethod = this.log.bind(this);
        return { log: logMethod };
    }
}