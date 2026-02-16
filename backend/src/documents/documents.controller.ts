import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    ForbiddenException,
    Res,
    Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DocumentsService } from './documents.service';
import { PermissionsService } from '../permissions/permissions.service';
import { PermissionRequestsService } from '../permission-requests/permission-requests.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { QueryDocumentsDto } from './dto/query-documents.dto';
import { RequestPermissionDto } from './dto/request-permission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { DocumentStatus } from '../common/enums/document-status.enum';
import { PermissionRequestType } from '../common/enums/permission-request-type.enum';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { AppEvents } from '../common/events/event-names';
import { DocumentUploadedEvent, DocumentDownloadedEvent } from '../common/events/document.events';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
    private readonly logger = new Logger(DocumentsController.name);

    // Allowed MIME types for document uploads
    private static readonly ALLOWED_MIMES = [
        'application/pdf',
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 'text/csv',
        'application/zip', 'application/x-rar-compressed',
    ];

    constructor(
        private documentsService: DocumentsService,
        private permissionsService: PermissionsService,
        private permissionRequestsService: PermissionRequestsService,
        private eventEmitter: EventEmitter2,
    ) { }

    @Post()
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
                    cb(null, uniqueName);
                },
            }),
            limits: {
                fileSize: 100 * 1024 * 1024, // 100MB
            },
            fileFilter: (req, file, cb) => {
                const allowedMimes = [
                    'application/pdf',
                    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/vnd.ms-powerpoint',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    'text/plain', 'text/csv',
                    'application/zip', 'application/x-rar-compressed',
                ];
                if (!allowedMimes.includes(file.mimetype)) {
                    cb(new BadRequestException(`Tipe file '${file.mimetype}' tidak diizinkan. Gunakan PDF, gambar, atau dokumen Office.`), false);
                } else {
                    cb(null, true);
                }
            },
        }),
    )
    async create(
        @Body() createDocumentDto: CreateDocumentDto,
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser() user: User,
    ) {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        this.logger.log(`📤 UPLOAD: User ${user.name} (${user.id}) uploaded '${file.originalname}' (${(file.size / 1024).toFixed(1)}KB, ${file.mimetype})`);
        const result = await this.documentsService.create(createDocumentDto, file, user.id);

        // Emit event — NotificationsModule akan mendengar ini
        this.eventEmitter.emit(
            AppEvents.DOCUMENT_UPLOADED,
            new DocumentUploadedEvent(
                result.id, result.title, file.originalname,
                file.size, file.mimetype, user.id, user.name,
            ),
        );

        return result;
    }

    @Get()
    async findAll(@Query() queryDto: QueryDocumentsDto, @CurrentUser() user: User) {
        return this.documentsService.findAll(queryDto, user.id, user.role);
    }

    @Get('stats')
    async getStatistics(@CurrentUser() user: User) {
        return this.documentsService.getStatistics(user.id, user.role);
    }

    @Get('recent')
    async getRecent(@CurrentUser() user: User, @Query('limit') limit?: number) {
        return this.documentsService.getRecent(user.id, user.role, limit || 5);
    }

    @Get('backup')
    async backupMyDocuments(@CurrentUser() user: User, @Res() res: Response) {
        const { archive, userName, count } = await this.documentsService.backupDocuments(user.id);

        const safeName = userName.replace(/[^a-zA-Z0-9]/g, '_');
        const date = new Date().toISOString().slice(0, 10);
        const filename = `backup_${safeName}_${date}.zip`;

        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${filename}"`,
        });

        archive.pipe(res);
    }

    @Get('backup/:userId')
    async backupUserDocuments(
        @Param('userId') userId: string,
        @CurrentUser() user: User,
        @Res() res: Response,
    ) {
        if (user.role !== 'ADMIN') {
            throw new ForbiddenException('Only admins can backup other users\' documents');
        }

        const { archive, userName, count } = await this.documentsService.backupDocuments(userId);

        const safeName = userName.replace(/[^a-zA-Z0-9]/g, '_');
        const date = new Date().toISOString().slice(0, 10);
        const filename = `backup_${safeName}_${date}.zip`;

        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${filename}"`,
        });

        archive.pipe(res);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @CurrentUser() user: User) {
        return this.documentsService.findOne(id, user.id, user.role);
    }

    @Get(':id/download')
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    async downloadFile(
        @Param('id') id: string,
        @CurrentUser() user: User,
        @Res() res: Response,
    ) {
        const document = await this.documentsService.findOne(id, user.id, user.role);

        if (!fs.existsSync(document.fileUrl)) {
            throw new BadRequestException('File not found');
        }

        this.logger.log(`📥 DOWNLOAD: User ${user.name} (${user.id}) downloaded '${document.fileName}' (doc: ${id})`);

        // Emit event
        this.eventEmitter.emit(
            AppEvents.DOCUMENT_DOWNLOADED,
            new DocumentDownloadedEvent(id, document.fileName, user.id, user.name),
        );

        res.download(document.fileUrl, document.fileName);
    }

    @Post(':id/replace')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
                    cb(null, uniqueName);
                },
            }),
            limits: {
                fileSize: 100 * 1024 * 1024,
            },
            fileFilter: (req, file, cb) => {
                const allowedMimes = [
                    'application/pdf',
                    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/vnd.ms-powerpoint',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    'text/plain', 'text/csv',
                    'application/zip', 'application/x-rar-compressed',
                ];
                if (!allowedMimes.includes(file.mimetype)) {
                    cb(new BadRequestException(`Tipe file '${file.mimetype}' tidak diizinkan.`), false);
                } else {
                    cb(null, true);
                }
            },
        }),
    )
    async requestReplace(
        @Param('id') id: string,
        @Body() requestPermissionDto: RequestPermissionDto,
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser() user: User,
    ) {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        // Check ownership (admins can manage any document)
        const document = await this.documentsService.checkOwnership(id, user.id, user.role);

        // Check if document is already pending
        if (
            document.status === DocumentStatus.PENDING_DELETE ||
            document.status === DocumentStatus.PENDING_REPLACE
        ) {
            throw new BadRequestException('Document already has a pending request');
        }

        // Create permission request
        await this.permissionsService.createPermissionRequest({
            documentId: id,
            requestedById: user.id,
            requestType: PermissionRequestType.REPLACE,
            reason: requestPermissionDto.reason,
            newFileUrl: file.path,
            newFileName: file.originalname,
            newFileSize: file.size,
            newMimeType: file.mimetype,
        });

        // Update document status
        await this.documentsService.updateStatus(id, DocumentStatus.PENDING_REPLACE);

        return {
            message: 'Replace request submitted successfully',
        };
    }

    @Delete(':id')
    async requestDelete(
        @Param('id') id: string,
        @Body() requestPermissionDto: RequestPermissionDto,
        @CurrentUser() user: User,
    ) {
        // Check ownership (admins can manage any document)
        const document = await this.documentsService.checkOwnership(id, user.id, user.role);

        // Check if document is already pending
        if (
            document.status === DocumentStatus.PENDING_DELETE ||
            document.status === DocumentStatus.PENDING_REPLACE
        ) {
            throw new BadRequestException('Document already has a pending request');
        }

        // Create permission request
        await this.permissionsService.createPermissionRequest({
            documentId: id,
            requestedById: user.id,
            requestType: PermissionRequestType.DELETE,
            reason: requestPermissionDto.reason,
        });

        // Update document status
        await this.documentsService.updateStatus(id, DocumentStatus.PENDING_DELETE);

        return {
            message: 'Delete request submitted successfully',
        };
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateDocumentDto,
        @CurrentUser() user: User,
    ) {
        // All users must have an approved edit permission request before editing
        const hasPermission = await this.permissionRequestsService.hasEditPermission(
            user.id,
            id,
        );

        if (!hasPermission) {
            throw new ForbiddenException(
                'You do not have permission to edit this document. Please request permission first.',
            );
        }

        return this.documentsService.update(id, user.id, updateDto, user.role);
    }


}
