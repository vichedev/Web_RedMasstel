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
    ValidateIf,
    IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SocialPlatform } from '../entities/social-link.entity';
import { ProductBrand } from '../../products/entities/product.entity';

export class CreateSocialLinkDto {
    @IsEnum(SocialPlatform)
    @IsNotEmpty()
    platform: SocialPlatform;

    @IsOptional()
    @ValidateIf((_, value) => value !== null && value !== '')
    @IsUrl({ require_protocol: true })
    @MaxLength(500)
    url?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(120)
    username?: string | null;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(9999)
    sortOrder?: number;

    /** Microsite al que pertenece. Omitirlo o `null` = global. */
    @IsOptional()
    @IsEnum(ProductBrand)
    brand?: ProductBrand | null;
}
