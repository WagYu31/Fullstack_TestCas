import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AppEvents } from '../../common/events/event-names';
import {
    DocumentUploadedEvent,
    DocumentDownloadedEvent,
    DocumentDeletedEvent,
    DocumentReplacedEvent,
} from '../../common/events/document.events';
import { NotificationsService } from '../notifications.service';
import { NotificationsGateway } from '../notifications.gateway';
import { NotificationType } from '../../common/enums/notification-type.enum';

/**
 * Document Event Listener
 * Listens to document events, creates DB notifications, and pushes via WebSocket.
 */
@Injectable()
export class DocumentEventListener {
    private readonly logger = new Logger(DocumentEventListener.name);

    constructor(
        private readonly notificationsService: NotificationsService,
        private readonly notificationsGateway: NotificationsGateway,
    ) { }

    @OnEvent(AppEvents.DOCUMENT_UPLOADED)
    async handleDocumentUploaded(event: DocumentUploadedEvent) {
        this.logger.log(
            `📨 Event: Document uploaded by ${event.userName} — "${event.title}" (${event.fileName})`,
        );

        // Save to DB
        await this.notificationsService.notifyAdmins({
            title: 'Dokumen Baru Diupload',
            message: `${event.userName} mengupload dokumen "${event.title}" (${(event.fileSize / 1024).toFixed(1)} KB)`,
            type: NotificationType.DOCUMENT_UPDATE,
            relatedEntityId: event.documentId,
        });

        // Push via WebSocket to admins in real-time
        this.notificationsGateway.sendToAdmins({
            title: 'Dokumen Baru Diupload',
            message: `${event.userName} mengupload dokumen "${event.title}"`,
            type: NotificationType.DOCUMENT_UPDATE,
            timestamp: event.timestamp,
        });
    }

    @OnEvent(AppEvents.DOCUMENT_DOWNLOADED)
    handleDocumentDownloaded(event: DocumentDownloadedEvent) {
        this.logger.log(
            `📨 Event: Document downloaded by ${event.userName} — "${event.fileName}"`,
        );
    }

    @OnEvent(AppEvents.DOCUMENT_DELETED)
    async handleDocumentDeleted(event: DocumentDeletedEvent) {
        this.logger.log(
            `📨 Event: Document deleted by ${event.userName} — "${event.title}"`,
        );

        await this.notificationsService.notifyAdmins({
            title: 'Dokumen Dihapus',
            message: `${event.userName} menghapus dokumen "${event.title}"`,
            type: NotificationType.DOCUMENT_DELETED,
            relatedEntityId: event.documentId,
        });

        this.notificationsGateway.sendToAdmins({
            title: 'Dokumen Dihapus',
            message: `${event.userName} menghapus dokumen "${event.title}"`,
            type: NotificationType.DOCUMENT_DELETED,
            timestamp: event.timestamp,
        });
    }

    @OnEvent(AppEvents.DOCUMENT_REPLACED)
    async handleDocumentReplaced(event: DocumentReplacedEvent) {
        this.logger.log(
            `📨 Event: Document replaced by ${event.userName} — "${event.title}" (reason: ${event.reason})`,
        );

        await this.notificationsService.notifyAdmins({
            title: 'Dokumen Diperbarui',
            message: `${event.userName} mengganti file dokumen "${event.title}". Alasan: ${event.reason}`,
            type: NotificationType.DOCUMENT_UPDATE,
            relatedEntityId: event.documentId,
        });

        this.notificationsGateway.sendToAdmins({
            title: 'Dokumen Diperbarui',
            message: `${event.userName} mengganti file "${event.title}"`,
            type: NotificationType.DOCUMENT_UPDATE,
            timestamp: event.timestamp,
        });
    }
}

