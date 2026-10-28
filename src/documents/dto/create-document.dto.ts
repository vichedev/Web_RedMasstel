import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DocumentCategory } from '../entities/document.entity';
import { ProductBrand } from '../../products/entities/product.entity';

export class CreateDocumentDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    fileUrl: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    originalName?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    fileSize?: number;

    @IsOptional()
    @IsEnum(DocumentCategory)
    category?: DocumentCategory;

    /** Microsite al que pertenece. Omitirlo o `null` = global. */
    @IsOptional()
    @IsEnum(ProductBrand)
    brand?: ProductBrand | null;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    showInFooter?: boolean;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(9999)
    sortOrder?: number;
}
