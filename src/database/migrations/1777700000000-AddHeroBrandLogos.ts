import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Añade 3 nuevos slots al enum `branding_slot_enum` para los logos de
 * las marcas en el showcase del hero. El servicio (`onApplicationBootstrap`)
 * sembrará las filas correspondientes la próxima vez que arranque la app.
 *
 * `transaction = false` porque Postgres no permite usar un valor de enum
 * recién añadido (vía ALTER TYPE ... ADD VALUE) dentro de la misma
 * transacción donde se añadió. Mantenemos sólo el ALTER TYPE aquí y
 * dejamos los INSERT al bootstrap del servicio.
 */
export class AddHeroBrandLogos1777700000000 implements MigrationInterface {
    name = 'AddHeroBrandLogos1777700000000';
    public transaction = false as const;

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TYPE "branding_slot_enum" ADD VALUE IF NOT EXISTS 'HERO_LOGO_CAFANET'`,
        );
        await queryRunner.query(
            `ALTER TYPE "branding_slot_enum" ADD VALUE IF NOT EXISTS 'HERO_LOGO_SMARTNET'`,
        );
        await queryRunner.query(
            `ALTER TYPE "branding_slot_enum" ADD VALUE IF NOT EXISTS 'HERO_LOGO_TVCAFA'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Postgres no permite eliminar valores de enum directamente; sólo
        // limpiamos las filas. Recrear el tipo sería más invasivo de lo
        // razonable para un down opcional.
        await queryRunner.query(
            `DELETE FROM "branding_assets" WHERE "slot" IN (
                'HERO_LOGO_CAFANET',
                'HERO_LOGO_SMARTNET',
                'HERO_LOGO_TVCAFA'
            )`,
        );
    }
}
