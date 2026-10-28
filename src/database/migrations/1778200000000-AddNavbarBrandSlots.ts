import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Fase 2 (microsites independientes): añade tres nuevos valores al
 * enum `branding_slot_enum` para que cada microsite pueda subir su
 * propio logo de navbar desde el panel admin.
 *
 *   • NAVBAR_LOGO_CAFANET   → /cafanet
 *   • NAVBAR_LOGO_SMART360  → /smart360
 *   • NAVBAR_LOGO_TVCAFA    → /tv-cafa
 *
 * Las filas en `branding_assets` se inicializan solas en el bootstrap
 * del `BrandingService` la primera vez que arranca la app después de
 * aplicar esta migración.
 *
 * `transaction = false` porque Postgres no permite usar un valor de
 * enum recién añadido vía `ALTER TYPE ... ADD VALUE` dentro de la
 * misma transacción donde se añade.
 */
export class AddNavbarBrandSlots1778200000000 implements MigrationInterface {
    name = 'AddNavbarBrandSlots1778200000000';
    public transaction = false as const;

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TYPE "branding_slot_enum" ADD VALUE IF NOT EXISTS 'NAVBAR_LOGO_CAFANET'`,
        );
        await queryRunner.query(
            `ALTER TYPE "branding_slot_enum" ADD VALUE IF NOT EXISTS 'NAVBAR_LOGO_SMART360'`,
        );
        await queryRunner.query(
            `ALTER TYPE "branding_slot_enum" ADD VALUE IF NOT EXISTS 'NAVBAR_LOGO_TVCAFA'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Postgres no permite eliminar valores de un enum directamente.
        // Solo limpiamos las filas asociadas para mantener el down idempotente.
        await queryRunner.query(`
            DELETE FROM "branding_assets" WHERE "slot" IN (
                'NAVBAR_LOGO_CAFANET',
                'NAVBAR_LOGO_SMART360',
                'NAVBAR_LOGO_TVCAFA'
            )
        `);
    }
}
