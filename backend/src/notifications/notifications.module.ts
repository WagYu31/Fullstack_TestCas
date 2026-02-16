import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { DocumentEventListener } from './listeners/document.listener';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification]),
        UsersModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET') || 'default-secret-key',
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [NotificationsService, NotificationsGateway, DocumentEventListener],
    controllers: [NotificationsController],
    exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule { }


