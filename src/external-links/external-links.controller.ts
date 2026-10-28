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
import { ExternalLinksService } from './external-links.service';
import { CreateExternalLinkDto } from './dto/create-external-link.dto';
import { UpdateExternalLinkDto } from './dto/update-external-link.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ProductBrand } from '../products/entities/product.entity';

@Controller('external-links')
export class ExternalLinksController {
    constructor(private readonly linksService: ExternalLinksService) { }

    @Public()
    @Get()
    findActive(@Query('brand') brand?: ProductBrand) {
        return this.linksService.findActive(brand);
    }

    @Public()
    @Get('footer')
    findFooter(@Query('brand') brand?: ProductBrand) {
        return this.linksService.findFooter(brand);
    }

    @Get('admin')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    findAll(@Query('brand') brand?: ProductBrand) {
        return this.linksService.findAll(brand);
    }

    @Public()
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.linksService.findOne(id);
    }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    create(@Body() dto: CreateExternalLinkDto) {
        return this.linksService.create(dto);
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateExternalLinkDto,
    ) {
        return this.linksService.update(id, dto);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.linksService.remove(id);
    }
}
