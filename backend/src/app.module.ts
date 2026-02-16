import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_PIPE, APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';
import { PermissionsModule } from './permissions/permissions.module';
import { PermissionRequestsModule } from './permission-requests/permission-requests.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DevModule } from './dev/dev.module';
import { MailModule } from './mail/mail.module';
import { User } from './users/entities/user.entity';
import { Document } from './documents/entities/document.entity';
import { PermissionRequest as OldPermissionRequest } from './permissions/entities/permission-request.entity';
import { PermissionRequest } from './permission-requests/entities/permission-request.entity';
import { Notification } from './notifications/entities/notification.entity';
import { HealthController } from './common/health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [User, Document, OldPermissionRequest, PermissionRequest, Notification],
        synchronize: true, // Set to false in production
        logging: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    DocumentsModule,
    PermissionsModule,
    PermissionRequestsModule,
    NotificationsModule,
    DevModule,
    MailModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }

