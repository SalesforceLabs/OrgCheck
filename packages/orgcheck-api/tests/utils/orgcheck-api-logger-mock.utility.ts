import { LoggerIntf, SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { LoggerFactoryIntf } from 'src/api/core/logger/orgcheck-api-loggerfactory';
import { LoggerSetup } from 'src/orgcheck';

export class LoggerFactoryMock_DoingNothing implements LoggerFactoryIntf {
  public create(): LoggerIntf { return new LoggerMock_DoingNothing(); }
}

export class LoggerSetupMock_DoingNothing implements LoggerSetup {
  public started(): void { }
  public messageLogged(): void { }
  public endedWithErrors(): void { }
  public endedSuccessfully(): void { }
  public stopped(): void { }
  public canBeInterrupted(): void { }
}

export class LoggerMock_DoingNothing implements LoggerIntf {
  public log(): void {}
  public ignoreErrors(): void {}
  public acknowledgeErrors(): void {}
  public hadError(): void {}
  public end(): void {}
  public toSimpleLogger(): SimpleLoggerIntf { return new SimpleLoggerMock_DoingNothing(); }
}

export class SimpleLoggerMock_DoingNothing implements SimpleLoggerIntf {
  public log() {}
}