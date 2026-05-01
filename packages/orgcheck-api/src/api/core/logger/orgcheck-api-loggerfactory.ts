import { LoggerIntf } from "src/api/core/logger/orgcheck-api-logger";

/**
 * @description Logger factory interface
 */ 
export interface LoggerFactoryIntf {

    create(name: string): LoggerIntf;
}