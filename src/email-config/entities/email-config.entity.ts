import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

/**
 * Configuración del servicio de emails (EmailJS).
 *
 * Es un singleton: existe a lo sumo UNA fila en la tabla. El service
 * la crea en bootstrap si no existe y siempre la opera en `update`.
 *
 * Las credenciales de EmailJS son públicas por diseño (el `publicKey`
 * se expone en el navegador), por eso el GET de este endpoint también
 * es público — el sitio público lo necesita para enviar el formulario
 * de contacto y la suscripción del newsletter.
 *
 * Para evitar abuso: restringir el dominio en el panel de EmailJS.
 */
@Entity('email_config')
export class EmailConfig {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /** EmailJS public key (`emailjs.init({ publicKey })`). */
    @Column({ type: 'varchar', length: 200, nullable: true })
    publicKey: string | null;

    /** ID del servicio de EmailJS (ej: "service_k7p7i7o"). */
    @Column({ type: 'varchar', length: 100, nullable: true })
    serviceId: string | null;

    /** Template para el formulario de contacto. */
    @Column({ type: 'varchar', length: 100, nullable: true })
    templateContact: string | null;

    /** Template para la suscripción al newsletter. */
    @Column({ type: 'varchar', length: 100, nullable: true })
    templateSubscribe: string | null;

    /** Email donde se reciben los avisos. */
    @Column({ type: 'varchar', length: 200, nullable: true })
    adminEmail: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
