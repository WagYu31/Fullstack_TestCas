import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { User } from '../users/entities/user.entity';
import { DocumentsService } from './documents.service';
import { BackupService } from './backup.service';
import { DocumentsController } from './documents.controller';
import { PermissionsModule } from '../permissions/permissions.module';
import { PermissionRequestsModule } from '../permission-requests/permission-requests.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Document, User]),
        forwardRef(() => PermissionsModule),
        PermissionRequestsModule,
    ],
    providers: [DocumentsService, BackupService],
    controllers: [DocumentsController],
    exports: [DocumentsService],
})
export class DocumentsModule { }

