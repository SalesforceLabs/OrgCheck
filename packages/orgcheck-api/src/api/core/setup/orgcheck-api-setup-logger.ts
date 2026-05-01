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
     * @description The given operation ended with errors
     * @param {string} operationName - the name of the operation
     * @param {Error[]} errors - the errors during the operation
     * @public
     */
    endedWithErrors(operationName: string, errors?: Error[]): void;

    /**
     * @description The given operation ended successfully (with an optional message)
     * @param {string} operationName - the name of the operation
     * @public
     */
    endedSuccessfully(operationName: string): void;

    /**
     * @description Called when a given operation is stopped (normally or with an error)
     * @param {string} operationName - the name of the operation
     * @public
     */
    stopped(operationName: string): void;
}