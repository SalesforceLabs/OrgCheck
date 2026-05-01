import { describe, it, expect } from '@jest/globals';
import { LoggerFactoryIntf } from 'src/api/core/logger/orgcheck-api-loggerfactory';
import { LoggerFactory } from 'src/api/core/logger/orgcheck-api-loggerfactory-impl';
import { LoggerSetup } from 'src/orgcheck';

class LoggerSetupForTest implements LoggerSetup {

  public nbStartedOperations: number = 0;
  public nbmessageLogged: number = 0;
  public nbEndedOperationsOK: number = 0;
  public nbEndedOperationsKO: number = 0;
  public nbStoppedOperations: number = 0;

  public started(): void { 
    this.nbStartedOperations++; 
  };
  public messageLogged(): void {
    this.nbmessageLogged++;
  };
  public endedWithErrors(): void {
    this.nbEndedOperationsKO++;
  };
  public endedSuccessfully (): void {
    this.nbEndedOperationsOK++;
  };
  public stopped (): void { 
    this.nbStoppedOperations++; 
  };
}

describe('tests.api.unit.Logger', () => {

  it('checks if the logger implementation runs correctly', async () => {
    const loggerSetup = new LoggerSetupForTest();
    const loggerFactory: LoggerFactoryIntf = new LoggerFactory(loggerSetup);

    const logger1 = loggerFactory?.create('1'); // that will start 1
    expect(loggerSetup.nbStartedOperations).toBe(1);
    expect(loggerSetup.nbmessageLogged).toBe(0);
    expect(loggerSetup.nbStoppedOperations).toBe(0);

    const logger2 = loggerFactory?.create('2'); // that will start 2
    expect(loggerSetup.nbStartedOperations).toBe(2);
    expect(loggerSetup.nbmessageLogged).toBe(0);
    expect(loggerSetup.nbStoppedOperations).toBe(0);

    loggerFactory?.create('3'); // that will start 3
    expect(loggerSetup.nbStartedOperations).toBe(3);
    expect(loggerSetup.nbmessageLogged).toBe(0);
    expect(loggerSetup.nbStoppedOperations).toBe(0);

    logger2.log('2 continues (already started)');
    expect(loggerSetup.nbStartedOperations).toBe(3);
    expect(loggerSetup.nbmessageLogged).toBe(1);
    expect(loggerSetup.nbStoppedOperations).toBe(0);

    logger1.hadError(new TypeError('we had a fatal error for 1...'));
    expect(loggerSetup.nbStartedOperations).toBe(3);
    expect(loggerSetup.nbmessageLogged).toBe(1);
    expect(loggerSetup.nbStoppedOperations).toBe(0);

    logger2.end();
    expect(loggerSetup.nbStartedOperations).toBe(3);
    expect(loggerSetup.nbmessageLogged).toBe(1);
    expect(loggerSetup.nbStoppedOperations).toBe(1);
  });

  it('checks if the logger implementation behaves correclty with the optimistic flag on', async () => {
    const loggerSetup = new LoggerSetupForTest();
    const loggerFactory: LoggerFactoryIntf = new LoggerFactory(loggerSetup);

    const logger1 = loggerFactory?.create('1');
    expect(loggerSetup.nbStartedOperations).toBe(1);
    expect(loggerSetup.nbmessageLogged).toBe(0);
    expect(loggerSetup.nbStoppedOperations).toBe(0);

    const logger2 = loggerFactory?.create('2');
    expect(loggerSetup.nbStartedOperations).toBe(2);
    expect(loggerSetup.nbmessageLogged).toBe(0);
    expect(loggerSetup.nbStoppedOperations).toBe(0);

    const logger3 = loggerFactory?.create('3');
    expect(loggerSetup.nbStartedOperations).toBe(3);
    expect(loggerSetup.nbmessageLogged).toBe(0);
    expect(loggerSetup.nbStoppedOperations).toBe(0);

    logger1.ignoreErrors();
    logger2.ignoreErrors();
    logger3.ignoreErrors();

    logger2.log('2 continues (already started)');
    expect(loggerSetup.nbStartedOperations).toBe(3);
    expect(loggerSetup.nbmessageLogged).toBe(1);
    expect(loggerSetup.nbStoppedOperations).toBe(0);

    logger1.hadError(new TypeError('we had a fatal error for 1...')); // this one should be equivalent to finalLog because of the by pass
    expect(loggerSetup.nbStartedOperations).toBe(3);
    expect(loggerSetup.nbmessageLogged).toBe(1);
    expect(loggerSetup.nbStoppedOperations).toBe(0);

    logger2.end();
    expect(loggerSetup.nbStartedOperations).toBe(3);
    expect(loggerSetup.nbmessageLogged).toBe(1);
    expect(loggerSetup.nbStoppedOperations).toBe(1);

    logger1.end();
    expect(loggerSetup.nbStartedOperations).toBe(3);
    expect(loggerSetup.nbmessageLogged).toBe(1);
    expect(loggerSetup.nbStoppedOperations).toBe(2);
  });
});