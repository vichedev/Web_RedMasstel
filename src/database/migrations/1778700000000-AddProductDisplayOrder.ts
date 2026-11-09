import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Posición manual de los planes (la elige el admin arrastrando en el panel).
 * Se inicializa con el orden que se veía hasta ahora (más recientes primero)
 * para que la web no cambie al aplicar la migración.
 */
export class AddProductDisplayOrder1778700000000 implements MigrationInterface {
    name = 'AddProductDisplayOrder1778700000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "displayOrder" int NOT NULL DEFAULT 0`,
        );
        await queryRunner.query(`
            UPDATE "products" p
               SET "displayOrder" = o.pos
              FROM (
                    SELECT id, (ROW_NUMBER() OVER (ORDER BY "createdAt" DESC) - 1)::int AS pos
                      FROM "products"
                   ) o
             WHERE o.id = p.id
        `);
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_products_displayOrder" ON "products" ("displayOrder")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_displayOrder"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "displayOrder"`);
    }
}
