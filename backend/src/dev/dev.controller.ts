import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Controller('dev')
export class DevController {
    constructor(private usersService: UsersService) { }

    @Post('reset-all-passwords')
    async resetAllPasswords(@Body() body: { password: string }) {
        const password = body.password || 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Get all users
        const users = await this.usersService.findAll();

        // Update all users with new password
        for (const user of users) {
            await this.usersService.updatePassword(user.id, hashedPassword);
        }

        return {
            message: `All ${users.length} users password reset to: ${password}`,
            users: users.map(u => ({ email: u.email, role: u.role })),
        };
    }
}
