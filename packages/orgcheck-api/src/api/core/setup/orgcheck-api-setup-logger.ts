export interface LoggerSetup {

    /**
     * @description Called when a given operation is started
     * @param {string} operationName - the name of the operation
     * @public
     */
    started(operationName: string): void;

    /**
     * @description Called when a message has been logged
     * @param {string} operationName - the name of the operation
     * @param {string} [message] - the message to log
     * @public
     */
    messageLogged(operationName: string, message?: string): void;

    /**
     * @description Called when a message has been logged for debug 
     * @param {string} operationName - the name of the operation
     * @param {string} [message] - the message to log for debugging
     * @public
     */
    messageSilentlyLogged(operationName: string, message?: string): void;

    /**
     * @description The given operation ended with an error (with an optional error or message)
     * @param {string} operationName - the name of the operation
     * @param {Error | string} [error] - the error to log
     * @public
     */
    endedWithError(operationName: string, error?: Error | string): void;

    /**
     * @description The given operation ended successfully (with an optional message)
     * @param {string} operationName - the name of the operation
     * @param {string} [message] - the message to log
     * @public
     */
    endedSuccessfully(operationName: string, message?: string): void;

    /**
     * @description Called when a given operation is stopped (normally or with an error)
     * @param {string} operationName - the name of the operation
     * @public
     */
    stopped(operationName: string): void;
}