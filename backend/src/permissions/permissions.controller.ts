import {
    Controller,
    Get,
    Post,
    Param,
    UseGuards,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionsController {
    constructor(private permissionsService: PermissionsService) { }

    @Get()
    @Roles(UserRole.ADMIN)
    async findAll() {
        return this.permissionsService.findAll();
    }

    @Post(':id/approve')
    @Roles(UserRole.ADMIN)
    async approve(@Param('id') id: string, @CurrentUser() user: User) {
        await this.permissionsService.approve(id, user.id);
        return { message: 'Permission request approved successfully' };
    }

    @Post(':id/reject')
    @Roles(UserRole.ADMIN)
    async reject(@Param('id') id: string, @CurrentUser() user: User) {
        await this.permissionsService.reject(id, user.id);
        return { message: 'Permission request rejected successfully' };
    }

    @Get('stats')
    @Roles(UserRole.ADMIN)
    async getStatistics() {
        return this.permissionsService.getStatistics();
    }
}
