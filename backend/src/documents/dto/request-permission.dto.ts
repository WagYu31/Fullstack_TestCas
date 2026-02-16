import { IsNotEmpty, IsString } from 'class-validator';

export class RequestPermissionDto {
    @IsString()
    @IsNotEmpty()
    reason: string;
}
