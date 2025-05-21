CREATE TABLE store_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE "public"."store_collections" IS 'Stores collections created for each e-commerce store.';
COMMENT ON COLUMN "public"."store_collections"."id" IS 'Unique identifier for the collection.';
COMMENT ON COLUMN "public"."store_collections"."store_id" IS 'Foreign key to the store this collection belongs to.';
COMMENT ON COLUMN "public"."store_collections"."name" IS 'Name of the collection.';
COMMENT ON COLUMN "public"."store_collections"."description" IS 'Description of the collection.';
COMMENT ON COLUMN "public"."store_collections"."image_url" IS 'URL for the collection''s representative image.';
COMMENT ON COLUMN "public"."store_collections"."created_at" IS 'Timestamp of when the collection was created.';
