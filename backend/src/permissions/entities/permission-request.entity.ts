import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { PermissionRequestType } from '../../common/enums/permission-request-type.enum';
import { PermissionRequestStatus } from '../../common/enums/permission-request-status.enum';
import { Document } from '../../documents/entities/document.entity';
import { User } from '../../users/entities/user.entity';

@Entity('permission_requests')
export class PermissionRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    documentId: string;

    @ManyToOne(() => Document, (document) => document.permissionRequests)
    @JoinColumn({ name: 'documentId' })
    document: Document;

    @Column()
    requestedById: string;

    @ManyToOne(() => User, (user) => user.permissionRequests)
    @JoinColumn({ name: 'requestedById' })
    requestedBy: User;

    @Column({
        type: 'enum',
        enum: PermissionRequestType,
    })
    requestType: PermissionRequestType;

    @Column('text')
    reason: string;

    @Column({
        type: 'enum',
        enum: PermissionRequestStatus,
        default: PermissionRequestStatus.PENDING,
    })
    status: PermissionRequestStatus;

    @Column({ nullable: true })
    reviewedById: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'reviewedById' })
    reviewedBy: User;

    @Column({ type: 'timestamp', nullable: true })
    reviewedAt: Date;

    @Column({ nullable: true })
    newFileUrl: string;

    @Column({ nullable: true })
    newFileName: string;

    @Column({ nullable: true })
    newFileSize: number;

    @Column({ nullable: true })
    newMimeType: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
