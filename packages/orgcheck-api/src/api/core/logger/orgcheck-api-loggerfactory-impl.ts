import { LoggerFactoryIntf } from "src/api/core/logger/orgcheck-api-loggerfactory";
import { LoggerSetup } from "src/api/core/setup/orgcheck-api-setup-logger";
import { LoggerIntf } from "src/api/core/logger/orgcheck-api-logger";
import { Logger } from "src/api/core/logger/orgcheck-api-logger-impl";

/**
 * @description Logger factory interface
 */ 
export class LoggerFactory implements LoggerFactoryIntf {

    /**
     * @description Constructor
     * @param {LoggerSetup} setup
     */
    constructor(private readonly setup: LoggerSetup) {}    

    public create(name: string): LoggerIntf {
        return new Logger(name, this.setup);
    }
}