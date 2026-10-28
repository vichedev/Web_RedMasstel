import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Fase 4: cada microsite tiene sus propios documentos, promociones,
 * publicidad, redes sociales y enlaces externos.
 *
 * Para soportarlo añadimos una columna `brand` (nullable) a las cinco
 * tablas. `null` = recurso global, visible en los 3 microsites; un
 * valor concreto (`CAFANET`, `SMART360`, `TV_CAFA`) limita la
 * visibilidad pública a ese microsite.
 *
 * Cada tabla obtiene su propio enum `*_brand_enum` con los mismos
 * valores que `products_brand_enum`, manteniendo la convención de
 * naming de TypeORM (`<table>_<column>_enum`) que ya usan otras
 * columnas en este proyecto.
 *
 * También dropea el constraint UNIQUE sobre `social_links.platform`
 * para permitir que cada microsite tenga su propio Facebook /
 * Instagram / etc. Sin esto, ya no podríamos crear más de una fila
 * por plataforma aunque el código del service lo necesite.
 */
export class AddBrandToResources1778300000000 implements MigrationInterface {
    name = 'AddBrandToResources1778300000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ── documents ────────────────────────────────────────────────
        await queryRunner.query(`
            CREATE TYPE "documents_brand_enum" AS ENUM (
                'CAFANET','SMART360','TV_CAFA'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "documents" ADD COLUMN "brand" "documents_brand_enum"
        `);

        // ── advertisements ───────────────────────────────────────────
        await queryRunner.query(`
            CREATE TYPE "advertisements_brand_enum" AS ENUM (
                'CAFANET','SMART360','TV_CAFA'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "advertisements" ADD COLUMN "brand" "advertisements_brand_enum"
        `);

        // ── promotions ───────────────────────────────────────────────
        await queryRunner.query(`
            CREATE TYPE "promotions_brand_enum" AS ENUM (
                'CAFANET','SMART360','TV_CAFA'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "promotions" ADD COLUMN "brand" "promotions_brand_enum"
        `);

        // ── external_links ───────────────────────────────────────────
        await queryRunner.query(`
            CREATE TYPE "external_links_brand_enum" AS ENUM (
                'CAFANET','SMART360','TV_CAFA'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "external_links" ADD COLUMN "brand" "external_links_brand_enum"
        `);

        // ── social_links ─────────────────────────────────────────────
        // 1) drop del UNIQUE viejo: ya no aplica porque ahora puede
        //    haber varias filas con la misma plataforma cuando difiere
        //    el `brand`.
        await queryRunner.query(`
            ALTER TABLE "social_links" DROP CONSTRAINT IF EXISTS "UQ_social_links_platform"
        `);

        // 2) columna brand (mismo patrón que las otras 4 tablas).
        await queryRunner.query(`
            CREATE TYPE "social_links_brand_enum" AS ENUM (
                'CAFANET','SMART360','TV_CAFA'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "social_links" ADD COLUMN "brand" "social_links_brand_enum"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // social_links
        await queryRunner.query(
            `ALTER TABLE "social_links" DROP COLUMN IF EXISTS "brand"`,
        );
        await queryRunner.query(`DROP TYPE IF EXISTS "social_links_brand_enum"`);
        await queryRunner.query(`
            ALTER TABLE "social_links"
            ADD CONSTRAINT "UQ_social_links_platform" UNIQUE ("platform")
        `);

        // external_links
        await queryRunner.query(
            `ALTER TABLE "external_links" DROP COLUMN IF EXISTS "brand"`,
        );
        await queryRunner.query(`DROP TYPE IF EXISTS "external_links_brand_enum"`);

        // promotions
        await queryRunner.query(
            `ALTER TABLE "promotions" DROP COLUMN IF EXISTS "brand"`,
        );
        await queryRunner.query(`DROP TYPE IF EXISTS "promotions_brand_enum"`);

        // advertisements
        await queryRunner.query(
            `ALTER TABLE "advertisements" DROP COLUMN IF EXISTS "brand"`,
        );
        await queryRunner.query(`DROP TYPE IF EXISTS "advertisements_brand_enum"`);

        // documents
        await queryRunner.query(
            `ALTER TABLE "documents" DROP COLUMN IF EXISTS "brand"`,
        );
        await queryRunner.query(`DROP TYPE IF EXISTS "documents_brand_enum"`);
    }
}
