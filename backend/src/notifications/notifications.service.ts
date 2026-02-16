import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationType } from '../common/enums/notification-type.enum';
import { UsersService } from '../users/users.service';
import { UserRole } from '../common/enums/user-role.enum';

interface CreateNotificationDto {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    relatedEntityId?: string;
}

interface NotifyAdminsDto {
    title: string;
    message: string;
    type: NotificationType;
    relatedEntityId?: string;
}

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private notificationsRepository: Repository<Notification>,
        private usersService: UsersService,
    ) { }

    async create(dto: CreateNotificationDto): Promise<Notification> {
        const notification = this.notificationsRepository.create(dto);
        return this.notificationsRepository.save(notification);
    }

    async notifyAdmins(dto: NotifyAdminsDto): Promise<void> {
        // Find all admin users using UsersService
        const admins = await this.usersService.findAdmins();

        // Create notification for each admin
        const notifications = admins.map((admin) =>
            this.notificationsRepository.create({
                userId: admin.id,
                ...dto,
            }),
        );

        await this.notificationsRepository.save(notifications);
    }

    async findByUser(userId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [notifications, total] = await this.notificationsRepository.findAndCount({
            where: { userId },
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

        return {
            data: notifications,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getUnreadCount(userId: string): Promise<number> {
        return this.notificationsRepository.count({
            where: { userId, isRead: false },
        });
    }

    async markAsRead(id: string, userId: string): Promise<void> {
        await this.notificationsRepository.update(
            { id, userId },
            { isRead: true },
        );
    }
}
