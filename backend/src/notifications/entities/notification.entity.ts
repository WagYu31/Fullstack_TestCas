import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { NotificationType } from '../../common/enums/notification-type.enum';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
@Index(['userId', 'isRead'])
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @ManyToOne(() => User, (user) => user.notifications)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    title: string;

    @Column('text')
    message: string;

    @Column({
        type: 'enum',
        enum: NotificationType,
    })
    type: NotificationType;

    @Column({ nullable: true })
    relatedEntityId: string;

    @Column({ default: false })
    @Index()
    isRead: boolean;

    @CreateDateColumn()
    @Index()
    createdAt: Date;
}
