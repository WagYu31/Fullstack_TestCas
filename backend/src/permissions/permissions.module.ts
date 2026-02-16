import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionRequest } from './entities/permission-request.entity';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { DocumentsModule } from '../documents/documents.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([PermissionRequest]),
        forwardRef(() => DocumentsModule),
        NotificationsModule,
    ],
    providers: [PermissionsService],
    controllers: [PermissionsController],
    exports: [PermissionsService],
})
export class PermissionsModule { }
