/**
 * Document event payloads.
 * These interfaces define the contract between modules.
 * When migrating to microservices, these become message schemas.
 */

export class DocumentUploadedEvent {
    constructor(
        public readonly documentId: string,
        public readonly title: string,
        public readonly fileName: string,
        public readonly fileSize: number,
        public readonly mimeType: string,
        public readonly userId: string,
        public readonly userName: string,
        public readonly timestamp: Date = new Date(),
    ) { }
}

export class DocumentDownloadedEvent {
    constructor(
        public readonly documentId: string,
        public readonly fileName: string,
        public readonly userId: string,
        public readonly userName: string,
        public readonly timestamp: Date = new Date(),
    ) { }
}

export class DocumentDeletedEvent {
    constructor(
        public readonly documentId: string,
        public readonly title: string,
        public readonly userId: string,
        public readonly userName: string,
        public readonly timestamp: Date = new Date(),
    ) { }
}

export class DocumentReplacedEvent {
    constructor(
        public readonly documentId: string,
        public readonly title: string,
        public readonly oldFileName: string,
        public readonly newFileName: string,
        public readonly userId: string,
        public readonly userName: string,
        public readonly reason: string,
        public readonly timestamp: Date = new Date(),
    ) { }
}
