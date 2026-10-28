import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { SocialLinksService } from './social-links.service';
import { CreateSocialLinkDto } from './dto/create-social-link.dto';
import { UpdateSocialLinkDto } from './dto/update-social-link.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ProductBrand } from '../products/entities/product.entity';

@Controller('social-links')
export class SocialLinksController {
    constructor(private readonly service: SocialLinksService) { }

    /**
     * Lista pública: sólo plataformas activas con URL. Si se pasa
     * `brand`, devuelve los del microsite + globales.
     */
    @Public()
    @Get()
    findPublic(@Query('brand') brand?: ProductBrand) {
        return this.service.findPublic(brand);
    }

    /** Lista completa para el dashboard, filtrable por brand. */
    @Get('admin')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    findAll(@Query('brand') brand?: ProductBrand) {
        return this.service.findAll(brand);
    }

    @Get(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.findOne(id);
    }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    create(@Body() dto: CreateSocialLinkDto) {
        return this.service.create(dto);
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateSocialLinkDto,
    ) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.remove(id);
    }
}
