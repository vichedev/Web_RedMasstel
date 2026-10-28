import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateBrandingAssetDto {
    @IsOptional()
    @IsString()
    @MaxLength(500)
    url?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    alt?: string | null;
}
