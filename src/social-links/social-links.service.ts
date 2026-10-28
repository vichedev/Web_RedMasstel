import {
    Injectable,
    Logger,
    NotFoundException,
    OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { SocialLink, SocialPlatform } from './entities/social-link.entity';
import { ProductBrand } from '../products/entities/product.entity';
import { CreateSocialLinkDto } from './dto/create-social-link.dto';
import { UpdateSocialLinkDto } from './dto/update-social-link.dto';

/**
 * Orden por defecto al sembrar las plataformas. El admin puede
 * sobreescribirlo desde el dashboard en cualquier momento.
 */
const SOCIAL_DEFAULTS: Record<SocialPlatform, { sortOrder: number }> = {
    [SocialPlatform.FACEBOOK]: { sortOrder: 10 },
    [SocialPlatform.INSTAGRAM]: { sortOrder: 20 },
    [SocialPlatform.TIKTOK]: { sortOrder: 30 },
    [SocialPlatform.X]: { sortOrder: 40 },
    [SocialPlatform.YOUTUBE]: { sortOrder: 50 },
    [SocialPlatform.LINKEDIN]: { sortOrder: 60 },
};

/**
 * Plantilla "global" sembrada al arrancar (1 fila por plataforma con
 * `brand = null`). El admin puede después crear entradas adicionales
 * adicionales desde el dashboard.
 *
 * Toda la API CRUD pasa por id ahora — el `findByPlatform(platform)`
 * legacy ya no aplica porque puede haber múltiples filas con la misma
 * plataforma cuando difiere el `brand`.
 */
@Injectable()
export class SocialLinksService implements OnApplicationBootstrap {
    private readonly logger = new Logger(SocialLinksService.name);

    constructor(
        @InjectRepository(SocialLink)
        private readonly linkRepository: Repository<SocialLink>,
    ) { }

    /**
     * Garantiza que cada plataforma tenga al menos su fila global
     * (brand=null) la primera vez que arranca la app.
     */
    async onApplicationBootstrap(): Promise<void> {
        try {
            for (const platform of Object.values(SocialPlatform)) {
                const exists = await this.linkRepository.findOne({
                    where: { platform, brand: IsNull() },
                });
                if (exists) continue;
                await this.linkRepository.save(
                    this.linkRepository.create({
                        platform,
                        brand: null,
                        url: null,
                        username: null,
                        isActive: true,
                        sortOrder: SOCIAL_DEFAULTS[platform].sortOrder,
                    }),
                );
                this.logger.log(`Social link global inicializado: ${platform}`);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.error(`Error inicializando social links: ${message}`);
        }
    }

    /**
     * Listado completo (admin). Si se pasa `brand` filtra al microsite +
     * incluye los globales (brand=null) para que el admin sepa qué hereda.
     */
    findAll(brand?: ProductBrand): Promise<SocialLink[]> {
        return this.linkRepository.find({
            where: brand ? [{ brand }, { brand: IsNull() }] : undefined,
            order: { sortOrder: 'ASC', platform: 'ASC' },
        });
    }

    /**
     * Para el sitio público de un microsite: sólo plataformas activas
     * con URL configurada, filtradas a ese microsite + globales.
     */
    findPublic(brand?: ProductBrand): Promise<SocialLink[]> {
        const qb = this.linkRepository
            .createQueryBuilder('s')
            .where('s.isActive = :active', { active: true })
            .andWhere('s.url IS NOT NULL')
            .andWhere("s.url <> ''");
        if (brand) {
            qb.andWhere('(s.brand = :brand OR s.brand IS NULL)', { brand });
        }
        qb.orderBy('s.sortOrder', 'ASC').addOrderBy('s.platform', 'ASC');
        return qb.getMany();
    }

    async findOne(id: string): Promise<SocialLink> {
        const link = await this.linkRepository.findOne({ where: { id } });
        if (!link) {
            throw new NotFoundException(`Red social no encontrada: ${id}`);
        }
        return link;
    }

    async create(dto: CreateSocialLinkDto): Promise<SocialLink> {
        const sortOrder =
            dto.sortOrder ?? SOCIAL_DEFAULTS[dto.platform]?.sortOrder ?? 100;
        const link = this.linkRepository.create({
            platform: dto.platform,
            brand: dto.brand ?? null,
            url: dto.url?.trim() || null,
            username: dto.username?.trim() || null,
            isActive: dto.isActive ?? true,
            sortOrder,
        });
        return this.linkRepository.save(link);
    }

    async update(id: string, dto: UpdateSocialLinkDto): Promise<SocialLink> {
        const link = await this.findOne(id);
        if (dto.url !== undefined) {
            const trimmed = dto.url?.trim() ?? '';
            link.url = trimmed || null;
        }
        if (dto.username !== undefined) {
            const trimmed = dto.username?.trim() ?? '';
            link.username = trimmed || null;
        }
        if (dto.isActive !== undefined) link.isActive = dto.isActive;
        if (dto.sortOrder !== undefined) link.sortOrder = dto.sortOrder;
        if (dto.brand !== undefined) link.brand = dto.brand ?? null;
        return this.linkRepository.save(link);
    }

    async remove(id: string): Promise<void> {
        const result = await this.linkRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Red social no encontrada: ${id}`);
        }
    }
}
