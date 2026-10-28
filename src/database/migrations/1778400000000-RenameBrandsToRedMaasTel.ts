import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Rebrand a marca única **Red MaasTel**.
 *
 * El proyecto pasó de 3 marcas (Cafanet, Smart360, TV Cafa) a una sola
 * marca Red MaasTel. Esta migración consolida la base de datos:
 *
 *  1. En los 7 enums `*_brand_enum`, renombra el valor `CAFANET` →
 *     `REDMAASTEL` (Postgres `ALTER TYPE ... RENAME VALUE`, idempotente y
 *     sin recrear el tipo).
 *  2. Migra las filas que aún apuntaban a `SMART360` / `TV_CAFA` hacia
 *     `REDMAASTEL` en products, documents, advertisements, promotions,
 *     external_links y social_links.
 *  3. En `branches` (donde `brand` es UNIQUE) NO se puede fusionar: se
 *     conserva la sucursal de la antigua Cafanet (ahora Red MaasTel) y se
 *     borran las de Smart360 y TV Cafa.
 *  4. Colapsa los slots de `branding_assets` por marca a los 3 slots base
 *     (NAVBAR_LOGO, HERO_LOGO, FOOTER_LOGO_MAIN), preservando el logo de
 *     Cafanet si el slot base estaba vacío.
 *
 * Nota: los labels huérfanos `SMART360` / `TV_CAFA` quedan en los enums
 * (Postgres no permite borrar valores de un enum sin recrearlo), pero ya
 * no los usa ninguna fila ni el código.
 */
export class RenameBrandsToRedMaasTel1778400000000
    implements MigrationInterface
{
    name = 'RenameBrandsToRedMaasTel1778400000000';

    private readonly brandEnums = [
        'products_brand_enum',
        'branches_brand_enum',
        'documents_brand_enum',
        'advertisements_brand_enum',
        'promotions_brand_enum',
        'external_links_brand_enum',
        'social_links_brand_enum',
    ];

    // Tablas donde `brand` NO es único → se pueden fusionar filas.
    private readonly mergeTables = [
        'products',
        'documents',
        'advertisements',
        'promotions',
        'external_links',
        'social_links',
    ];

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1) Renombrar CAFANET → REDMAASTEL en cada enum de marca.
        for (const enumName of this.brandEnums) {
            await queryRunner.query(
                `ALTER TYPE "${enumName}" RENAME VALUE 'CAFANET' TO 'REDMAASTEL'`,
            );
        }

        // 2) Fusionar Smart360 / TV Cafa → Red MaasTel en las tablas no únicas.
        for (const table of this.mergeTables) {
            await queryRunner.query(`
                UPDATE "${table}"
                   SET "brand" = 'REDMAASTEL'
                 WHERE "brand" IN ('SMART360', 'TV_CAFA')
            `);
        }

        // 3) Branches: brand es UNIQUE → conservar Red MaasTel, borrar el resto.
        await queryRunner.query(`
            DELETE FROM "branches" WHERE "brand" IN ('SMART360', 'TV_CAFA')
        `);
        await queryRunner.query(`
            UPDATE "branches"
               SET "name" = 'Red MaasTel'
             WHERE "brand" = 'REDMAASTEL' AND "name" IN ('Cafanet', 'SmartNet', 'Smart360', 'TV Cafa')
        `);

        // 4) Branding: preservar el logo de Cafanet en los slots base si
        //    estaban vacíos, luego borrar los slots por marca.
        await queryRunner.query(`
            UPDATE "branding_assets" base
               SET "url" = src."url", "alt" = COALESCE(base."alt", src."alt")
              FROM "branding_assets" src
             WHERE base."slot" = 'NAVBAR_LOGO'
               AND src."slot" = 'NAVBAR_LOGO_CAFANET'
               AND base."url" IS NULL AND src."url" IS NOT NULL
        `);
        await queryRunner.query(`
            UPDATE "branding_assets" base
               SET "url" = src."url", "alt" = COALESCE(base."alt", src."alt")
              FROM "branding_assets" src
             WHERE base."slot" = 'HERO_LOGO'
               AND src."slot" = 'HERO_LOGO_CAFANET'
               AND base."url" IS NULL AND src."url" IS NOT NULL
        `);
        await queryRunner.query(`
            UPDATE "branding_assets" base
               SET "url" = src."url", "alt" = COALESCE(base."alt", src."alt")
              FROM "branding_assets" src
             WHERE base."slot" = 'FOOTER_LOGO_MAIN'
               AND src."slot" = 'FOOTER_LOGO_CAFANET'
               AND base."url" IS NULL AND src."url" IS NOT NULL
        `);

        // Borrar las filas de los slots por marca (ya no existen en el enum TS).
        await queryRunner.query(`
            DELETE FROM "branding_assets" WHERE "slot" IN (
                'NAVBAR_LOGO_CAFANET', 'NAVBAR_LOGO_SMART360', 'NAVBAR_LOGO_TVCAFA',
                'HERO_LOGO_CAFANET',   'HERO_LOGO_SMART360',   'HERO_LOGO_TVCAFA',
                'FOOTER_LOGO_CAFANET', 'FOOTER_LOGO_SMART360', 'FOOTER_LOGO_TVCAFA'
            )
        `);

        // Actualizar labels/alt de los 3 slots base a la nueva marca.
        await queryRunner.query(`
            UPDATE "branding_assets" SET "label" = 'Logo del navbar', "alt" = 'Red MaasTel'
             WHERE "slot" = 'NAVBAR_LOGO'
        `);
        await queryRunner.query(`
            UPDATE "branding_assets" SET "label" = 'Logo del hero (home)', "alt" = 'Red MaasTel'
             WHERE "slot" = 'HERO_LOGO'
        `);
        await queryRunner.query(`
            UPDATE "branding_assets" SET "label" = 'Logo principal del footer', "alt" = 'Red MaasTel'
             WHERE "slot" = 'FOOTER_LOGO_MAIN'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reversión parcial: se restauran los nombres de los enums, pero las
        // filas fusionadas (Smart360 / TV Cafa) y las sucursales borradas no
        // se pueden reconstruir — quedan como Red MaasTel / Cafanet.
        for (const enumName of this.brandEnums) {
            await queryRunner.query(
                `ALTER TYPE "${enumName}" RENAME VALUE 'REDMAASTEL' TO 'CAFANET'`,
            );
        }

        await queryRunner.query(`
            UPDATE "branches"
               SET "name" = 'Cafanet'
             WHERE "brand" = 'CAFANET' AND "name" = 'Red MaasTel'
        `);

        await queryRunner.query(`
            UPDATE "branding_assets" SET "label" = 'Logo del navbar (genérico, fallback)', "alt" = 'Cafanet'
             WHERE "slot" = 'NAVBAR_LOGO'
        `);
        await queryRunner.query(`
            UPDATE "branding_assets" SET "label" = 'Logo del hero (campaña / banner)', "alt" = 'Cafanet'
             WHERE "slot" = 'HERO_LOGO'
        `);
        await queryRunner.query(`
            UPDATE "branding_assets" SET "label" = 'Logo principal del footer', "alt" = 'Cafanet'
             WHERE "slot" = 'FOOTER_LOGO_MAIN'
        `);
    }
}
