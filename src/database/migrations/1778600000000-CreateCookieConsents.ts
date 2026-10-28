import { MigrationInterface, QueryRunner } from 'typeorm';

/** Tabla de decisiones del aviso de cookies (una fila por navegador). */
export class CreateCookieConsents1778600000000 implements MigrationInterface {
    name = 'CreateCookieConsents1778600000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "cookie_decision_enum" AS ENUM ('ACCEPTED', 'REJECTED')`,
        );
        await queryRunner.query(`
            CREATE TABLE "cookie_consents" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "visitorId" uuid NOT NULL,
                "decision" "cookie_decision_enum" NOT NULL,
                "userAgent" varchar(255),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_cookie_consents_visitorId" ON "cookie_consents" ("visitorId")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_cookie_consents_updatedAt" ON "cookie_consents" ("updatedAt")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "cookie_consents"`);
        await queryRunner.query(`DROP TYPE "cookie_decision_enum"`);
    }
}
