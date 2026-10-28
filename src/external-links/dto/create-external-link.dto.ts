import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    Max,
    MaxLength,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExternalLinkKind } from '../entities/external-link.entity';
import { ProductBrand } from '../../products/entities/product.entity';

export class CreateExternalLinkDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    label: string;

    @IsOptional()
    @IsString()
    @MaxLength(300)
    description?: string;

    @IsUrl({ require_protocol: true })
    @MaxLength(500)
    url: string;

    @IsOptional()
    @IsEnum(ExternalLinkKind)
    kind?: ExternalLinkKind;

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
