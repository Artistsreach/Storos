-- Drop the incorrect foreign key constraint if it exists
ALTER TABLE public.collection_products
DROP CONSTRAINT IF EXISTS collection_products_product_id_fkey;

-- Add the correct foreign key constraint
ALTER TABLE public.collection_products
ADD CONSTRAINT collection_products_product_id_fkey
FOREIGN KEY (product_id) REFERENCES public.platform_products(id)
ON DELETE CASCADE;
