import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    VersionColumn,
} from 'typeorm';
import { DocumentStatus } from '../../common/enums/document-status.enum';
import { User } from '../../users/entities/user.entity';
import { PermissionRequest } from '../../permissions/entities/permission-request.entity';

@Entity('documents')
export class Document {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column('text')
    description: string;

    @Column()
    documentType: string;

    @Column()
    fileUrl: string;

    @Column()
    fileName: string;

    @Column()
    fileSize: number;

    @Column()
    mimeType: string;

    @VersionColumn()
    version: number;

    @Column({
        type: 'enum',
        enum: DocumentStatus,
        default: DocumentStatus.ACTIVE,
    })
    status: DocumentStatus;

    @Column()
    createdById: string;

    @ManyToOne(() => User, (user) => user.documents)
    @JoinColumn({ name: 'createdById' })
    createdBy: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => PermissionRequest, (request) => request.document)
    permissionRequests: PermissionRequest[];
}
