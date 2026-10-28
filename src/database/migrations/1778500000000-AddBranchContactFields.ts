import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Sucursal personalizable: correo de contacto, texto bajo el correo y
 * horario de atención (jsonb). Se precargan los valores que antes
 * estaban fijos en la web para que nada cambie visualmente.
 */
export class AddBranchContactFields1778500000000 implements MigrationInterface {
    name = 'AddBranchContactFields1778500000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "email" varchar(120)`);
        await queryRunner.query(`ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "emailHint" varchar(80)`);
        await queryRunner.query(`ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "schedule" jsonb`);
        await queryRunner.query(`
            UPDATE "branches" SET
                "email" = COALESCE("email", 'ventas@redmaastel.ec'),
                "emailHint" = COALESCE("emailHint", 'Respuesta en <24h'),
                "schedule" = COALESCE("schedule", '[
                    {"label":"Lunes a Viernes","hours":"8:00 — 18:00","days":[1,2,3,4,5]},
                    {"label":"Sábado","hours":"8:30 — 12:30","days":[6]},
                    {"label":"Domingo","hours":"Cerrado","days":[0],"closed":true}
                ]'::jsonb)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN IF EXISTS "schedule"`);
        await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN IF EXISTS "emailHint"`);
        await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN IF EXISTS "email"`);
    }
}
