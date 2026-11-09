import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PlanType, ProductBrand } from '../entities/product.entity';

export enum ProductSortBy {
    DISPLAY_ORDER = 'displayOrder',
    CREATED_AT = 'createdAt',
    NAME = 'name',
    PRICE = 'price',
}

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class QueryProductDto {
    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Type(() => Boolean)
    onlyFeatured?: boolean;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxPrice?: number;

    @IsOptional()
    @IsEnum(ProductBrand)
    brand?: ProductBrand;

    @IsOptional()
    @IsEnum(PlanType)
    planType?: PlanType;

    @IsOptional()
    @IsEnum(ProductSortBy)
    sortBy?: ProductSortBy = ProductSortBy.DISPLAY_ORDER;

    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder = SortOrder.ASC;

    @IsOptional()
    @Type(() => Number)
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @Min(1)
    limit?: number = 12;
}
