ALTER TABLE public.stores
ADD COLUMN type TEXT,
ADD COLUMN description TEXT,
ADD COLUMN prompt TEXT,
ADD COLUMN hero_image JSONB,
ADD COLUMN hero_video_url TEXT,
ADD COLUMN hero_video_poster_url TEXT,
ADD COLUMN logo_url TEXT,
ADD COLUMN theme JSONB,
ADD COLUMN content JSONB,
ADD COLUMN data_source TEXT,
ADD COLUMN card_background_url TEXT;

COMMENT ON COLUMN public.stores.type IS 'Type of products the store sells (e.g., fashion, electronics).';
COMMENT ON COLUMN public.stores.description IS 'Store description, potentially AI-generated.';
COMMENT ON COLUMN public.stores.prompt IS 'The user prompt or context used for AI generation.';
COMMENT ON COLUMN public.stores.hero_image IS 'JSONB object storing hero image details (e.g., src, alt).';
COMMENT ON COLUMN public.stores.hero_video_url IS 'URL for the hero section background video.';
COMMENT ON COLUMN public.stores.hero_video_poster_url IS 'URL for the poster image of the hero video.';
COMMENT ON COLUMN public.stores.logo_url IS 'URL of the store logo.';
COMMENT ON COLUMN public.stores.theme IS 'JSONB object for theme settings (colors, fonts, layout).';
COMMENT ON COLUMN public.stores.content IS 'JSONB object for various textual content of the store (titles, subtitles).';
COMMENT ON COLUMN public.stores.data_source IS 'Indicates how the store data was generated (e.g., wizard, ai, shopify).';
COMMENT ON COLUMN public.stores.card_background_url IS 'URL for the background image of store cards or elements.';
