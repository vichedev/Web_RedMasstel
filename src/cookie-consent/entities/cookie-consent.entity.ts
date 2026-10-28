import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum CookieDecision {
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
}

/**
 * Decisión de un visitante sobre el aviso de cookies.
 * Una fila por navegador (visitorId aleatorio guardado en su localStorage):
 * si cambia de opinión, se actualiza la misma fila.
 */
@Entity('cookie_consents')
export class CookieConsent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /** Identificador anónimo generado en el navegador (UUID v4). */
    @Index('IDX_cookie_consents_visitorId', { unique: true })
    @Column({ type: 'uuid' })
    visitorId: string;

    @Column({
        type: 'enum',
        enum: CookieDecision,
        enumName: 'cookie_decision_enum',
    })
    decision: CookieDecision;

    /** Navegador / dispositivo (recortado). No se guarda la IP. */
    @Column({ type: 'varchar', length: 255, nullable: true })
    userAgent: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @Index('IDX_cookie_consents_updatedAt')
    @UpdateDateColumn()
    updatedAt: Date;
}
