import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
    ForbiddenException,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    async create(
        @CurrentUser() user: User,
        @Body() body: { name: string; email: string; password: string; role?: UserRole },
    ) {
        if (user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('Admin access required');
        }
        const existing = await this.usersService.findByEmail(body.email);
        if (existing) {
            throw new ConflictException('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(body.password, 10);
        const newUser = await this.usersService.create({
            name: body.name,
            email: body.email,
            password: hashedPassword,
            role: body.role || UserRole.USER,
        });
        const { password, ...result } = newUser;
        return result;
    }

    @Get('me')
    async getMe(@CurrentUser() user: User) {
        const fullUser = await this.usersService.findById(user.id);
        if (!fullUser) throw new NotFoundException('User not found');
        const { password, ...result } = fullUser;
        return result;
    }

    @Patch('auto-backup')
    async toggleAutoBackup(
        @CurrentUser() user: User,
        @Body() body: { autoBackup: boolean },
    ) {
        await this.usersService.update(user.id, { autoBackup: body.autoBackup });
        return { autoBackup: body.autoBackup, message: body.autoBackup ? 'Auto backup enabled' : 'Auto backup disabled' };
    }

    @Patch('notification-preferences')
    async updateNotificationPreferences(
        @CurrentUser() user: User,
        @Body() body: { notifActivity?: boolean; notifEmail?: boolean; notifPush?: boolean },
    ) {
        const updateData: any = {};
        if (body.notifActivity !== undefined) updateData.notifActivity = body.notifActivity;
        if (body.notifEmail !== undefined) updateData.notifEmail = body.notifEmail;
        if (body.notifPush !== undefined) updateData.notifPush = body.notifPush;
        await this.usersService.update(user.id, updateData);
        return { ...updateData, message: 'Notification preferences updated' };
    }

    @Get()
    async findAll(@CurrentUser() user: User) {
        if (user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('Admin access required');
        }
        const users = await this.usersService.findAll();
        return users.map(({ password, ...rest }) => rest);
    }

    @Patch(':id')
    async update(
        @CurrentUser() user: User,
        @Param('id') id: string,
        @Body() body: { name?: string; email?: string; password?: string; role?: UserRole },
    ) {
        if (user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('Admin access required');
        }
        const target = await this.usersService.findById(id);
        if (!target) {
            throw new NotFoundException('User not found');
        }
        if (body.role && user.id === id) {
            throw new ForbiddenException('Cannot change your own role');
        }
        if (body.email && body.email !== target.email) {
            const existing = await this.usersService.findByEmail(body.email);
            if (existing) {
                throw new ConflictException('Email already in use');
            }
        }
        const updateData: Partial<User> = {};
        if (body.name) updateData.name = body.name;
        if (body.email) updateData.email = body.email;
        if (body.role) updateData.role = body.role;
        if (body.password) updateData.password = await bcrypt.hash(body.password, 10);
        await this.usersService.update(id, updateData);
        const updated = await this.usersService.findById(id);
        const { password, ...result } = updated!;
        return result;
    }

    @Delete(':id')
    async remove(
        @CurrentUser() user: User,
        @Param('id') id: string,
    ) {
        if (user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('Admin access required');
        }
        if (user.id === id) {
            throw new ForbiddenException('Cannot delete your own account');
        }
        const target = await this.usersService.findById(id);
        if (!target) {
            throw new NotFoundException('User not found');
        }
        await this.usersService.remove(id);
        return { message: 'User deleted successfully' };
    }
}
