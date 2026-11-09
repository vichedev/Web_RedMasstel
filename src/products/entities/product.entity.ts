import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { ProductImage } from './product-image.entity';

export enum ProductStatus {
    DRAFT = 'DRAFT',
    SCHEDULED = 'SCHEDULED',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
}

/**
 * Marca del proyecto. Con marca única, el único valor es REDMAASTEL.
 * La línea de servicio (internet / TV) la define `planType`, no la marca.
 */
export enum ProductBrand {
    REDMAASTEL = 'REDMAASTEL',
}

/**
 * Tipo de plan, distingue entre planes de internet y planes de TV.
 * Permite filtrar/renderizar campos específicos en el dashboard.
 */
export enum PlanType {
    INTERNET = 'INTERNET',
    TV = 'TV',
    COMBO = 'COMBO',
}

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    slug: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price: number;

    /** Caché de la imagen primaria de la galería (denormalizada para el storefront). */
    @Column()
    imageUrl: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    isFeatured: boolean;

    @Column({
        type: 'enum',
        enum: ProductStatus,
        default: ProductStatus.PUBLISHED,
    })
    status: ProductStatus;

    /** Si status = SCHEDULED, fecha en que pasa automáticamente a PUBLISHED. */
    @Column({ type: 'timestamp', nullable: true })
    scheduledAt: Date | null;

    // ───── Campos de marca / plan (Red MaasTel) ─────

    @Column({
        type: 'enum',
        enum: ProductBrand,
        default: ProductBrand.REDMAASTEL,
    })
    brand: ProductBrand;

    @Column({
        type: 'enum',
        enum: PlanType,
        default: PlanType.INTERNET,
    })
    planType: PlanType;

    /** Velocidad de bajada en Mbps (planes de internet). */
    @Column({ type: 'int', nullable: true })
    downloadSpeed: number | null;

    /** Velocidad de subida en Mbps (planes de internet). */
    @Column({ type: 'int', nullable: true })
    uploadSpeed: number | null;

    /** Cantidad total de canales (planes de TV). */
    @Column({ type: 'int', nullable: true })
    channels: number | null;

    /** Cantidad de canales en HD (planes de TV). */
    @Column({ type: 'int', nullable: true })
    hdChannels: number | null;

    /** Lista de features destacados ("Wi-Fi 6 incluido", "Decodificador 4K", etc.). */
    @Column({ type: 'text', array: true, default: () => "'{}'::text[]" })
    features: string[];

    /** Etiqueta opcional ("Más vendido", "Nuevo", "Promo"). */
    @Column({ type: 'varchar', length: 60, nullable: true })
    badge: string | null;

    @ManyToOne(() => Category, (category) => category.products, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'categoryId' })
    category: Category;

    @Column({ nullable: true })
    categoryId: string;

    @OneToMany(() => ProductImage, (image) => image.product, {
        cascade: ['insert', 'update'],
    })
    images: ProductImage[];

    /** Posición manual en la web (0 = primero). La define el admin. */
    @Column({ type: 'int', default: 0 })
    displayOrder: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
