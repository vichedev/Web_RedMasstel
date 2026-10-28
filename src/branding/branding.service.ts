import {
    Injectable,
    Logger,
    NotFoundException,
    OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandingAsset, BrandingSlot } from './entities/branding-asset.entity';
import { UpdateBrandingAssetDto } from './dto/update-branding-asset.dto';

/**
 * Metadatos por defecto de cada slot. Sirven para sembrar la BD la
 * primera vez y para que el dashboard muestre etiquetas legibles.
 */
const BRANDING_DEFAULTS: Record<
    BrandingSlot,
    { label: string; alt: string }
> = {
    [BrandingSlot.NAVBAR_LOGO]: {
        label: 'Logo del navbar',
        alt: 'Red MaasTel',
    },
    [BrandingSlot.HERO_LOGO]: {
        label: 'Logo del hero (home)',
        alt: 'Red MaasTel',
    },
    [BrandingSlot.FOOTER_LOGO_MAIN]: {
        label: 'Logo principal del footer',
        alt: 'Red MaasTel',
    },
};

@Injectable()
export class BrandingService implements OnApplicationBootstrap {
    private readonly logger = new Logger(BrandingService.name);

    constructor(
        @InjectRepository(BrandingAsset)
        private readonly assetRepository: Repository<BrandingAsset>,
    ) { }

    /** Garantiza que cada slot tenga su fila (con `url` vacía hasta que se cargue). */
    async onApplicationBootstrap(): Promise<void> {
        try {
            for (const slot of Object.values(BrandingSlot)) {
                const existing = await this.assetRepository.findOne({
                    where: { slot },
                });
                if (existing) continue;
                const defaults = BRANDING_DEFAULTS[slot];
                await this.assetRepository.save(
                    this.assetRepository.create({
                        slot,
                        label: defaults.label,
                        alt: defaults.alt,
                        url: null,
                    }),
                );
                this.logger.log(`Slot de branding inicializado: ${slot}`);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.error(`Error inicializando branding: ${message}`);
        }
    }

    findAll(): Promise<BrandingAsset[]> {
        return this.assetRepository.find({ order: { slot: 'ASC' } });
    }

    async findBySlot(slot: BrandingSlot): Promise<BrandingAsset> {
        const asset = await this.assetRepository.findOne({ where: { slot } });
        if (!asset) {
            throw new NotFoundException(`Slot de branding no existe: ${slot}`);
        }
        return asset;
    }

    async update(
        slot: BrandingSlot,
        dto: UpdateBrandingAssetDto,
    ): Promise<BrandingAsset> {
        const asset = await this.findBySlot(slot);
        if (dto.url !== undefined) {
            const trimmed = dto.url?.trim() ?? '';
            asset.url = trimmed ? trimmed : null;
        }
        if (dto.alt !== undefined) {
            const trimmed = dto.alt?.trim() ?? '';
            asset.alt = trimmed || BRANDING_DEFAULTS[slot].alt;
        }
        return this.assetRepository.save(asset);
    }
}
