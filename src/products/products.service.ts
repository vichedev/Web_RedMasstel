import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PlanType, Product, ProductBrand } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { slugify } from '../common/utils/slug.util';
import { ReorderDto } from '../common/dto/reorder.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) { }

    async create(dto: CreateProductDto): Promise<Product> {
        const slug = await this.generateUniqueSlug(dto.name);
        const brand = dto.brand ?? ProductBrand.REDMAASTEL;
        const planType = dto.planType ?? PlanType.INTERNET;

        // Los planes nuevos van al final de la lista.
        const { max } = (await this.productRepository
            .createQueryBuilder('p')
            .select('COALESCE(MAX(p.displayOrder), -1)', 'max')
            .getRawOne<{ max: number }>()) ?? { max: -1 };

        const product = this.productRepository.create({
            ...dto,
            brand,
            planType,
            slug,
            displayOrder: Number(max) + 1,
            ...this.cleanFieldsForPlanType(planType),
        });

        try {
            return await this.productRepository.save(product);
        } catch (err) {
            const code = (err as { code?: string }).code;
            if (code === '23505') {
                throw new ConflictException('Ya existe un plan similar');
            }
            throw err;
        }
    }

    async findAll(query: QueryProductDto) {
        const {
            categoryId,
            search,
            onlyFeatured,
            minPrice,
            maxPrice,
            brand,
            planType,
            sortBy = 'displayOrder',
            sortOrder = 'ASC',
            page = 1,
            limit = 12,
        } = query;

        const qb = this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .where('product.isActive = :active', { active: true })
            // Solo planes publicados son visibles públicamente.
            .andWhere('product.status = :status', { status: 'PUBLISHED' });

        if (categoryId) {
            qb.andWhere('product.categoryId = :categoryId', { categoryId });
        }
        if (brand) {
            qb.andWhere('product.brand = :brand', { brand });
        }
        if (planType) {
            qb.andWhere('product.planType = :planType', { planType });
        }
        if (onlyFeatured) {
            qb.andWhere('product.isFeatured = true');
        }
        if (search) {
            qb.andWhere(
                '(product.name ILIKE :search OR product.description ILIKE :search)',
                { search: `%${search}%` },
            );
        }
        if (minPrice !== undefined) {
            qb.andWhere('product.price >= :minPrice', { minPrice });
        }
        if (maxPrice !== undefined) {
            qb.andWhere('product.price <= :maxPrice', { maxPrice });
        }

        // Whitelist de campos por los que podemos ordenar (seguridad)
        const sortableFields = ['displayOrder', 'createdAt', 'name', 'price'];
        const orderField = sortableFields.includes(sortBy) ? sortBy : 'displayOrder';
        const direction = sortOrder === 'DESC' ? 'DESC' : 'ASC';
        qb.orderBy(`product.${orderField}`, direction);
        // Desempate estable para que la paginación no repita planes.
        if (orderField !== 'createdAt') qb.addOrderBy('product.createdAt', 'DESC');
        qb.addOrderBy('product.id', 'ASC');

        qb.skip((page - 1) * limit).take(limit);

        const [items, total] = await qb.getManyAndCount();

        return {
            items,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /** Versión para el dashboard: incluye inactivos. Permite filtrar por brand. */
    async findAllAdmin(filters: { brand?: ProductBrand; planType?: PlanType } = {}) {
        const where: { brand?: ProductBrand; planType?: PlanType } = {};
        if (filters.brand) where.brand = filters.brand;
        if (filters.planType) where.planType = filters.planType;

        return this.productRepository.find({
            where,
            relations: ['category'],
            order: { displayOrder: 'ASC', createdAt: 'DESC' },
        });
    }

    /** Guarda el orden elegido en el panel (posición de cada plan). */
    async reorder(dto: ReorderDto): Promise<{ affected: number }> {
        const ids = dto.items.map((i) => i.id);
        if (new Set(ids).size !== ids.length) {
            throw new ConflictException('Hay planes repetidos en el orden');
        }
        const found = await this.productRepository.count({ where: { id: In(ids) } });
        if (found !== ids.length) {
            throw new NotFoundException('Uno o más planes del orden no existen');
        }
        await this.productRepository.manager.transaction(async (manager) => {
            for (const item of dto.items) {
                await manager.update(Product, item.id, { displayOrder: item.displayOrder });
            }
        });
        return { affected: ids.length };
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['category', 'images'],
            order: { images: { sortOrder: 'ASC' } },
        });
        if (!product) {
            throw new NotFoundException('Plan no encontrado');
        }
        return product;
    }

    async update(id: string, dto: UpdateProductDto): Promise<Product> {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException('Plan no encontrado');
        }
        if (dto.name && dto.name !== product.name) {
            product.slug = await this.generateUniqueSlug(dto.name, id);
        }
        Object.assign(product, dto);

        // Si cambió el tipo de plan, limpiar los campos numéricos no aplicables.
        if (dto.planType) {
            product.planType = dto.planType;
        }
        Object.assign(product, this.cleanFieldsForPlanType(product.planType));

        return this.productRepository.save(product);
    }

    /**
     * Devuelve los campos numéricos que no aplican al tipo de plan, puestos
     * a null. Evita guardar canales en planes de internet o velocidades en
     * planes de TV.
     */
    private cleanFieldsForPlanType(planType: PlanType): Partial<Product> {
        if (planType === PlanType.TV) {
            return { downloadSpeed: null, uploadSpeed: null };
        }
        return { channels: null, hdChannels: null };
    }

    async remove(id: string): Promise<void> {
        const result = await this.productRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('Plan no encontrado');
        }
    }

    async bulkUpdate(
        ids: string[],
        patch: Partial<Pick<Product, 'isActive' | 'isFeatured' | 'categoryId' | 'brand' | 'planType'>>,
    ): Promise<{ affected: number }> {
        if (ids.length === 0) return { affected: 0 };
        const result = await this.productRepository.update(
            { id: In(ids) },
            patch,
        );
        return { affected: result.affected ?? 0 };
    }

    async bulkRemove(ids: string[]): Promise<{ affected: number }> {
        if (ids.length === 0) return { affected: 0 };
        const result = await this.productRepository.delete({ id: In(ids) });
        return { affected: result.affected ?? 0 };
    }

    private async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
        const base = slugify(name);
        let slug = base;
        let counter = 1;
        while (true) {
            const existing = await this.productRepository.findOne({ where: { slug } });
            if (!existing || existing.id === excludeId) return slug;
            slug = `${base}-${counter++}`;
        }
    }
}
