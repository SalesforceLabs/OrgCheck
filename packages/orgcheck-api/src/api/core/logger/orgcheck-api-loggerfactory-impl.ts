import { LoggerFactoryIntf } from "src/api/core/logger/orgcheck-api-loggerfactory";
import { LoggerSetup } from "src/api/core/setup/orgcheck-api-setup-logger";
import { LoggerIntf } from "src/api/core/logger/orgcheck-api-logger";
import { Logger } from "src/api/core/logger/orgcheck-api-logger-impl";

/**
 * @description Concrete implementation of LoggerFactoryIntf.
 *              Keeps a registry of active loggers so any of them can be stopped on demand.
 */ 
export class LoggerFactory implements LoggerFactoryIntf {

    /**
     * @description Constructor
     * @param {LoggerSetup} setup - Host-provided hooks forwarded to every created Logger.
     */
    constructor(private readonly setup: LoggerSetup) {}    

    /**
     * @description Create and start a new logger for the given operation name.
     *              Registers it in the active-loggers map, overwriting any stale entry with the same name.
     * @param {string} name - The display name of the operation.
     * @param {boolean} isStoppable - Whether the logger should be stoppable.
     * @returns {LoggerIntf} - a new running logger
     * @public
     */
    public create(name: string, isStoppable: boolean): LoggerIntf {
        const logger = new Logger(name, isStoppable, this.setup);
        return logger;
    }
}