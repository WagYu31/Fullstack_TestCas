import { Module } from '@nestjs/common';
import { DevController } from './dev.controller';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [UsersModule],
    controllers: [DevController],
})
export class DevModule { }
