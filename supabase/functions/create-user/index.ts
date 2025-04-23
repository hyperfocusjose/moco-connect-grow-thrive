
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set");
    }

    // Create a supabase client with the service role key which has admin rights
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    // Get the data from the request
    const { email, password, userData } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create the user with the admin client
    const { data: user, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: userData.firstName,
        last_name: userData.lastName,
      }
    });

    if (createUserError) {
      throw createUserError;
    }

    // Use upsert to update the profile if it exists or create it if it doesn't
    if (user?.user) {
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert({
          id: user.user.id,
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: email,
          business_name: userData.businessName,
          industry: userData.industry,
          bio: userData.bio || "",
          phone_number: userData.phoneNumber,
          profile_picture: userData.profilePicture || "",
          website: userData.website || "",
          linkedin: userData.linkedin || "",
          facebook: userData.facebook || "",
          tiktok: userData.tiktok || "",
          instagram: userData.instagram || "",
        }, {
          onConflict: 'id'  // This tells Supabase to update if there's a conflict on the id column
        });

      if (profileError) {
        throw profileError;
      }

      // Add member tags if provided
      if (userData.tags && userData.tags.length > 0) {
        const tagPromises = userData.tags.map(tag => 
          supabaseAdmin.from("member_tags").insert({
            member_id: user.user.id,
            tag
          })
        );
        
        await Promise.all(tagPromises);
      }
    }

    return new Response(JSON.stringify({ user }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
