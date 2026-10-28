import {
    Body,
    Controller,
    Get,
    Param,
    ParseEnumPipe,
    Patch,
} from '@nestjs/common';
import { BrandingService } from './branding.service';
import { UpdateBrandingAssetDto } from './dto/update-branding-asset.dto';
import { BrandingSlot } from './entities/branding-asset.entity';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('branding')
export class BrandingController {
    constructor(private readonly brandingService: BrandingService) { }

    /** Listado público — el sitio resuelve cada slot por su clave. */
    @Public()
    @Get()
    findAll() {
        return this.brandingService.findAll();
    }

    @Public()
    @Get(':slot')
    findOne(@Param('slot', new ParseEnumPipe(BrandingSlot)) slot: BrandingSlot) {
        return this.brandingService.findBySlot(slot);
    }

    @Patch(':slot')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    update(
        @Param('slot', new ParseEnumPipe(BrandingSlot)) slot: BrandingSlot,
        @Body() dto: UpdateBrandingAssetDto,
    ) {
        return this.brandingService.update(slot, dto);
    }
}
