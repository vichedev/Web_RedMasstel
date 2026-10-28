import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Crea la tabla `branding_assets` con un slot por elemento gráfico
 * configurable (logos del navbar, hero, footer y de las marcas en el
 * footer). El servicio rellena las filas en bootstrap si la migración
 * no se corrió aún.
 */
export class CreateBrandingAssets1777600000000 implements MigrationInterface {
    name = 'CreateBrandingAssets1777600000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "branding_slot_enum" AS ENUM (
                'NAVBAR_LOGO',
                'HERO_LOGO',
                'FOOTER_LOGO_MAIN',
                'FOOTER_LOGO_CAFANET',
                'FOOTER_LOGO_SMARTNET',
                'FOOTER_LOGO_TVCAFA'
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "branding_assets" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "slot" "branding_slot_enum" NOT NULL,
                "label" varchar(120) NOT NULL,
                "url" varchar(500),
                "alt" varchar(200),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_branding_slot" UNIQUE ("slot")
            )
        `);

        await queryRunner.query(`
            INSERT INTO "branding_assets" ("slot", "label", "alt") VALUES
                ('NAVBAR_LOGO',          'Logo del navbar',                 'Cafanet'),
                ('HERO_LOGO',            'Logo del hero',                   'Cafanet'),
                ('FOOTER_LOGO_MAIN',     'Logo principal del footer',       'Cafanet'),
                ('FOOTER_LOGO_CAFANET',  'Logo Cafanet (footer · marcas)',  'Cafanet'),
                ('FOOTER_LOGO_SMARTNET', 'Logo SmartNet (footer · marcas)', 'SmartNet'),
                ('FOOTER_LOGO_TVCAFA',   'Logo TV Cafa (footer · marcas)',  'TV Cafa')
            ON CONFLICT ("slot") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "branding_assets"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "branding_slot_enum"`);
    }
}
