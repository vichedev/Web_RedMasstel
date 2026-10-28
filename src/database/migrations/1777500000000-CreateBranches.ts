import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Crea la tabla `branches`: una sucursal por marca, con su número de
 * WhatsApp configurable desde el dashboard.
 *
 * El enum `branches_brand_enum` se mantiene independiente del enum de
 * `products` para que ninguno de los dos quede acoplado al otro a nivel
 * de tipo Postgres.
 */
export class CreateBranches1777500000000 implements MigrationInterface {
    name = 'CreateBranches1777500000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "branches_brand_enum" AS ENUM ('CAFANET','SMARTNET','TV_CAFA')
        `);

        await queryRunner.query(`
            CREATE TABLE "branches" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "brand" "branches_brand_enum" NOT NULL,
                "name" varchar(120) NOT NULL,
                "phone" varchar(30),
                "whatsappPhone" varchar(30),
                "address" varchar(255),
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_branches_brand" UNIQUE ("brand")
            )
        `);

        // Sembramos las 3 sucursales por defecto (sin teléfonos) para que
        // arranquen visibles en el dashboard. Si el bootstrap del servicio
        // corre primero, este INSERT se vuelve no-op gracias a ON CONFLICT.
        await queryRunner.query(`
            INSERT INTO "branches" ("brand", "name") VALUES
                ('CAFANET',  'Cafanet'),
                ('SMARTNET', 'SmartNet'),
                ('TV_CAFA',  'TV Cafa')
            ON CONFLICT ("brand") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "branches"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "branches_brand_enum"`);
    }
}
