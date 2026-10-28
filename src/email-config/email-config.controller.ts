import { Body, Controller, Get, Patch } from '@nestjs/common';
import { EmailConfigService } from './email-config.service';
import { UpdateEmailConfigDto } from './dto/update-email-config.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('email-config')
export class EmailConfigController {
    constructor(private readonly service: EmailConfigService) { }

    /**
     * GET público — el formulario de contacto y el newsletter del sitio
     * lo necesitan para invocar a EmailJS desde el navegador. Es seguro
     * porque las credenciales de EmailJS son públicas por diseño; lo que
     * realmente protege es la lista blanca de dominios en EmailJS.
     */
    @Public()
    @Get()
    findOne() {
        return this.service.findOne();
    }

    @Patch()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    update(@Body() dto: UpdateEmailConfigDto) {
        return this.service.update(dto);
    }
}
