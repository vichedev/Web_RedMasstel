import {
    ArrayMaxSize,
    IsArray,
    IsBoolean,
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    MaxLength,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PlanType, ProductBrand, ProductStatus } from '../entities/product.entity';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    price?: number;

    @IsString()
    @IsNotEmpty()
    imageUrl: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean;

    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @IsOptional()
    @IsEnum(ProductStatus)
    status?: ProductStatus;

    @IsOptional()
    @IsDateString()
    scheduledAt?: string | null;

    // ───── Campos de marca/plan ─────

    @IsOptional()
    @IsEnum(ProductBrand)
    brand?: ProductBrand;

    @IsOptional()
    @IsEnum(PlanType)
    planType?: PlanType;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(100000)
    downloadSpeed?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(100000)
    uploadSpeed?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(10000)
    channels?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(10000)
    hdChannels?: number;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(20)
    @IsString({ each: true })
    features?: string[];

    @IsOptional()
    @IsString()
    @MaxLength(60)
    badge?: string;
}
