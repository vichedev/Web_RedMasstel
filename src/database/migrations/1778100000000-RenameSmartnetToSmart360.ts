import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Renombra la marca "SmartNet" a "Smart360" en toda la base de datos.
 *
 * Postgres permite `ALTER TYPE ... RENAME VALUE` desde 10+, lo cual es
 * idempotente y no requiere recrear los enums ni mover filas: las columnas
 * `products.brand`, `branches.brand` y `branding_assets.slot` apuntan a los
 * mismos valores con el nuevo nombre tras el rename.
 *
 * Cambios:
 *  - products_brand_enum:   SMARTNET                  → SMART360
 *  - branches_brand_enum:   SMARTNET                  → SMART360
 *  - branding_slot_enum:    HERO_LOGO_SMARTNET        → HERO_LOGO_SMART360
 *                           FOOTER_LOGO_SMARTNET      → FOOTER_LOGO_SMART360
 *  - branches:              name 'SmartNet' → 'Smart360' (sembrados por
 *                           1777500000000-CreateBranches)
 *  - branding_assets:       label/alt con la nueva nomenclatura
 */
export class RenameSmartnetToSmart3601778100000000
    implements MigrationInterface
{
    name = 'RenameSmartnetToSmart3601778100000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ── Enums ────────────────────────────────────────────────────────
        await queryRunner.query(
            `ALTER TYPE "products_brand_enum" RENAME VALUE 'SMARTNET' TO 'SMART360'`,
        );
        await queryRunner.query(
            `ALTER TYPE "branches_brand_enum" RENAME VALUE 'SMARTNET' TO 'SMART360'`,
        );
        await queryRunner.query(
            `ALTER TYPE "branding_slot_enum" RENAME VALUE 'HERO_LOGO_SMARTNET' TO 'HERO_LOGO_SMART360'`,
        );
        await queryRunner.query(
            `ALTER TYPE "branding_slot_enum" RENAME VALUE 'FOOTER_LOGO_SMARTNET' TO 'FOOTER_LOGO_SMART360'`,
        );

        // ── Datos sembrados ──────────────────────────────────────────────
        // Sólo actualizamos las filas que aún tengan el nombre antiguo,
        // por si alguien ya las renombró manualmente desde el dashboard.
        await queryRunner.query(`
            UPDATE "branches"
               SET "name" = 'Smart360'
             WHERE "brand" = 'SMART360' AND "name" = 'SmartNet'
        `);

        await queryRunner.query(`
            UPDATE "branding_assets"
               SET "label" = 'Logo Smart360 (hero · marcas)',
                   "alt"   = 'Smart360'
             WHERE "slot" = 'HERO_LOGO_SMART360'
        `);
        await queryRunner.query(`
            UPDATE "branding_assets"
               SET "label" = 'Logo Smart360 (footer · marcas)',
                   "alt"   = 'Smart360'
             WHERE "slot" = 'FOOTER_LOGO_SMART360'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE "branding_assets"
               SET "label" = 'Logo SmartNet (footer · marcas)',
                   "alt"   = 'SmartNet'
             WHERE "slot" = 'FOOTER_LOGO_SMART360'
        `);
        await queryRunner.query(`
            UPDATE "branding_assets"
               SET "label" = 'Logo SmartNet (hero · marcas)',
                   "alt"   = 'SmartNet'
             WHERE "slot" = 'HERO_LOGO_SMART360'
        `);
        await queryRunner.query(`
            UPDATE "branches"
               SET "name" = 'SmartNet'
             WHERE "brand" = 'SMART360' AND "name" = 'Smart360'
        `);

        await queryRunner.query(
            `ALTER TYPE "branding_slot_enum" RENAME VALUE 'FOOTER_LOGO_SMART360' TO 'FOOTER_LOGO_SMARTNET'`,
        );
        await queryRunner.query(
            `ALTER TYPE "branding_slot_enum" RENAME VALUE 'HERO_LOGO_SMART360' TO 'HERO_LOGO_SMARTNET'`,
        );
        await queryRunner.query(
            `ALTER TYPE "branches_brand_enum" RENAME VALUE 'SMART360' TO 'SMARTNET'`,
        );
        await queryRunner.query(
            `ALTER TYPE "products_brand_enum" RENAME VALUE 'SMART360' TO 'SMARTNET'`,
        );
    }
}
