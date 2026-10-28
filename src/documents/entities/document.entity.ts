import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ProductBrand } from '../../products/entities/product.entity';

/**
 * Categoría del documento. Sirve para agruparlos en la página pública.
 * Si el catálogo de categorías cambia mucho, se puede migrar a una
 * tabla aparte; por ahora un enum cubre los tipos típicos de un ISP.
 */
export enum DocumentCategory {
    LEGAL = 'LEGAL',         // términos, políticas, privacidad
    TARIFFS = 'TARIFFS',     // tarifarios, planes
    REGULATORY = 'REGULATORY', // normativa ARCOTEL, MINTEL
    CONTRACT = 'CONTRACT',   // modelos de contrato
    OTHER = 'OTHER',         // otros
}

@Entity('documents')
export class Document {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /** Título visible al usuario. */
    @Column({ type: 'varchar', length: 200 })
    title: string;

    /** Descripción corta opcional (subtítulo, fecha de vigencia, etc.). */
    @Column({ type: 'varchar', length: 500, nullable: true })
    description: string | null;

    /** URL del archivo subido (ej: "/static/<uuid>.pdf"). */
    @Column({ type: 'varchar', length: 500 })
    fileUrl: string;

    /** Nombre original del archivo, útil al ofrecer "Descargar". */
    @Column({ type: 'varchar', length: 255, nullable: true })
    originalName: string | null;

    /** Tamaño del archivo en bytes (para mostrar "1.2 MB"). */
    @Column({ type: 'bigint', nullable: true })
    fileSize: number | null;

    @Column({
        type: 'enum',
        enum: DocumentCategory,
        default: DocumentCategory.LEGAL,
    })
    category: DocumentCategory;

    /**
     * Microsite al que pertenece el documento. `null` significa
     * "global" (visible en los 3 microsites). Cualquier otro valor
     * limita la visibilidad pública al microsite correspondiente.
     */
    @Column({
        type: 'enum',
        enum: ProductBrand,
        nullable: true,
    })
    brand: ProductBrand | null;

    /** Si está inactivo, no aparece ni en la página pública ni en el footer. */
    @Column({ default: true })
    isActive: boolean;

    /** Si el admin lo marca, este documento se lista en el footer. */
    @Column({ default: false })
    showInFooter: boolean;

    /** Orden de presentación dentro de su categoría. */
    @Column({ type: 'int', default: 0 })
    sortOrder: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
