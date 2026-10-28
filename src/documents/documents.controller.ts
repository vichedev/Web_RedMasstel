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
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ProductBrand } from '../products/entities/product.entity';

@Controller('documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    /**
     * Listado público (sólo activos). Si el cliente pasa `?brand=REDMAASTEL`
     * el backend devuelve los documentos de esa marca + los globales.
     */
    @Public()
    @Get()
    findActive(@Query('brand') brand?: ProductBrand) {
        return this.documentsService.findActive(brand);
    }

    /** Documentos seleccionados para mostrar en el footer. */
    @Public()
    @Get('footer')
    findFooter(@Query('brand') brand?: ProductBrand) {
        return this.documentsService.findFooter(brand);
    }

    /** Listado completo para el dashboard. */
    @Get('admin')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    findAll(@Query('brand') brand?: ProductBrand) {
        return this.documentsService.findAll(brand);
    }

    @Public()
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.documentsService.findOne(id);
    }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    create(@Body() dto: CreateDocumentDto) {
        return this.documentsService.create(dto);
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateDocumentDto,
    ) {
        return this.documentsService.update(id, dto);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.documentsService.remove(id);
    }
}
