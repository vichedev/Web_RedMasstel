import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Repository } from 'typeorm';
import { AdPosition, Advertisement } from './entities/advertisement.entity';
import { ProductBrand } from '../products/entities/product.entity';
import { ReorderDto } from '../common/dto/reorder.dto';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';

@Injectable()
export class AdvertisementsService {
    constructor(
        @InjectRepository(Advertisement)
        private readonly adRepository: Repository<Advertisement>,
        private readonly dataSource: DataSource,
    ) { }

    async reorder(dto: ReorderDto): Promise<{ affected: number }> {
        const ids = dto.items.map((i) => i.id);
        const found = await this.adRepository.count({ where: { id: In(ids) } });
        if (found !== ids.length) {
            throw new NotFoundException(
                'Una o más publicidades del lote no existen',
            );
        }
        await this.dataSource.transaction(async (manager) => {
            for (const item of dto.items) {
                await manager.update(Advertisement, item.id, {
                    displayOrder: item.displayOrder,
                });
            }
        });
        return { affected: ids.length };
    }

    async create(dto: CreateAdvertisementDto): Promise<Advertisement> {
        const ad: Advertisement = this.adRepository.create(dto);
        return this.adRepository.save(ad);
    }

    findAllAdmin(brand?: ProductBrand): Promise<Advertisement[]> {
        return this.adRepository.find({
            where: brand ? [{ brand }, { brand: IsNull() }] : undefined,
            order: { position: 'ASC', displayOrder: 'ASC' },
        });
    }

    /**
     * Públicos: activos filtrados por posición opcional. Si se pasa
     * `brand`, solo devuelve banners del microsite + globales.
     */
    findActiveByPosition(
        position?: AdPosition,
        brand?: ProductBrand,
    ): Promise<Advertisement[]> {
        const baseFilter = {
            isActive: true,
            ...(position ? { position } : {}),
        };
        return this.adRepository.find({
            where: brand
                ? [
                    { ...baseFilter, brand },
                    { ...baseFilter, brand: IsNull() },
                ]
                : baseFilter,
            order: { displayOrder: 'ASC' },
        });
    }

    async findOne(id: string): Promise<Advertisement> {
        const ad = await this.adRepository.findOne({ where: { id } });
        if (!ad) {
            throw new NotFoundException('Publicidad no encontrada');
        }
        return ad;
    }

    async update(id: string, dto: UpdateAdvertisementDto): Promise<Advertisement> {
        const ad = await this.adRepository.findOne({ where: { id } });
        if (!ad) {
            throw new NotFoundException('Publicidad no encontrada');
        }
        Object.assign(ad, dto);
        return this.adRepository.save(ad);
    }

    async remove(id: string): Promise<void> {
        const result = await this.adRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('Publicidad no encontrada');
        }
    }
}