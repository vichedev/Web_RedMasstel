import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ExternalLink } from './entities/external-link.entity';
import { ProductBrand } from '../products/entities/product.entity';
import { CreateExternalLinkDto } from './dto/create-external-link.dto';
import { UpdateExternalLinkDto } from './dto/update-external-link.dto';

@Injectable()
export class ExternalLinksService {
    constructor(
        @InjectRepository(ExternalLink)
        private readonly linkRepository: Repository<ExternalLink>,
    ) { }

    create(dto: CreateExternalLinkDto): Promise<ExternalLink> {
        const link = this.linkRepository.create(dto);
        return this.linkRepository.save(link);
    }

    findAll(brand?: ProductBrand): Promise<ExternalLink[]> {
        return this.linkRepository.find({
            where: brand ? [{ brand }, { brand: IsNull() }] : undefined,
            order: { sortOrder: 'ASC', label: 'ASC' },
        });
    }

    findActive(brand?: ProductBrand): Promise<ExternalLink[]> {
        const baseFilter = { isActive: true } as const;
        return this.linkRepository.find({
            where: brand
                ? [
                    { ...baseFilter, brand },
                    { ...baseFilter, brand: IsNull() },
                ]
                : baseFilter,
            order: { sortOrder: 'ASC', label: 'ASC' },
        });
    }

    findFooter(brand?: ProductBrand): Promise<ExternalLink[]> {
        const baseFilter = { isActive: true, showInFooter: true } as const;
        return this.linkRepository.find({
            where: brand
                ? [
                    { ...baseFilter, brand },
                    { ...baseFilter, brand: IsNull() },
                ]
                : baseFilter,
            order: { sortOrder: 'ASC', label: 'ASC' },
        });
    }

    async findOne(id: string): Promise<ExternalLink> {
        const link = await this.linkRepository.findOne({ where: { id } });
        if (!link) throw new NotFoundException('Enlace no encontrado');
        return link;
    }

    async update(id: string, dto: UpdateExternalLinkDto): Promise<ExternalLink> {
        const link = await this.findOne(id);
        Object.assign(link, dto);
        return this.linkRepository.save(link);
    }

    async remove(id: string): Promise<void> {
        const result = await this.linkRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('Enlace no encontrado');
        }
    }
}
