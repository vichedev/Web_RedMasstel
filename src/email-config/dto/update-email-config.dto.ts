import {
    IsEmail,
    IsOptional,
    IsString,
    MaxLength,
    ValidateIf,
} from 'class-validator';

export class UpdateEmailConfigDto {
    @IsOptional()
    @IsString()
    @MaxLength(200)
    publicKey?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    serviceId?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    templateContact?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    templateSubscribe?: string | null;

    @IsOptional()
    @ValidateIf((_, value) => value !== null && value !== '')
    @IsEmail({}, { message: 'adminEmail debe ser un correo válido' })
    @MaxLength(200)
    adminEmail?: string | null;
}
