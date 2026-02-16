/**
 * Centralized event name constants.
 * When migrating to microservices, these become message/topic names.
 */
export enum AppEvents {
    // Document events
    DOCUMENT_UPLOADED = 'document.uploaded',
    DOCUMENT_DOWNLOADED = 'document.downloaded',
    DOCUMENT_DELETED = 'document.deleted',
    DOCUMENT_REPLACED = 'document.replaced',

    // User events
    USER_CREATED = 'user.created',
    USER_DELETED = 'user.deleted',

    // Backup events
    BACKUP_COMPLETED = 'backup.completed',
    BACKUP_FAILED = 'backup.failed',
}
