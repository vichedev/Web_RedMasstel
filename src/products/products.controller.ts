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
import { ProductsService } from './products.service';
import { ProductImagesService } from './product-images.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { BulkUpdateDto, BulkDeleteDto } from './dto/bulk-operations.dto';
import { ReorderDto } from '../common/dto/reorder.dto';
import {
    AddProductImageDto,
    ReorderProductImagesDto,
    UpdateProductImageDto,
} from './dto/product-image.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PlanType, ProductBrand } from './entities/product.entity';

@Controller('planes')
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService,
        private readonly productImagesService: ProductImagesService,
    ) { }

    // ─── Endpoints admin sin parámetros dinámicos ───

    @Get('admin/all')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    findAllAdmin(
        @Query('brand') brand?: ProductBrand,
        @Query('planType') planType?: PlanType,
    ) {
        return this.productsService.findAllAdmin({ brand, planType });
    }

    // ─── Acciones masivas (bulk) ───

    @Patch('bulk')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    bulkUpdate(@Body() dto: BulkUpdateDto) {
        return this.productsService.bulkUpdate(dto.ids, dto.patch);
    }

    @Delete('bulk')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    bulkRemove(@Body() dto: BulkDeleteDto) {
        return this.productsService.bulkRemove(dto.ids);
    }

    /** Orden manual de los planes en la web. Va antes de ':id'. */
    @Patch('reorder')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    reorder(@Body() dto: ReorderDto) {
        return this.productsService.reorder(dto);
    }

    // ─── Endpoints públicos ───

    @Public()
    @Get()
    findAll(@Query() query: QueryProductDto) {
        return this.productsService.findAll(query);
    }

    @Public()
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.productsService.findOne(id);
    }

    // ─── Endpoints de escritura ───

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    create(@Body() dto: CreateProductDto) {
        return this.productsService.create(dto);
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateProductDto,
    ) {
        return this.productsService.update(id, dto);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.productsService.remove(id);
    }

    // ─── Galería multi-imagen ───

    @Public()
    @Get(':id/images')
    listImages(@Param('id', ParseUUIDPipe) id: string) {
        return this.productImagesService.list(id);
    }

    @Post(':id/images')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    addImage(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: AddProductImageDto,
    ) {
        return this.productImagesService.add(id, dto);
    }

    @Patch(':id/images/reorder')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    reorderImages(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: ReorderProductImagesDto,
    ) {
        return this.productImagesService.reorder(id, dto);
    }

    @Patch(':id/images/:imageId')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    updateImage(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('imageId', ParseUUIDPipe) imageId: string,
        @Body() dto: UpdateProductImageDto,
    ) {
        return this.productImagesService.update(id, imageId, dto);
    }

    @Patch(':id/images/:imageId/primary')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    setPrimary(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('imageId', ParseUUIDPipe) imageId: string,
    ) {
        return this.productImagesService.setPrimary(id, imageId);
    }

    @Delete(':id/images/:imageId')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    removeImage(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('imageId', ParseUUIDPipe) imageId: string,
    ) {
        return this.productImagesService.remove(id, imageId);
    }
}