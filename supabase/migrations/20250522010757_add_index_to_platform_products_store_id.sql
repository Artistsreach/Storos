-- Add an index to the store_id column in the platform_products table
CREATE INDEX idx_platform_products_store_id ON public.platform_products (store_id);
