import { Injectable, Logger, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch, BranchScheduleItem } from './entities/branch.entity';
import { ProductBrand } from '../products/entities/product.entity';
import { UpdateBranchDto } from './dto/update-branch.dto';

/**
 * Catálogo de marcas. Con marca única, al arrancar la app nos aseguramos
 * de que exista la sucursal de Red MaasTel; los teléfonos quedan en
 * blanco hasta que el admin los configure desde el dashboard.
 */
const DEFAULT_SCHEDULE: BranchScheduleItem[] = [
    { label: 'Lunes a Viernes', hours: '8:00 — 18:00', days: [1, 2, 3, 4, 5] },
    { label: 'Sábado', hours: '8:30 — 12:30', days: [6] },
    { label: 'Domingo', hours: 'Cerrado', days: [0], closed: true },
];

const BRAND_DEFAULTS: Record<
    ProductBrand,
    { name: string; email: string; emailHint: string }
> = {
    [ProductBrand.REDMAASTEL]: {
        name: 'Red MaasTel',
        email: 'ventas@redmaastel.ec',
        emailHint: 'Respuesta en <24h',
    },
};

@Injectable()
export class BranchesService implements OnApplicationBootstrap {
    private readonly logger = new Logger(BranchesService.name);

    constructor(
        @InjectRepository(Branch)
        private readonly branchRepository: Repository<Branch>,
    ) { }

    /**
     * Garantiza que cada marca tenga su sucursal. No sobreescribe datos
     * existentes — solo crea la fila si falta.
     */
    async onApplicationBootstrap(): Promise<void> {
        try {
            for (const brand of Object.values(ProductBrand)) {
                const existing = await this.branchRepository.findOne({
                    where: { brand },
                });
                if (existing) continue;
                await this.branchRepository.save(
                    this.branchRepository.create({
                        brand,
                        name: BRAND_DEFAULTS[brand].name,
                        phone: null,
                        whatsappPhone: null,
                        address: null,
                        email: BRAND_DEFAULTS[brand].email,
                        emailHint: BRAND_DEFAULTS[brand].emailHint,
                        schedule: DEFAULT_SCHEDULE,
                        isActive: true,
                    }),
                );
                this.logger.log(`Sucursal por defecto creada para marca ${brand}`);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.error(`Error inicializando sucursales: ${message}`);
        }
    }

    findAll(onlyActive = false): Promise<Branch[]> {
        return this.branchRepository.find({
            where: onlyActive ? { isActive: true } : {},
            order: { brand: 'ASC' },
        });
    }

    async findByBrand(brand: ProductBrand): Promise<Branch> {
        const branch = await this.branchRepository.findOne({ where: { brand } });
        if (!branch) {
            throw new NotFoundException(`No existe sucursal para la marca ${brand}`);
        }
        return branch;
    }

    async update(brand: ProductBrand, dto: UpdateBranchDto): Promise<Branch> {
        const branch = await this.findByBrand(brand);

        // Normalizamos los teléfonos: dejamos solo dígitos y el "+" inicial.
        // Aceptamos cadena vacía o null para "limpiar" el campo.
        const patch: Partial<Branch> = {};
        if (dto.name !== undefined) patch.name = dto.name.trim();
        if (dto.phone !== undefined) patch.phone = sanitizePhone(dto.phone);
        if (dto.whatsappPhone !== undefined) {
            patch.whatsappPhone = sanitizePhone(dto.whatsappPhone);
        }
        if (dto.address !== undefined) {
            patch.address = dto.address?.trim() || null;
        }
        if (dto.email !== undefined) {
            patch.email = dto.email?.trim().toLowerCase() || null;
        }
        if (dto.emailHint !== undefined) {
            patch.emailHint = dto.emailHint?.trim() || null;
        }
        if (dto.schedule !== undefined) {
            patch.schedule = dto.schedule
                ? dto.schedule.map((s) => ({
                      label: s.label.trim(),
                      hours: s.hours.trim(),
                      days: [...new Set(s.days)].sort((a, b) => a - b),
                      ...(s.closed ? { closed: true } : {}),
                  }))
                : null;
        }
        if (dto.isActive !== undefined) patch.isActive = dto.isActive;

        Object.assign(branch, patch);
        return this.branchRepository.save(branch);
    }
}

/**
 * Acepta `+593 99 123 4567` o `0991234567` y devuelve algo parseable
 * por wa.me. Si el usuario manda cadena vacía, devolvemos null para
 * que el frontend pueda detectar "no configurado".
 */
function sanitizePhone(value: string | null | undefined): string | null {
    if (value === null || value === undefined) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    // Conservamos un único "+" inicial si lo trae; el resto quedan dígitos.
    const hasPlus = trimmed.startsWith('+');
    const digits = trimmed.replace(/\D+/g, '');
    if (!digits) return null;
    return hasPlus ? `+${digits}` : digits;
}
