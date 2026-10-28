import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { ProductBrand } from '../products/entities/product.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
    constructor(
        @InjectRepository(Document)
        private readonly documentRepository: Repository<Document>,
    ) { }

    create(dto: CreateDocumentDto): Promise<Document> {
        const doc = this.documentRepository.create(dto);
        return this.documentRepository.save(doc);
    }

    /**
     * Si se pasa `brand`, devuelve sólo los documentos de ese
     * microsite (incluyendo los `null` = globales). Sin filtro,
     * devuelve todos los documentos para la vista global del admin.
     */
    findAll(brand?: ProductBrand): Promise<Document[]> {
        return this.documentRepository.find({
            where: brand ? [{ brand }, { brand: IsNull() }] : undefined,
            order: { category: 'ASC', sortOrder: 'ASC', title: 'ASC' },
        });
    }

    /** Igual que `findAll` pero filtrando documentos activos. */
    findActive(brand?: ProductBrand): Promise<Document[]> {
        const baseFilter = { isActive: true } as const;
        return this.documentRepository.find({
            where: brand
                ? [
                    { ...baseFilter, brand },
                    { ...baseFilter, brand: IsNull() },
                ]
                : baseFilter,
            order: { category: 'ASC', sortOrder: 'ASC', title: 'ASC' },
        });
    }

    findFooter(brand?: ProductBrand): Promise<Document[]> {
        const baseFilter = { isActive: true, showInFooter: true } as const;
        return this.documentRepository.find({
            where: brand
                ? [
                    { ...baseFilter, brand },
                    { ...baseFilter, brand: IsNull() },
                ]
                : baseFilter,
            order: { sortOrder: 'ASC', title: 'ASC' },
        });
    }

    async findOne(id: string): Promise<Document> {
        const doc = await this.documentRepository.findOne({ where: { id } });
        if (!doc) throw new NotFoundException('Documento no encontrado');
        return doc;
    }

    async update(id: string, dto: UpdateDocumentDto): Promise<Document> {
        const doc = await this.findOne(id);
        Object.assign(doc, dto);
        return this.documentRepository.save(doc);
    }

    async remove(id: string): Promise<void> {
        const result = await this.documentRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('Documento no encontrado');
        }
    }
}
