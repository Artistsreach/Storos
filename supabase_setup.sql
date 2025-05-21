-- Create a table for public profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT, -- Can be useful to store, syncs with auth.users.email
  stripe_account_id TEXT, -- To store the Stripe Connect Account ID (e.g., acct_xxxxxxxxxxxxxx)
  stripe_account_details_submitted BOOLEAN DEFAULT FALSE, -- Track if Stripe onboarding is complete
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up Row Level Security (RLS) for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id )
  WITH CHECK ( auth.uid() = id );

-- Function to automatically create a profile entry when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Important for accessing auth.users
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- Trigger the function after user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create a table for stores
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  subdomain TEXT UNIQUE, -- e.g., 'my-awesome-store' for my-awesome-store.storegen.app
  custom_domain TEXT UNIQUE,
  pass_key TEXT, -- For store-level access control
  -- Add other store-specific settings like logo_url, theme_settings (JSONB), etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS for stores
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view their own stores."
  ON public.stores FOR SELECT
  USING ( auth.uid() = merchant_id );

CREATE POLICY "Merchants can insert their own stores."
  ON public.stores FOR INSERT
  WITH CHECK ( auth.uid() = merchant_id );

CREATE POLICY "Merchants can update their own stores."
  ON public.stores FOR UPDATE
  USING ( auth.uid() = merchant_id )
  WITH CHECK ( auth.uid() = merchant_id );

CREATE POLICY "Merchants can delete their own stores."
  ON public.stores FOR DELETE
  USING ( auth.uid() = merchant_id );

-- Create a table for platform products (products managed by our platform)
CREATE TABLE public.platform_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  images TEXT[], -- Array of image URLs
  -- Platform's price representation (optional if relying solely on Stripe price)
  -- price_amount DECIMAL(10, 2), 
  -- currency VARCHAR(3),
  stripe_product_id TEXT, -- Stripe Product ID (prod_xxxxxxxxxxxxxx)
  stripe_default_price_id TEXT, -- Stripe Price ID (price_xxxxxxxxxxxxxx) for the default price
  -- Add other product attributes: tax_code (TEXT), shippable (BOOLEAN), active (BOOLEAN DEFAULT TRUE)
  -- For recurring products:
  -- price_type TEXT CHECK (price_type IN ('one_time', 'recurring')),
  -- recurring_interval TEXT CHECK (recurring_interval IN ('day', 'week', 'month', 'year')),
  -- recurring_interval_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS for platform_products
ALTER TABLE public.platform_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can manage products for their own stores."
  ON public.platform_products FOR ALL
  USING ( EXISTS (SELECT 1 FROM public.stores WHERE stores.id = platform_products.store_id AND stores.merchant_id = auth.uid()) )
  WITH CHECK ( EXISTS (SELECT 1 FROM public.stores WHERE stores.id = platform_products.store_id AND stores.merchant_id = auth.uid()) );

-- Public read access for products (e.g., for store frontend)
CREATE POLICY "Products are publicly viewable."
  ON public.platform_products FOR SELECT
  USING (true);

-- Create a table for store managers
CREATE TABLE public.store_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  manager_email TEXT NOT NULL,
  secret_key_hash TEXT NOT NULL, -- Store a hash of the secret key, not the key itself
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_store_manager_email UNIQUE (store_id, manager_email) -- A manager can only be assigned once per store
);

-- Add RLS for store_managers
ALTER TABLE public.store_managers ENABLE ROW LEVEL SECURITY;

-- Policy: Store owners (merchants) can manage manager assignments for their own stores.
CREATE POLICY "Merchants can manage store managers for their stores."
  ON public.store_managers FOR ALL
  USING ( EXISTS (SELECT 1 FROM public.stores WHERE stores.id = store_managers.store_id AND stores.merchant_id = auth.uid()) )
  WITH CHECK ( EXISTS (SELECT 1 FROM public.stores WHERE stores.id = store_managers.store_id AND stores.merchant_id = auth.uid()) );

-- Policy: Allow managers to read their own assignment (e.g., to verify a key, though this is tricky without a direct user link)
-- This might be better handled by specific functions. For now, focusing on owner management.
-- Consider if a manager, once authenticated via secret key, needs to read their own record.
-- A function with SECURITY DEFINER would be safer for updating email/key based on providing the old key.

-- Index for faster lookups
CREATE INDEX idx_store_managers_store_id ON public.store_managers(store_id);
CREATE INDEX idx_store_managers_manager_email ON public.store_managers(manager_email);
