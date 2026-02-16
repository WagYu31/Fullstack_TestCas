import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { QueryDocumentsDto } from './dto/query-documents.dto';
import { DocumentStatus } from '../common/enums/document-status.enum';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';

@Injectable()
export class DocumentsService {
    constructor(
        @InjectRepository(Document)
        private documentsRepository: Repository<Document>,
    ) { }

    async create(
        createDocumentDto: CreateDocumentDto,
        file: Express.Multer.File,
        userId: string,
    ): Promise<Document> {
        const document = this.documentsRepository.create({
            ...createDocumentDto,
            fileUrl: file.path,
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            createdById: userId,
            status: DocumentStatus.ACTIVE,
        });

        return this.documentsRepository.save(document);
    }

    async findAll(queryDto: QueryDocumentsDto, userId: string, userRole: UserRole) {
        const { page = 1, limit = 10, search, documentType, status } = queryDto;
        const skip = (page - 1) * limit;

        const queryBuilder = this.documentsRepository
            .createQueryBuilder('document')
            .leftJoinAndSelect('document.createdBy', 'user');

        // Regular users can only see their own documents
        if (userRole !== UserRole.ADMIN) {
            queryBuilder.where('document.createdById = :userId', { userId });
        }

        // Search filter
        if (search) {
            queryBuilder.andWhere(
                '(document.title ILIKE :search OR document.description ILIKE :search)',
                { search: `%${search}%` },
            );
        }

        // Document type filter
        if (documentType) {
            queryBuilder.andWhere('document.documentType = :documentType', {
                documentType,
            });
        }

        // Status filter
        if (status) {
            queryBuilder.andWhere('document.status = :status', { status });
        }

        const [documents, total] = await queryBuilder
            .orderBy('document.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return {
            data: documents,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string, userId: string, userRole: UserRole): Promise<Document> {
        const document = await this.documentsRepository.findOne({
            where: { id },
            relations: ['createdBy'],
        });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        // Check ownership
        if (userRole !== UserRole.ADMIN && document.createdById !== userId) {
            throw new ForbiddenException('You do not have access to this document');
        }

        return document;
    }

    async checkOwnership(documentId: string, userId: string, userRole?: UserRole): Promise<Document> {
        const document = await this.documentsRepository.findOne({
            where: { id: documentId },
        });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        // Admin can manage any document
        if (userRole === UserRole.ADMIN) {
            return document;
        }

        if (document.createdById !== userId) {
            throw new ForbiddenException('You do not own this document');
        }

        return document;
    }

    async updateStatus(
        documentId: string,
        status: DocumentStatus,
    ): Promise<Document> {
        const document = await this.documentsRepository.findOne({
            where: { id: documentId },
        });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        document.status = status;
        return this.documentsRepository.save(document);
    }

    async replaceFile(
        documentId: string,
        newFileUrl: string,
        newFileName: string,
        newFileSize: number,
        newMimeType: string,
    ): Promise<Document> {
        const document = await this.documentsRepository.findOne({
            where: { id: documentId },
        });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        // Delete old file
        if (fs.existsSync(document.fileUrl)) {
            fs.unlinkSync(document.fileUrl);
        }

        // Update document
        document.fileUrl = newFileUrl;
        document.fileName = newFileName;
        document.fileSize = newFileSize;
        document.mimeType = newMimeType;
        document.status = DocumentStatus.ACTIVE;

        return this.documentsRepository.save(document);
    }

    async delete(documentId: string): Promise<void> {
        console.log(`[DOCUMENTS] Starting delete for document ID: ${documentId}`);

        try {
            const document = await this.documentsRepository.findOne({
                where: { id: documentId },
            });

            if (!document) {
                console.error(`[DOCUMENTS] Document not found: ${documentId}`);
                throw new NotFoundException('Document not found');
            }

            console.log(`[DOCUMENTS] Found document: ${document.title}, file: ${document.fileUrl}`);

            // Delete file from disk
            if (fs.existsSync(document.fileUrl)) {
                console.log(`[DOCUMENTS] Deleting file from disk: ${document.fileUrl}`);
                fs.unlinkSync(document.fileUrl);
                console.log(`[DOCUMENTS] File deleted successfully`);
            } else {
                console.warn(`[DOCUMENTS] File not found on disk: ${document.fileUrl}`);
            }

            console.log(`[DOCUMENTS] Removing document from database`);
            await this.documentsRepository.remove(document);
            console.log(`[DOCUMENTS] Document deleted successfully from database`);
        } catch (error) {
            console.error(`[DOCUMENTS] Error deleting document:`, error);
            throw error;
        }
    }

    async getStatistics(userId: string, userRole: UserRole) {
        const queryBuilder = this.documentsRepository.createQueryBuilder('document');

        // Regular users can only see their own documents
        if (userRole !== UserRole.ADMIN) {
            queryBuilder.where('document.createdById = :userId', { userId });
        }

        const [total, active, pendingDelete, pendingReplace] = await Promise.all([
            queryBuilder.getCount(),
            queryBuilder.clone().andWhere('document.status = :status', { status: DocumentStatus.ACTIVE }).getCount(),
            queryBuilder.clone().andWhere('document.status = :status', { status: DocumentStatus.PENDING_DELETE }).getCount(),
            queryBuilder.clone().andWhere('document.status = :status', { status: DocumentStatus.PENDING_REPLACE }).getCount(),
        ]);

        // Document type breakdown
        const typeStatsRaw = await queryBuilder.clone()
            .select('document.documentType', 'documentType')
            .addSelect('COUNT(*)', 'count')
            .addSelect('MAX(document.createdAt)', 'latestDate')
            .addSelect('MIN(document.createdAt)', 'earliestDate')
            .groupBy('document.documentType')
            .getRawMany();

        const typeStats: Record<string, number> = {};
        const typeDates: Record<string, { latest: string; earliest: string }> = {};
        for (const row of typeStatsRaw) {
            typeStats[row.documentType] = parseInt(row.count, 10);
            typeDates[row.documentType] = {
                latest: row.latestDate,
                earliest: row.earliestDate,
            };
        }
        // Monthly breakdown by type
        let monthlyStats: Array<{ yearMonth: string; type: string; count: number }> = [];
        try {
            const monthlyRaw = await queryBuilder.clone()
                .select("DATE_FORMAT(document.createdAt, '%Y-%m')", 'yearMonth')
                .addSelect('document.documentType', 'documentType')
                .addSelect('COUNT(*)', 'count')
                .groupBy("DATE_FORMAT(document.createdAt, '%Y-%m')")
                .addGroupBy('document.documentType')
                .orderBy('yearMonth', 'ASC')
                .getRawMany();

            monthlyStats = monthlyRaw.map((row: any) => ({
                yearMonth: row.yearMonth,
                type: row.documentType,
                count: parseInt(row.count, 10),
            }));
        } catch (e) {
            console.error('Monthly stats query failed:', e);
        }

        return {
            total,
            active,
            pendingDelete,
            pendingReplace,
            pending: pendingDelete + pendingReplace,
            typeStats,
            typeDates,
            monthlyStats,
        };
    }

    async getRecent(userId: string, userRole: UserRole, limit: number = 5) {
        const queryBuilder = this.documentsRepository
            .createQueryBuilder('document')
            .leftJoinAndSelect('document.createdBy', 'user');

        // Regular users can only see their own documents
        if (userRole !== UserRole.ADMIN) {
            queryBuilder.where('document.createdById = :userId', { userId });
        }

        return queryBuilder
            .orderBy('document.createdAt', 'DESC')
            .take(limit)
            .getMany();
    }

    async update(id: string, userId: string, updateDto: any, userRole?: UserRole) {
        const document = await this.documentsRepository.findOne({
            where: { id },
        });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        // Update document
        Object.assign(document, updateDto);
        return this.documentsRepository.save(document);
    }

    async backupDocuments(userId: string): Promise<{ archive: archiver.Archiver; userName: string; count: number }> {
        // Find all documents for the user
        const documents = await this.documentsRepository.find({
            where: { createdById: userId },
            relations: ['createdBy'],
            order: { createdAt: 'DESC' },
        });

        const userName = documents.length > 0 && documents[0].createdBy
            ? documents[0].createdBy.name || 'user'
            : 'user';

        // Create ZIP archive
        const archive = archiver.default('zip', { zlib: { level: 9 } });

        // Add each document file to the archive
        const manifest: any[] = [];
        for (const doc of documents) {
            const filePath = path.resolve(doc.fileUrl);
            if (fs.existsSync(filePath)) {
                // Organize by document type folder
                const folder = doc.documentType.toLowerCase();
                archive.file(filePath, { name: `${folder}/${doc.fileName}` });
            }
            manifest.push({
                id: doc.id,
                title: doc.title,
                description: doc.description,
                documentType: doc.documentType,
                fileName: doc.fileName,
                fileSize: doc.fileSize,
                status: doc.status,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            });
        }

        // Add manifest.json
        archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });

        archive.finalize();

        return { archive, userName, count: documents.length };
    }
}
