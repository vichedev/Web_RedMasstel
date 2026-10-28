import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ProductBrand } from '../../products/entities/product.entity';

/**
 * Tipo de enlace externo. Permite al frontend escoger un icono
 * representativo (ARCOTEL, MINTEL, Speedtest…) o un genérico.
 */
export enum ExternalLinkKind {
    ARCOTEL = 'ARCOTEL',
    MINTEL = 'MINTEL',
    SPEEDTEST = 'SPEEDTEST',
    GOVERNMENT = 'GOVERNMENT', // otros enlaces gubernamentales
    TOOL = 'TOOL',             // herramientas online
    SOCIAL = 'SOCIAL',         // redes sociales
    GENERIC = 'GENERIC',       // por defecto
}

/**
 * Enlace externo administrable: redirecciones a sitios fuera de Red MaasTel
 * (ARCOTEL, MINTEL, Speedtest, etc.). Aparecen en el footer cuando el
 * admin marca `showInFooter`.
 */
@Entity('external_links')
export class ExternalLink {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /** Etiqueta visible al usuario. */
    @Column({ type: 'varchar', length: 120 })
    label: string;

    /** Descripción opcional ("Test de velocidad oficial", etc.). */
    @Column({ type: 'varchar', length: 300, nullable: true })
    description: string | null;

    /** URL externa. Validada como URL desde el DTO. */
    @Column({ type: 'varchar', length: 500 })
    url: string;

    @Column({
        type: 'enum',
        enum: ExternalLinkKind,
        default: ExternalLinkKind.GENERIC,
    })
    kind: ExternalLinkKind;

    /**
     * Microsite al que pertenece el enlace. `null` = aparece en los
     * 3 microsites; valor concreto = sólo en ese microsite.
     */
    @Column({
        type: 'enum',
        enum: ProductBrand,
        nullable: true,
    })
    brand: ProductBrand | null;

    @Column({ default: true })
    isActive: boolean;

    /** Si el admin lo marca, este enlace se lista en el footer. */
    @Column({ default: true })
    showInFooter: boolean;

    @Column({ type: 'int', default: 0 })
    sortOrder: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
