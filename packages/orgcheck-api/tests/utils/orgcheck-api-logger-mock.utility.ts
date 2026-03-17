import { LoggerIntf, SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { LoggerSetup } from 'src/orgcheck';

export class LoggerSetupMock_DoingNothing implements LoggerSetup {
  public messageSilentlyLogged(): void {}
  public messageLogged(): void { }
  public started(): void { }
  public essageLogged(): void { }
  public endedWithError(): void { }
  public endedSuccessfully(): void { }
  public stopped(): void { }
}

export class LoggerMock_DoingNothing implements LoggerIntf {
  public optimisticByPass: boolean = false;
  public log(): void {}
  public finalLog(): void { }
  public warn(): void { }
  public fatal(): void { }
  public toSimpleLogger() { return { log: () => {}, debug: () => {} }; }
}

export class SimpleLoggerMock_DoingNothing implements SimpleLoggerIntf {
  public log() {}
  public debug() {}
}