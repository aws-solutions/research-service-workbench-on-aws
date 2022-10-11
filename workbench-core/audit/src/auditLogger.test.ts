import { LoggingService } from '@aws/workbench-core-logging';
import { AuditLogger } from './auditLogger';

describe('Audit Logger', () => {
  let auditLogger: AuditLogger;
  let logger: LoggingService;
  beforeEach(() => {
    logger = new LoggingService();
    jest.spyOn(logger, 'info');
    auditLogger = new AuditLogger(logger);
  });

  test('write audit entry', async () => {
    await auditLogger.write({}, { actor: { userId: 'userId' } });
    expect(logger.info).toBeCalledTimes(1);
    expect(logger.info).toBeCalledWith('{"actor":{"userId":"userId"}}');
  });
});
