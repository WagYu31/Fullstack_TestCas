import { Controller, Post, Body, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
    ) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('forgot-password')
    async forgotPassword(@Body() body: { email: string }) {
        return this.authService.forgotPassword(body.email);
    }

    @Post('reset-password')
    async resetPassword(@Body() body: { token: string; newPassword: string }) {
        return this.authService.resetPassword(body.token, body.newPassword);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@CurrentUser() user: User) {
        const fullUser = await this.usersService.findById(user.id);
        if (!fullUser) {
            const { password, ...result } = user;
            return result;
        }
        const { password, ...result } = fullUser;
        return result;
    }

    @Patch('profile')
    @UseGuards(JwtAuthGuard)
    async updateProfile(
        @CurrentUser() user: User,
        @Body() updateData: { name?: string },
    ) {
        if (updateData.name) {
            const updatedUser = await this.usersService.updateName(user.id, updateData.name);
            const { password, ...result } = updatedUser;
            return result;
        }
        const { password, ...result } = user;
        return result;
    }
}
