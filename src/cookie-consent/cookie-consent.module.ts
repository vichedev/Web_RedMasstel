import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CookieConsent } from './entities/cookie-consent.entity';
import { CookieConsentService } from './cookie-consent.service';
import { CookieConsentController } from './cookie-consent.controller';

@Module({
    imports: [TypeOrmModule.forFeature([CookieConsent])],
    controllers: [CookieConsentController],
    providers: [CookieConsentService],
})
export class CookieConsentModule { }
