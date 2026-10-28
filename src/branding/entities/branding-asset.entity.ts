import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

/**
 * Slots de identidad visual configurables desde el dashboard (marca única).
 *
 *  - NAVBAR_LOGO        → logo del navbar del sitio.
 *  - HERO_LOGO          → logo del hero del home.
 *  - FOOTER_LOGO_MAIN   → logo principal del bloque "marca" del footer.
 *
 * Si necesitas un slot nuevo en el futuro: añadir aquí + en
 * `BRANDING_DEFAULTS` del service. El controller acepta cualquier
 * valor del enum, así que el resto sigue solo.
 */
export enum BrandingSlot {
    NAVBAR_LOGO = 'NAVBAR_LOGO',
    HERO_LOGO = 'HERO_LOGO',
    FOOTER_LOGO_MAIN = 'FOOTER_LOGO_MAIN',
}

/**
 * Asset visual asignado a un slot. La columna `slot` es UNIQUE: hay
 * exactamente un asset por slot (lo cual permite usar `PATCH /branding/:slot`
 * de forma idempotente sin duplicar registros).
 */
@Entity('branding_assets')
export class BrandingAsset {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: BrandingSlot,
        unique: true,
    })
    slot: BrandingSlot;

    /** Nombre legible para el dashboard ("Logo del navbar"). */
    @Column({ type: 'varchar', length: 120 })
    label: string;

    /** URL del archivo (servida desde /static/...). Vacío => slot sin asset. */
    @Column({ type: 'varchar', length: 500, nullable: true })
    url: string | null;

    /** Texto alternativo de accesibilidad. */
    @Column({ type: 'varchar', length: 200, nullable: true })
    alt: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
