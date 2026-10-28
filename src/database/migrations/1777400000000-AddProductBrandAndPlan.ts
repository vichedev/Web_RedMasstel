import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Añade los campos de marca/plan a la tabla `products` para soportar
 * Cafanet (internet), SmartNet (redes empresariales) y TV Cafa (televisión).
 */
export class AddProductBrandAndPlan1777400000000 implements MigrationInterface {
    name = 'AddProductBrandAndPlan1777400000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "products_brand_enum" AS ENUM ('CAFANET','SMARTNET','TV_CAFA')
        `);
        await queryRunner.query(`
            CREATE TYPE "products_plantype_enum" AS ENUM ('INTERNET','TV','COMBO')
        `);

        await queryRunner.query(`
            ALTER TABLE "products"
            ADD COLUMN "brand" "products_brand_enum" NOT NULL DEFAULT 'CAFANET',
            ADD COLUMN "planType" "products_plantype_enum" NOT NULL DEFAULT 'INTERNET',
            ADD COLUMN "downloadSpeed" int NULL,
            ADD COLUMN "uploadSpeed" int NULL,
            ADD COLUMN "channels" int NULL,
            ADD COLUMN "hdChannels" int NULL,
            ADD COLUMN "features" text[] NOT NULL DEFAULT '{}'::text[],
            ADD COLUMN "badge" varchar(60) NULL
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_products_brand" ON "products" ("brand")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_products_planType" ON "products" ("planType")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_planType"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_brand"`);

        await queryRunner.query(`
            ALTER TABLE "products"
            DROP COLUMN "badge",
            DROP COLUMN "features",
            DROP COLUMN "hdChannels",
            DROP COLUMN "channels",
            DROP COLUMN "uploadSpeed",
            DROP COLUMN "downloadSpeed",
            DROP COLUMN "planType",
            DROP COLUMN "brand"
        `);

        await queryRunner.query(`DROP TYPE "products_plantype_enum"`);
        await queryRunner.query(`DROP TYPE "products_brand_enum"`);
    }
}
