import { IsEnum, IsUUID } from 'class-validator';
import { CookieDecision } from '../entities/cookie-consent.entity';

export class CreateCookieConsentDto {
    @IsUUID('4', { message: 'visitorId inválido' })
    visitorId: string;

    @IsEnum(CookieDecision)
    decision: CookieDecision;
}
