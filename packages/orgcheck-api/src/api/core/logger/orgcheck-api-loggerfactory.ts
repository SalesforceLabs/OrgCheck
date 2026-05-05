import { LoggerIntf } from "src/api/core/logger/orgcheck-api-logger";

/**
 * @description Logger factory interface
 */ 
export interface LoggerFactoryIntf {

    /**
     * @description Create and start a new logger for the given operation name.
     *              The logger is immediately registered as active so it can later be stopped via requestStop().
     * @param {string} name - The display name of the operation.
     * @param {boolean} isStoppable - Whether the logger should be stoppable.
     * @returns {LoggerIntf} - a new running logger
     */
    create(name: string, isStoppable: boolean): LoggerIntf;
}