import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UpdateDocumentDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    documentType?: string;
}
