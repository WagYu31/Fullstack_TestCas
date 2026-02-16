import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async findById(id: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id } });
    }

    async create(userData: Partial<User>): Promise<User> {
        const user = this.usersRepository.create(userData);
        return this.usersRepository.save(user);
    }

    async findAdmins(): Promise<User[]> {
        return this.usersRepository.find({ where: { role: UserRole.ADMIN } });
    }

    async count(): Promise<number> {
        return this.usersRepository.count();
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async updatePassword(userId: string, hashedPassword: string): Promise<void> {
        await this.usersRepository.update(userId, { password: hashedPassword });
    }

    async updateName(userId: string, name: string): Promise<User> {
        await this.usersRepository.update(userId, { name });
        return this.findById(userId) as Promise<User>;
    }

    async updateRole(userId: string, role: UserRole): Promise<User> {
        await this.usersRepository.update(userId, { role });
        return this.findById(userId) as Promise<User>;
    }

    async update(userId: string, data: Partial<User>): Promise<void> {
        await this.usersRepository.update(userId, data);
    }

    async findByResetToken(token: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { resetToken: token } });
    }

    async remove(userId: string): Promise<void> {
        await this.usersRepository.delete(userId);
    }
}
