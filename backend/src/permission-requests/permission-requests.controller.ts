import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    UseGuards,
} from '@nestjs/common';
import { PermissionRequestsService } from './permission-requests.service';
import { CreatePermissionRequestDto } from './dto/create-permission-request.dto';
import { ReviewPermissionRequestDto } from './dto/review-permission-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('permission-requests')
@UseGuards(JwtAuthGuard)
export class PermissionRequestsController {
    constructor(
        private readonly permissionRequestsService: PermissionRequestsService,
    ) { }

    @Post()
    create(
        @CurrentUser() user: any,
        @Body() createDto: CreatePermissionRequestDto,
    ) {
        return this.permissionRequestsService.create(user.id, createDto);
    }

    @Get()
    findAll(@CurrentUser() user: any) {
        return this.permissionRequestsService.findAll(user.id, user.role);
    }

    @Get('pending')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    findPending() {
        return this.permissionRequestsService.findPending();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.permissionRequestsService.findOne(id);
    }

    @Patch(':id/review')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    review(
        @Param('id') id: string,
        @CurrentUser() user: any,
        @Body() reviewDto: ReviewPermissionRequestDto,
    ) {
        return this.permissionRequestsService.review(id, user.id, reviewDto);
    }
}
