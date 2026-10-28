-- ─────────────────────────────────────────────────────────────────────
-- Añade 3 slots nuevos al enum `branding_assets_slot_enum`:
--   NAVBAR_LOGO_CAFANET
--   NAVBAR_LOGO_SMART360
--   NAVBAR_LOGO_TVCAFA
--
-- En teoría `synchronize=true` ya los crea al reiniciar Nest, pero si
-- algo falla puedes correr este script primero. Idempotente.
-- Las filas en `branding_assets` se crean solas cuando el
-- BrandingService corre `onApplicationBootstrap`.
-- ─────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    enum_type_name text;
BEGIN
    -- Encuentra el tipo enum que actualmente tiene 'NAVBAR_LOGO',
    -- así no dependemos de su nombre exacto (puede ser
    -- branding_assets_slot_enum o branding_slot_enum).
    SELECT t.typname INTO enum_type_name
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
     WHERE e.enumlabel = 'NAVBAR_LOGO'
     LIMIT 1;

    IF enum_type_name IS NULL THEN
        RAISE EXCEPTION 'No se encontró el tipo enum del slot NAVBAR_LOGO';
    END IF;

    EXECUTE format(
        'ALTER TYPE %I ADD VALUE IF NOT EXISTS %L',
        enum_type_name, 'NAVBAR_LOGO_CAFANET'
    );
    EXECUTE format(
        'ALTER TYPE %I ADD VALUE IF NOT EXISTS %L',
        enum_type_name, 'NAVBAR_LOGO_SMART360'
    );
    EXECUTE format(
        'ALTER TYPE %I ADD VALUE IF NOT EXISTS %L',
        enum_type_name, 'NAVBAR_LOGO_TVCAFA'
    );
END$$;
