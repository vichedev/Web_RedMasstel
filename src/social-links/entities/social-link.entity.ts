import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ProductBrand } from '../../products/entities/product.entity';

/**
 * Plataformas de redes sociales soportadas. La columna `platform` es
 * UNIQUE: existe exactamente una fila por plataforma. El admin sólo
 * configura la URL — la identidad visual (icono, color de marca) está
 * fijada en el frontend.
 *
 * Si en el futuro hace falta una plataforma nueva: añadir aquí + en
 * `SOCIAL_DEFAULTS` del service y, opcionalmente, mapear el icono en
 * el frontend.
 */
export enum SocialPlatform {
    FACEBOOK = 'FACEBOOK',
    INSTAGRAM = 'INSTAGRAM',
    TIKTOK = 'TIKTOK',
    X = 'X',
    YOUTUBE = 'YOUTUBE',
    LINKEDIN = 'LINKEDIN',
}

@Entity('social_links')
export class SocialLink {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: SocialPlatform,
    })
    platform: SocialPlatform;

    /**
     * Microsite al que pertenece esta red social. `null` = perfil
     * compartido (mostrado en los 3 microsites). Postgres permite
     * múltiples filas con la misma `platform` cuando el `brand`
     * difiere, así que cada microsite puede tener su propio Facebook
     * sin que choque con el de los demás.
     */
    @Column({
        type: 'enum',
        enum: ProductBrand,
        nullable: true,
    })
    brand: ProductBrand | null;

    /** URL completa al perfil. Vacío => plataforma sin configurar. */
    @Column({ type: 'varchar', length: 500, nullable: true })
    url: string | null;

    /** Username/handle visible (@redmaastel, etc.) — opcional. */
    @Column({ type: 'varchar', length: 120, nullable: true })
    username: string | null;

    /** Si está apagado no se muestra en el footer aunque tenga URL. */
    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'int', default: 0 })
    sortOrder: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
