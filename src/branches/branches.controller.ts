import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Query,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ProductBrand } from '../products/entities/product.entity';

@Controller('branches')
export class BranchesController {
    constructor(private readonly branchesService: BranchesService) { }

    /** Listado público — el sitio lo usa para resolver el WhatsApp por marca. */
    @Public()
    @Get()
    findAll(@Query('onlyActive') onlyActive?: string) {
        return this.branchesService.findAll(onlyActive === 'true');
    }

    @Public()
    @Get(':brand')
    findOne(@Param('brand') brand: ProductBrand) {
        return this.branchesService.findByBrand(brand);
    }

    @Patch(':brand')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    update(
        @Param('brand') brand: ProductBrand,
        @Body() dto: UpdateBranchDto,
    ) {
        return this.branchesService.update(brand, dto);
    }
}
