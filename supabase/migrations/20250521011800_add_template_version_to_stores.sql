ALTER TABLE public.stores
ADD COLUMN template_version TEXT DEFAULT 'default';

COMMENT ON COLUMN public.stores.template_version IS 'Identifies the storefront template version to be used (e.g., ''default'', ''modern_v2'').';
