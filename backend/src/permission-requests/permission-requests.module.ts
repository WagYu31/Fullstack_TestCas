import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionRequestsService } from './permission-requests.service';
import { PermissionRequestsController } from './permission-requests.controller';
import { PermissionRequest } from './entities/permission-request.entity';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([PermissionRequest]),
        UsersModule,
    ],
    controllers: [PermissionRequestsController],
    providers: [PermissionRequestsService],
    exports: [PermissionRequestsService],
})
export class PermissionRequestsModule { }
