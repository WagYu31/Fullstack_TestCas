import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePermissionRequestDto {
    @IsUUID()
    @IsNotEmpty()
    documentId: string;

    @IsString()
    @IsNotEmpty()
    requestReason: string;
}
