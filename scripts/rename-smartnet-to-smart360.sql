-- ─────────────────────────────────────────────────────────────────────
-- Renombra la marca SmartNet → Smart360 en toda la BD.
--
-- Importante: este script encuentra los enums por el VALOR que contienen
-- ('SMARTNET', 'HERO_LOGO_SMARTNET', etc.) en lugar de hardcodear el
-- nombre del tipo, porque TypeORM puede haberlos creado con
-- convenciones distintas:
--   - Si los creó `synchronize`: <tabla>_<columna>_enum
--     (ej. branding_assets_slot_enum)
--   - Si los creó una migración manual: el nombre que escogió el autor
--     (ej. branding_slot_enum)
--
-- Idempotente: si ya se corrió antes, los IF EXISTS lo saltan limpio.
-- ─────────────────────────────────────────────────────────────────────

BEGIN;

-- Helper: dado un valor de enum (`label`), localiza el tipo enum que lo
-- contiene y le hace RENAME VALUE al nuevo nombre. Si no existe, no hace
-- nada (idempotente). Si hay varios enums con ese mismo label (raro pero
-- posible), los renombra todos.
CREATE OR REPLACE FUNCTION pg_temp.rename_enum_value(
    old_label text,
    new_label text
) RETURNS void AS $$
DECLARE
    enum_type regtype;
BEGIN
    FOR enum_type IN
        SELECT DISTINCT t.oid::regtype
          FROM pg_enum e
          JOIN pg_type t ON t.oid = e.enumtypid
         WHERE e.enumlabel = old_label
    LOOP
        EXECUTE format(
            'ALTER TYPE %s RENAME VALUE %L TO %L',
            enum_type, old_label, new_label
        );
        RAISE NOTICE 'Renombrado en %: % → %', enum_type, old_label, new_label;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 1. Marca de productos / sucursales.
SELECT pg_temp.rename_enum_value('SMARTNET', 'SMART360');

-- 2. Slots de branding (logos por marca).
SELECT pg_temp.rename_enum_value('HERO_LOGO_SMARTNET', 'HERO_LOGO_SMART360');
SELECT pg_temp.rename_enum_value('FOOTER_LOGO_SMARTNET', 'FOOTER_LOGO_SMART360');

-- 3. Datos sembrados (nombres y labels visibles).
UPDATE "branches"
   SET "name" = 'Smart360'
 WHERE "brand"::text = 'SMART360' AND "name" = 'SmartNet';

UPDATE "branding_assets"
   SET "label" = 'Logo Smart360 (hero · marcas)',
       "alt"   = 'Smart360'
 WHERE "slot"::text = 'HERO_LOGO_SMART360';

UPDATE "branding_assets"
   SET "label" = 'Logo Smart360 (footer · marcas)',
       "alt"   = 'Smart360'
 WHERE "slot"::text = 'FOOTER_LOGO_SMART360';

COMMIT;
