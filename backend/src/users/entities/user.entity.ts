import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { UserRole } from '../../common/enums/user-role.enum';
import { Document } from '../../documents/entities/document.entity';
import { PermissionRequest } from '../../permissions/entities/permission-request.entity';
import { Notification } from '../../notifications/entities/notification.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole;

    @Column({ default: false })
    autoBackup: boolean;

    @Column({ default: true })
    notifActivity: boolean;

    @Column({ default: true })
    notifEmail: boolean;

    @Column({ default: false })
    notifPush: boolean;

    @Column({ nullable: true })
    resetToken: string;

    @Column({ type: 'datetime', nullable: true })
    resetTokenExpiry: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Document, (document) => document.createdBy)
    documents: Document[];

    @OneToMany(() => PermissionRequest, (request) => request.requestedBy)
    permissionRequests: PermissionRequest[];

    @OneToMany(() => Notification, (notification) => notification.user)
    notifications: Notification[];
}
