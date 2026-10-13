import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { HealthCheckService, TypeOrmHealthIndicator, HealthCheckResult } from '@nestjs/terminus';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: { check: jest.Mock<(...args: any[]) => any> };
  let dbIndicator: { pingCheck: jest.Mock<(...args: any[]) => any> };

  beforeEach(() => {
    healthService = {
      check: jest.fn<(...args: any[]) => any>(),
    };
    dbIndicator = {
      pingCheck: jest.fn<(...args: any[]) => any>(),
    };
    controller = new HealthController(
      healthService as unknown as HealthCheckService,
      dbIndicator as unknown as TypeOrmHealthIndicator,
    );
  });

  it('delegates health check to HealthCheckService with database indicator', async () => {
    const expectedResult: HealthCheckResult = {
      status: 'ok',
      info: { database: { status: 'up' } },
      error: {},
      details: { database: { status: 'up' } },
    };

    healthService.check.mockImplementation(async (indicators: unknown) => {
      const funcs = indicators as Array<() => unknown>;
      expect(funcs).toHaveLength(1);
      // Execute the indicator function passed in
      await funcs[0]();
      return expectedResult;
    });

    dbIndicator.pingCheck.mockResolvedValue({ database: { status: 'up' } } as never);

    const result = await controller.check();

    expect(result).toBe(expectedResult);
    expect(healthService.check).toHaveBeenCalledTimes(1);
    expect(dbIndicator.pingCheck).toHaveBeenCalledWith('database');
  });

  it('propagates failure when database check degrades or fails', async () => {
    const dbError = new Error('Database connection failed');
    healthService.check.mockImplementation(async (indicators: unknown) => {
      const funcs = indicators as Array<() => unknown>;
      await funcs[0]();
      throw dbError;
    });

    dbIndicator.pingCheck.mockRejectedValue(dbError as never);

    await expect(controller.check()).rejects.toThrow('Database connection failed');
    expect(dbIndicator.pingCheck).toHaveBeenCalledWith('database');
  });
});
