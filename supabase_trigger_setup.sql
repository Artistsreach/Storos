-- Function to call the Edge Function
CREATE OR REPLACE FUNCTION trigger_stripe_connect_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  user_payload JSONB;
  -- IMPORTANT: Replace with your actual deployed Edge Function Invoke URL
  function_url TEXT := 'https://uwbrgokfgelgxeonoqah.supabase.co/functions/v1/create-stripe-connect-account'; 
  -- anon_key TEXT := 'YOUR_SUPABASE_ANON_KEY'; -- Not strictly needed if function uses service_role internally and is called server-side
BEGIN
  -- Construct a payload similar to what the Edge Function expects.
  user_payload := jsonb_build_object(
    'record', jsonb_build_object(
      'id', NEW.id,
      'email', NEW.email,
      'raw_user_meta_data', NEW.raw_user_meta_data
    )
  );

  -- Perform a POST request to the Edge Function.
  -- Ensure the Edge Function is deployed and accessible.
  -- The timeout_milliseconds is important to prevent the trigger from hanging too long.
  PERFORM net.http_post(
    url := function_url,
    body := user_payload,
    headers := '{"Content-Type": "application/json"}'::JSONB
    -- If you added specific authorization to your function beyond service_role internal checks:
    -- headers := jsonb_build_object(
    --   'Content-Type', 'application/json',
    --   'Authorization', 'Bearer ' || anon_key -- Or a shared secret
    -- )
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error, but don't fail the user creation process
    RAISE WARNING 'Failed to trigger Stripe Connect creation for user % (ID: %): %', NEW.email, NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists to avoid errors on re-creation
DROP TRIGGER IF EXISTS on_auth_user_created_trigger_stripe ON auth.users;

-- Create the trigger on the auth.users table
-- This will execute *after* the `on_auth_user_created` trigger that creates the profile row.
CREATE TRIGGER on_auth_user_created_trigger_stripe
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_stripe_connect_creation();
