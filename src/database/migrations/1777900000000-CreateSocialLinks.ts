import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Crea la tabla `social_links`: una fila por plataforma social
 * (Facebook, Instagram, TikTok, X, YouTube, LinkedIn). El admin
 * configura la URL desde el dashboard.
 *
 * El servicio rellena las filas en bootstrap si no se ejecutó esta
 * migración, por lo que el seed con `INSERT ... ON CONFLICT` es
 * defensivo.
 */
export class CreateSocialLinks1777900000000 implements MigrationInterface {
    name = 'CreateSocialLinks1777900000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "social_platform_enum" AS ENUM (
                'FACEBOOK',
                'INSTAGRAM',
                'TIKTOK',
                'X',
                'YOUTUBE',
                'LINKEDIN'
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "social_links" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "platform" "social_platform_enum" NOT NULL,
                "url" varchar(500),
                "username" varchar(120),
                "isActive" boolean NOT NULL DEFAULT true,
                "sortOrder" int NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_social_links_platform" UNIQUE ("platform")
            )
        `);

        await queryRunner.query(`
            INSERT INTO "social_links" ("platform", "sortOrder") VALUES
                ('FACEBOOK',  10),
                ('INSTAGRAM', 20),
                ('TIKTOK',    30),
                ('X',         40),
                ('YOUTUBE',   50),
                ('LINKEDIN',  60)
            ON CONFLICT ("platform") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "social_links"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "social_platform_enum"`);
    }
}
