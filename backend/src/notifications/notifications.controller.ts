import {
    Controller,
    Get,
    Patch,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private notificationsService: NotificationsService) { }

    @Get()
    async findAll(
        @CurrentUser() user: User,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ) {
        return this.notificationsService.findByUser(user.id, page, limit);
    }

    @Get('unread-count')
    async getUnreadCount(@CurrentUser() user: User) {
        const count = await this.notificationsService.getUnreadCount(user.id);
        return { count };
    }

    @Patch(':id/read')
    async markAsRead(@Param('id') id: string, @CurrentUser() user: User) {
        await this.notificationsService.markAsRead(id, user.id);
        return { message: 'Notification marked as read' };
    }
}
