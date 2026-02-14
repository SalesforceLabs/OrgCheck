import { LoggerIntf, SimpleLoggerIntf } from "../../src/api/core/orgcheck-api-logger";

export class LoggerMock_DoingNothing implements LoggerIntf {
  enableFailed() {}
  isConsoleFallback() { return false; }
  log(/*sectionName, message*/) { }
  ended(/*sectionName, message*/) { }
  failed(/*sectionName, error*/) { }
  toSimpleLogger() { return { log: () => {}, debug: () => {} }; }
}

export class SimpleLoggerMock_DoingNothing implements SimpleLoggerIntf {
  log() {}
  debug() {}
}