import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ProductBrand } from '../../products/entities/product.entity';

/** Fila del horario de atención que se muestra en la web pública. */
export interface BranchScheduleItem {
    /** Texto visible, ej. "Lunes a Viernes". */
    label: string;
    /** Texto visible, ej. "8:00 — 18:00". */
    hours: string;
    /** Días que cubre (0 = domingo … 6 = sábado), para resaltar "Hoy". */
    days: number[];
    /** Si es true se muestra en rojo (ej. "Cerrado"). */
    closed?: boolean;
}

/**
 * Sucursal de Red MaasTel. Almacena el número de WhatsApp que recibirá el
 * contacto cuando un cliente pulsa "Quiero este plan".
 *
 * Hay exactamente una sucursal por marca: la columna `brand` es UNIQUE.
 */
@Entity('branches')
export class Branch {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /** Marca a la que representa esta sucursal. Una por marca. */
    @Column({
        type: 'enum',
        enum: ProductBrand,
        unique: true,
    })
    brand: ProductBrand;

    /** Nombre visible de la sucursal (ej. "Red MaasTel — Sucursal Loja"). */
    @Column({ type: 'varchar', length: 120 })
    name: string;

    /** Teléfono fijo o móvil de contacto (texto libre, opcional). */
    @Column({ type: 'varchar', length: 30, nullable: true })
    phone: string | null;

    /** Número que recibirá los mensajes de WhatsApp (formato libre, se normaliza). */
    @Column({ type: 'varchar', length: 30, nullable: true })
    whatsappPhone: string | null;

    /** Dirección física (opcional). */
    @Column({ type: 'varchar', length: 255, nullable: true })
    address: string | null;

    /** Correo de contacto público (tarjeta "Escríbenos" y footer). */
    @Column({ type: 'varchar', length: 120, nullable: true })
    email: string | null;

    /** Texto bajo el correo, ej. "Respuesta en <24h". */
    @Column({ type: 'varchar', length: 80, nullable: true })
    emailHint: string | null;

    /** Horario de atención. null = usar el horario por defecto de la web. */
    @Column({ type: 'jsonb', nullable: true })
    schedule: BranchScheduleItem[] | null;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
