CREATE INDEX idx_stores_merchant_id_created_at ON public.stores (merchant_id, created_at DESC);

COMMENT ON INDEX public.idx_stores_merchant_id_created_at IS 'Index to optimize querying stores by merchant and creation date for faster store listing and creation processes.';
