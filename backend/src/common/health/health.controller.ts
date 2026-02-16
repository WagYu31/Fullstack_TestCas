import { Controller, Get } from '@nestjs/common';

/**
 * Health Check Controller
 * Provides service readiness endpoint for monitoring.
 * When migrating to microservices, each service has its own /health.
 */
@Controller('health')
export class HealthController {
    @Get()
    check() {
        return {
            status: 'ok',
            service: 'dms-api',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: {
                heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
                heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
            },
        };
    }
}
