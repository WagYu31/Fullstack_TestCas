import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Document } from '../../documents/entities/document.entity';
import { PermissionRequestStatus } from '../../common/enums/permission-request-status.enum';

@Entity('edit_permission_requests')
export class PermissionRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id' })
    userId: string;

    @ManyToOne(() => Document, { eager: true })
    @JoinColumn({ name: 'document_id' })
    document: Document;

    @Column({ name: 'document_id' })
    documentId: string;

    @Column({ type: 'text' })
    requestReason: string;

    @Column({
        type: 'enum',
        enum: PermissionRequestStatus,
        default: PermissionRequestStatus.PENDING,
    })
    status: PermissionRequestStatus;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'reviewed_by' })
    reviewedBy: User;

    @Column({ name: 'reviewed_by', nullable: true })
    reviewedById: string;

    @Column({ type: 'timestamp', nullable: true })
    reviewedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
