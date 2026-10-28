import { Type } from 'class-transformer';
import {
    ArrayMaxSize,
    IsArray,
    IsBoolean,
    IsEmail,
    IsInt,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
    MinLength,
    ValidateIf,
    ValidateNested,
} from 'class-validator';

export class BranchScheduleItemDto {
    @IsString()
    @MinLength(1)
    @MaxLength(40)
    label: string;

    @IsString()
    @MinLength(1)
    @MaxLength(40)
    hours: string;

    @IsArray()
    @ArrayMaxSize(7)
    @IsInt({ each: true })
    @Min(0, { each: true })
    @Max(6, { each: true })
    days: number[];

    @IsOptional()
    @IsBoolean()
    closed?: boolean;
}

export class UpdateBranchDto {
    @IsOptional()
    @IsString()
    @MaxLength(120)
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    phone?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    whatsappPhone?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    address?: string | null;

    /** Vacío o null = sin correo. */
    @IsOptional()
    @ValidateIf((_, v) => v !== null && v !== '')
    @IsEmail({}, { message: 'Correo inválido' })
    @MaxLength(120)
    email?: string | null;

    @IsOptional()
    @ValidateIf((_, v) => v !== null)
    @IsString()
    @MaxLength(80)
    emailHint?: string | null;

    /** null = volver al horario por defecto. */
    @IsOptional()
    @ValidateIf((_, v) => v !== null)
    @IsArray()
    @ArrayMaxSize(7)
    @ValidateNested({ each: true })
    @Type(() => BranchScheduleItemDto)
    schedule?: BranchScheduleItemDto[] | null;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
