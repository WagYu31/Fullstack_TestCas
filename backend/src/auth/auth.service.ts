import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private mailService: MailService,
    ) { }

    async register(registerDto: RegisterDto) {
        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        // Make first user ADMIN automatically
        const userCount = await this.usersService.count();
        const role = userCount === 0 ? UserRole.ADMIN : (registerDto.role || UserRole.USER);

        const user = await this.usersService.create({
            email: registerDto.email,
            password: hashedPassword,
            name: registerDto.name,
            role: role,
        });

        // Send welcome email
        this.mailService.sendWelcomeEmail(user.email, user.name);

        const { password, ...result } = user;
        return result;
    }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(
            loginDto.password,
            user.password,
        );
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = this.jwtService.sign(payload);

        const { password, ...userWithoutPassword } = user;

        return {
            access_token: token,
            user: userWithoutPassword,
        };
    }

    async forgotPassword(email: string) {
        const user = await this.usersService.findByEmail(email);

        // Always return success (don't reveal if email exists)
        if (!user) {
            return { message: 'Jika email terdaftar, link reset password telah dikirim.' };
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        await this.usersService.update(user.id, {
            resetToken,
            resetTokenExpiry,
        });

        // Send reset email
        this.mailService.sendForgotPasswordEmail(user.email, resetToken, user.name);

        return { message: 'Jika email terdaftar, link reset password telah dikirim.' };
    }

    async resetPassword(token: string, newPassword: string) {
        const user = await this.usersService.findByResetToken(token);

        if (!user) {
            throw new BadRequestException('Token reset tidak valid atau sudah kedaluwarsa.');
        }

        if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            throw new BadRequestException('Token reset sudah kedaluwarsa. Silakan request ulang.');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await this.usersService.update(user.id, {
            password: hashedPassword,
            resetToken: null as any,
            resetTokenExpiry: null as any,
        });

        return { message: 'Password berhasil direset. Silakan login dengan password baru.' };
    }

    async validateUser(userId: string) {
        return this.usersService.findById(userId);
    }
}
