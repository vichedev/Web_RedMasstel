import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Crea las tablas:
 *   - `documents`       → documentos administrativos (PDFs subidos).
 *   - `external_links`  → enlaces externos (ARCOTEL, MINTEL, Speedtest…).
 *
 * Ambas alimentan al footer (cuando `showInFooter = true`) y a la página
 * pública /documentos.
 */
export class CreateDocumentsAndExternalLinks1777800000000
    implements MigrationInterface {
    name = 'CreateDocumentsAndExternalLinks1777800000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ───── documents ─────
        await queryRunner.query(`
            CREATE TYPE "documents_category_enum" AS ENUM (
                'LEGAL',
                'TARIFFS',
                'REGULATORY',
                'CONTRACT',
                'OTHER'
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "documents" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "title" varchar(200) NOT NULL,
                "description" varchar(500),
                "fileUrl" varchar(500) NOT NULL,
                "originalName" varchar(255),
                "fileSize" bigint,
                "category" "documents_category_enum" NOT NULL DEFAULT 'LEGAL',
                "isActive" boolean NOT NULL DEFAULT true,
                "showInFooter" boolean NOT NULL DEFAULT false,
                "sortOrder" int NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_documents_category" ON "documents" ("category")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_documents_showInFooter" ON "documents" ("showInFooter")
        `);

        // ───── external_links ─────
        await queryRunner.query(`
            CREATE TYPE "external_links_kind_enum" AS ENUM (
                'ARCOTEL',
                'MINTEL',
                'SPEEDTEST',
                'GOVERNMENT',
                'TOOL',
                'SOCIAL',
                'GENERIC'
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "external_links" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "label" varchar(120) NOT NULL,
                "description" varchar(300),
                "url" varchar(500) NOT NULL,
                "kind" "external_links_kind_enum" NOT NULL DEFAULT 'GENERIC',
                "isActive" boolean NOT NULL DEFAULT true,
                "showInFooter" boolean NOT NULL DEFAULT true,
                "sortOrder" int NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_external_links_showInFooter" ON "external_links" ("showInFooter")
        `);

        // Sembramos los enlaces típicos de un ISP ecuatoriano. El admin
        // puede editarlos / desactivarlos / borrarlos desde el dashboard.
        await queryRunner.query(`
            INSERT INTO "external_links" ("label", "description", "url", "kind", "sortOrder") VALUES
                ('ARCOTEL',   'Agencia de Regulación y Control de las Telecomunicaciones',  'https://www.arcotel.gob.ec',  'ARCOTEL',   10),
                ('MINTEL',    'Ministerio de Telecomunicaciones del Ecuador',                'https://www.telecomunicaciones.gob.ec', 'MINTEL', 20),
                ('Speedtest', 'Mide tu velocidad de internet',                                'https://www.speedtest.net',   'SPEEDTEST', 30)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "external_links"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "external_links_kind_enum"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "documents"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "documents_category_enum"`);
    }
}
