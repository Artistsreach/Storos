/// <reference lib="deno.ns" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseClientWithServiceRole } from '../_shared/supabaseClient.ts' // Changed import

console.log(`Function "assign-store-manager" up and running!`)

serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createSupabaseClientWithServiceRole()
    const { store_id, manager_email } = await req.json()

    if (!store_id) {
      return new Response(JSON.stringify({ error: 'store_id is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    if (!manager_email) {
      return new Response(JSON.stringify({ error: 'manager_email is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 1. Find the user by email to get their ID
    // We need to query the auth.users table for this, which requires service_role key
    // The createSupabaseClient should ideally be configured to use service_role for admin tasks
    // For now, let's assume it can query auth.users or profiles table.
    // Let's try to get the user from the 'profiles' table if it contains emails, or directly from 'auth.users'
    
    // First, try to get the user from auth.users table
    const { data: authUser, error: authUserError } = await supabaseAdmin
      .from('users') // This refers to auth.users
      .select('id')
      .eq('email', manager_email)
      .single()

    // Moved store fetching logic to be before user lookup conditional
    // 2. Fetch the store to get its pass_key
    const { data: storeData, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('pass_key')
      .eq('id', store_id)
      .single()

    if (storeError || !storeData) {
      console.error('Error fetching store or store not found:', storeError)
      return new Response(JSON.stringify({ error: 'Store not found.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    if (!storeData.pass_key) {
      return new Response(JSON.stringify({ error: 'Store does not have a pass_key set. Cannot assign manager without it.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400, // Bad Request, as a prerequisite is missing
      })
    }
    
    // TODO: The pass_key should be hashed before storing it as secret_key_hash.
    // For now, using it directly as per user instruction.
    const secretKeyToStore = storeData.pass_key;

    let manager_user_id_to_use: string | null = null; // This variable might not be directly used if not storing manager's user_id

    if (authUserError || !authUser) {
      console.error('Error fetching user by email from auth.users:', authUserError)
      // Fallback: try to get from profiles if email is there and unique
      const { data: profileUser, error: profileUserError } = await supabaseAdmin
        .from('profiles')
        .select('id') // We need the ID to confirm existence, even if not storing it directly in store_managers
        .eq('email', manager_email) 
        .single()

      if (profileUserError || !profileUser) {
        console.error('Error fetching user by email from profiles:', profileUserError)
        return new Response(JSON.stringify({ error: 'Manager user not found with this email.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        })
      }
      manager_user_id_to_use = profileUser.id; // Found user in profiles
    } else {
      manager_user_id_to_use = authUser.id; // Found user in auth.users
    }

    // 3. Insert into store_managers table
    const { data: newManagerAssignment, error: insertError } = await supabaseAdmin
      .from('store_managers')
      .insert({
        store_id: store_id,
        manager_email: manager_email,
        // manager_user_id: manager_user_id_to_use, // Optional: if you add a column for the user's ID
        secret_key_hash: secretKeyToStore, 
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting into store_managers:', insertError);
      if (insertError.code === '23505') { // Unique violation
        return new Response(JSON.stringify({ error: 'This manager is already assigned to this store.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409, // Conflict
        });
      }
      return new Response(JSON.stringify({ error: `Failed to assign manager: ${insertError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ message: 'Store manager assigned successfully', assignment: newManagerAssignment }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('General error in assign-store-manager function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
