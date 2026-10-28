import { Body, Controller, Get, Headers, HttpCode, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CookieConsentService } from './cookie-consent.service';
import { CreateCookieConsentDto } from './dto/create-cookie-consent.dto';

@Controller('cookie-consent')
export class CookieConsentController {
    constructor(private readonly service: CookieConsentService) { }

    /** Público: lo llama el aviso de cookies al aceptar o rechazar. */
    @Public()
    @Post()
    @HttpCode(200)
    @Throttle({ default: { ttl: 60_000, limit: 10 } })
    record(
        @Body() dto: CreateCookieConsentDto,
        @Headers('user-agent') userAgent?: string,
    ) {
        return this.service.record(dto, userAgent);
    }

    /** Panel: cuántos aceptaron / rechazaron. */
    @Get('stats')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    stats() {
        return this.service.stats(30);
    }
}
