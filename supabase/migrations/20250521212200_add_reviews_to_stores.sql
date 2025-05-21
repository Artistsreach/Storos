ALTER TABLE stores
ADD COLUMN reviews JSONB DEFAULT '[]'::jsonb;
