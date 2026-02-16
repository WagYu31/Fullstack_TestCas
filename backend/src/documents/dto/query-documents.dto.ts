import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { DocumentStatus } from '../../common/enums/document-status.enum';

export class QueryDocumentsDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    documentType?: string;

    @IsOptional()
    @IsEnum(DocumentStatus)
    status?: DocumentStatus;
}
