import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateDocumentDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    documentType: string;
}
