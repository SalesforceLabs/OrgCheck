import { LoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { Logger } from 'src/api/core/logger/orgcheck-api-logger-impl';
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
  public messageSilentlyLogged(): void { }
  public endedWithError(): void {
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
    const logger: LoggerIntf = new Logger(loggerSetup);
    logger.optimisticByPass = false;

    logger.log('1', 'starting 1...');
    expect(loggerSetup.nbStartedOperations).toBe(1);
    expect(loggerSetup.nbmessageLogged).toBe(1);
    expect(loggerSetup.nbStoppedOperations).toBe(0);

    logger.log('2', 'starting 2...');
    expect(loggerSetup.nbStartedOperations).toBe(2);
    expect(loggerSetup.nbmessageLogged).toBe(2);
    expect(loggerSetup.nbStoppedOperations).toBe(0);

    logger.log('3', 'starting 3...');
    expect(loggerSetup.nbStartedOperations).toBe(3);
    expect(loggerSetup.nbmessageLogged).toBe(3);
    expect(loggerSetup.nbStoppedOperations).toBe(0);

    logger.log('2', '2 continues (already started)');
    expect(loggerSetup.nbStartedOperations).toBe(3);
    expect(loggerSetup.nbmessageLogged).toBe(4);
    expect(loggerSetup.nbStoppedOperations).toBe(0);

    logger.fatal('1', 'we had a fatal error for 1...');
    expect(loggerSetup.nbStartedOperations).toBe(3);
    expect(loggerSetup.nbmessageLogged).toBe(4);
    expect(loggerSetup.nbStoppedOperations).toBe(1);

    logger.warn('3', 'oppps but continue...');
    expect(loggerSetup.nbStartedOperations).toBe(3);
    expect(loggerSetup.nbmessageLogged).toBe(5);
    expect(loggerSetup.nbStoppedOperations).toBe(1);

    logger.finalLog('2', 'done 2...');
    expect(loggerSetup.nbStartedOperations).toBe(3);
    expect(loggerSetup.nbmessageLogged).toBe(5);
    expect(loggerSetup.nbStoppedOperations).toBe(2);
  });

  it('checks if the logger implementation behaves correclty with the optimistic flag on', async () => {
    const loggerSetup = new LoggerSetupForTest();
    const logger: LoggerIntf = new Logger(loggerSetup);
    logger.optimisticByPass = true;

    logger.log('1', 'starting 1...');
    expect(loggerSetup.nbStartedOperations).toBe(1);
    expect(loggerSetup.nbmessageLogged).toBe(1);
    expect(loggerSetup.nbStoppedOperations).toBe(0);

    logger.log('2', 'starting 2...');
    expect(loggerSetup.nbStartedOperations).toBe(2);
    expect(loggerSetup.nbmessageLogged).toBe(2);
    expect(loggerSetup.nbStoppedOperations).toBe(0);

    logger.log('3', 'starting 3...');
    expect(loggerSetup.nbStartedOperations).toBe(3);
    expect(loggerSetup.nbmessageLogged).toBe(3);
    expect(loggerSetup.nbStoppedOperations).toBe(0);

    logger.log('2', '2 continues (already started)');
    expect(loggerSetup.nbStartedOperations).toBe(3);
    expect(loggerSetup.nbmessageLogged).toBe(4);
    expect(loggerSetup.nbStoppedOperations).toBe(0);

    logger.fatal('1', 'we had a fatal error for 1...'); // this one should be equivalent to finalLog because of the by pass
    expect(loggerSetup.nbStartedOperations).toBe(3);
    expect(loggerSetup.nbmessageLogged).toBe(4); // no message logged (like finalLog)
    expect(loggerSetup.nbStoppedOperations).toBe(1); // but stopped (like finalLog)

    logger.warn('3', 'oppps but continue...');
    expect(loggerSetup.nbStartedOperations).toBe(3);
    expect(loggerSetup.nbmessageLogged).toBe(5);
    expect(loggerSetup.nbStoppedOperations).toBe(1);

    logger.finalLog('2', 'done 2...');
    expect(loggerSetup.nbStartedOperations).toBe(3);
    expect(loggerSetup.nbmessageLogged).toBe(5);
    expect(loggerSetup.nbStoppedOperations).toBe(2);
  });
});