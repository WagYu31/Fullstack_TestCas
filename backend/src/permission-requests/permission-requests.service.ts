import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionRequest } from './entities/permission-request.entity';
import { CreatePermissionRequestDto } from './dto/create-permission-request.dto';
import { ReviewPermissionRequestDto } from './dto/review-permission-request.dto';
import { PermissionRequestStatus } from '../common/enums/permission-request-status.enum';
import { UserRole } from '../common/enums/user-role.enum';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class PermissionRequestsService {
    constructor(
        @InjectRepository(PermissionRequest)
        private permissionRequestRepository: Repository<PermissionRequest>,
        private readonly mailService: MailService,
        private readonly usersService: UsersService,
    ) { }

    async create(userId: string, createDto: CreatePermissionRequestDto) {
        // Check if there's already a pending or approved request for this document
        const existingRequest = await this.permissionRequestRepository.findOne({
            where: {
                userId,
                documentId: createDto.documentId,
                status: PermissionRequestStatus.PENDING,
            },
        });

        if (existingRequest) {
            throw new BadRequestException('You already have a pending request for this document');
        }

        const permissionRequest = this.permissionRequestRepository.create({
            userId,
            ...createDto,
        });

        const saved = await this.permissionRequestRepository.save(permissionRequest);

        // Reload with relations for email context
        const fullRequest = await this.permissionRequestRepository.findOne({
            where: { id: saved.id },
        });

        // Send email to all admins
        if (fullRequest?.user && fullRequest?.document) {
            const admins = await this.usersService.findAdmins();
            for (const admin of admins) {
                this.mailService.sendPermissionRequestEmail(
                    admin.email,
                    fullRequest.user.name,
                    fullRequest.document.title,
                    createDto.requestReason || 'Edit',
                );
            }
        }

        return saved;
    }

    async findAll(userId: string, userRole: string) {
        // If admin, return all requests
        if (userRole === UserRole.ADMIN) {
            return this.permissionRequestRepository.find({
                order: { createdAt: 'DESC' },
            });
        }

        // Otherwise, return only user's requests
        return this.permissionRequestRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    async findPending() {
        return this.permissionRequestRepository.find({
            where: { status: PermissionRequestStatus.PENDING },
            order: { createdAt: 'ASC' },
        });
    }

    async review(id: string, reviewerId: string, reviewDto: ReviewPermissionRequestDto) {
        const request = await this.permissionRequestRepository.findOne({
            where: { id },
        });

        if (!request) {
            throw new NotFoundException('Permission request not found');
        }

        if (request.status !== PermissionRequestStatus.PENDING) {
            throw new BadRequestException('This request has already been reviewed');
        }

        request.status = reviewDto.status;
        request.reviewedById = reviewerId;
        request.reviewedAt = new Date();

        const saved = await this.permissionRequestRepository.save(request);

        // Send status email to the requesting user
        if (request.user && request.document) {
            this.mailService.sendPermissionStatusEmail(
                request.user.email,
                request.user.name,
                request.document.title,
                reviewDto.status as 'APPROVED' | 'REJECTED',
            );
        }

        return saved;
    }

    async hasEditPermission(userId: string, documentId: string): Promise<boolean> {
        const approvedRequest = await this.permissionRequestRepository.findOne({
            where: {
                userId,
                documentId,
                status: PermissionRequestStatus.APPROVED,
            },
        });

        return !!approvedRequest;
    }

    async findOne(id: string) {
        const request = await this.permissionRequestRepository.findOne({
            where: { id },
        });

        if (!request) {
            throw new NotFoundException('Permission request not found');
        }

        return request;
    }
}
