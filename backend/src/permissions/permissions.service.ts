import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionRequest } from './entities/permission-request.entity';
import { PermissionRequestStatus } from '../common/enums/permission-request-status.enum';
import { PermissionRequestType } from '../common/enums/permission-request-type.enum';
import { DocumentsService } from '../documents/documents.service';
import { NotificationsService } from '../notifications/notifications.service';
import { DocumentStatus } from '../common/enums/document-status.enum';
import { NotificationType } from '../common/enums/notification-type.enum';
import * as fs from 'fs';

interface CreatePermissionRequestDto {
    documentId: string;
    requestedById: string;
    requestType: PermissionRequestType;
    reason: string;
    newFileUrl?: string;
    newFileName?: string;
    newFileSize?: number;
    newMimeType?: string;
}

@Injectable()
export class PermissionsService {
    constructor(
        @InjectRepository(PermissionRequest)
        private permissionsRepository: Repository<PermissionRequest>,
        private documentsService: DocumentsService,
        private notificationsService: NotificationsService,
    ) { }

    async createPermissionRequest(
        dto: CreatePermissionRequestDto,
    ): Promise<PermissionRequest> {
        const permissionRequest = this.permissionsRepository.create(dto);
        const saved = await this.permissionsRepository.save(permissionRequest);

        // Notify all admins
        await this.notificationsService.notifyAdmins({
            title: 'New Permission Request',
            message: `A ${dto.requestType.toLowerCase()} request has been submitted`,
            type: NotificationType.PERMISSION_REQUEST,
            relatedEntityId: saved.id,
        });

        return saved;
    }

    async findAll() {
        return this.permissionsRepository.find({
            where: { status: PermissionRequestStatus.PENDING },
            relations: ['document', 'requestedBy'],
            order: { createdAt: 'DESC' },
        });
    }

    async approve(id: string, reviewerId: string): Promise<void> {
        const permissionRequest = await this.permissionsRepository.findOne({
            where: { id },
            relations: ['document'],
        });

        if (!permissionRequest) {
            throw new NotFoundException('Permission request not found');
        }

        if (permissionRequest.status !== PermissionRequestStatus.PENDING) {
            throw new BadRequestException('Permission request already processed');
        }

        // Update permission request
        permissionRequest.status = PermissionRequestStatus.APPROVED;
        permissionRequest.reviewedById = reviewerId;
        permissionRequest.reviewedAt = new Date();
        await this.permissionsRepository.save(permissionRequest);

        // Execute the action
        if (permissionRequest.requestType === PermissionRequestType.REPLACE) {
            console.log(`[PERMISSIONS] Executing REPLACE for document ${permissionRequest.documentId}`);
            await this.documentsService.replaceFile(
                permissionRequest.documentId,
                permissionRequest.newFileUrl,
                permissionRequest.newFileName,
                permissionRequest.newFileSize,
                permissionRequest.newMimeType,
            );
        } else if (permissionRequest.requestType === PermissionRequestType.DELETE) {
            console.log(`[PERMISSIONS] Executing DELETE for document ${permissionRequest.documentId}`);
            await this.documentsService.delete(permissionRequest.documentId);
            console.log(`[PERMISSIONS] DELETE completed successfully`);
        }

        // Notify requester
        await this.notificationsService.create({
            userId: permissionRequest.requestedById,
            title: 'Permission Approved',
            message: `Your ${permissionRequest.requestType.toLowerCase()} request has been approved`,
            type: NotificationType.PERMISSION_APPROVED,
            relatedEntityId: id,
        });
    }

    async reject(id: string, reviewerId: string): Promise<void> {
        const permissionRequest = await this.permissionsRepository.findOne({
            where: { id },
            relations: ['document'],
        });

        if (!permissionRequest) {
            throw new NotFoundException('Permission request not found');
        }

        if (permissionRequest.status !== PermissionRequestStatus.PENDING) {
            throw new BadRequestException('Permission request already processed');
        }

        // Update permission request
        permissionRequest.status = PermissionRequestStatus.REJECTED;
        permissionRequest.reviewedById = reviewerId;
        permissionRequest.reviewedAt = new Date();
        await this.permissionsRepository.save(permissionRequest);

        // Delete uploaded file if it was a replace request
        if (
            permissionRequest.requestType === PermissionRequestType.REPLACE &&
            permissionRequest.newFileUrl &&
            fs.existsSync(permissionRequest.newFileUrl)
        ) {
            fs.unlinkSync(permissionRequest.newFileUrl);
        }

        // Revert document status
        await this.documentsService.updateStatus(
            permissionRequest.documentId,
            DocumentStatus.ACTIVE,
        );

        // Notify requester
        await this.notificationsService.create({
            userId: permissionRequest.requestedById,
            title: 'Permission Rejected',
            message: `Your ${permissionRequest.requestType.toLowerCase()} request has been rejected`,
            type: NotificationType.PERMISSION_REJECTED,
            relatedEntityId: id,
        });
    }

    async getStatistics() {
        const [total, pending, approved, rejected] = await Promise.all([
            this.permissionsRepository.count(),
            this.permissionsRepository.count({ where: { status: PermissionRequestStatus.PENDING } }),
            this.permissionsRepository.count({ where: { status: PermissionRequestStatus.APPROVED } }),
            this.permissionsRepository.count({ where: { status: PermissionRequestStatus.REJECTED } }),
        ]);

        return {
            total,
            pending,
            approved,
            rejected,
        };
    }
}
