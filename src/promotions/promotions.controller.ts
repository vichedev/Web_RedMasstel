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
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { ReorderDto } from '../common/dto/reorder.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ProductBrand } from '../products/entities/product.entity';

@Controller('promotions')
export class PromotionsController {
    constructor(private readonly promotionsService: PromotionsService) { }

    // Público: el Hero de la web consume este endpoint
    @Public()
    @Get('active')
    findActive(@Query('brand') brand?: ProductBrand) {
        return this.promotionsService.findActive(brand);
    }

    // Admin: todas (incluyendo inactivas y fuera de rango)
    @Get()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    findAllAdmin(@Query('brand') brand?: ProductBrand) {
        return this.promotionsService.findAllAdmin(brand);
    }

    @Patch('reorder')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    reorder(@Body() dto: ReorderDto) {
        return this.promotionsService.reorder(dto);
    }

    @Get(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.promotionsService.findOne(id);
    }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    create(@Body() dto: CreatePromotionDto) {
        return this.promotionsService.create(dto);
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdatePromotionDto,
    ) {
        return this.promotionsService.update(id, dto);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.promotionsService.remove(id);
    }
}