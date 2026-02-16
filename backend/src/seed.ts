import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { UserRole } from './common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);

    try {
        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const admin = await usersService.create({
            name: 'Admin',
            email: 'admin@cybermax.com',
            password: hashedPassword,
            role: UserRole.ADMIN,
        });

        console.log('✅ Admin user created successfully!');
        console.log('Email: admin@cybermax.com');
        console.log('Password: admin123');
        console.log('');

        // Create test user
        const testPassword = await bcrypt.hash('password123', 10);

        const testUser = await usersService.create({
            name: 'Wahyu Wutomo',
            email: 'wahyuwutomo31@gmail.com',
            password: testPassword,
            role: UserRole.USER,
        });

        console.log('✅ Test user created successfully!');
        console.log('Email: wahyuwutomo31@gmail.com');
        console.log('Password: password123');

    } catch (error) {
        console.error('❌ Error creating users:', error.message);
    }

    await app.close();
}

bootstrap();
