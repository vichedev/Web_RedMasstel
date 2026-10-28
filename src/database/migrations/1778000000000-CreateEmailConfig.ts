import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Crea la tabla `email_config` que guarda las credenciales de EmailJS
 * configuradas desde el dashboard. Es una tabla singleton (a lo sumo
 * una fila); el service inicializa la fila en bootstrap si no existe.
 */
export class CreateEmailConfig1778000000000 implements MigrationInterface {
    name = 'CreateEmailConfig1778000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "email_config" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "publicKey" varchar(200),
                "serviceId" varchar(100),
                "templateContact" varchar(100),
                "templateSubscribe" varchar(100),
                "adminEmail" varchar(200),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        // Sembramos la fila singleton vacía. El service la creará igualmente
        // en bootstrap si esta migración no se ejecuta.
        await queryRunner.query(
            `INSERT INTO "email_config" DEFAULT VALUES`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "email_config"`);
    }
}
