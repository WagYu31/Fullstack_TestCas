import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PermissionRequestStatus } from '../../common/enums/permission-request-status.enum';

export class ReviewPermissionRequestDto {
    @IsEnum(PermissionRequestStatus)
    status: PermissionRequestStatus;

    @IsString()
    @IsOptional()
    reviewNote?: string;
}
