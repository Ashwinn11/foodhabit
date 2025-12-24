// @ts-nocheck - Deno runtime types not available in IDE
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@^2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with auto-injected environment variables
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify user is authenticated
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body to get confirmation
    const { confirmed } = await req.json();

    if (!confirmed) {
      return new Response(
        JSON.stringify({ error: "Account deletion must be confirmed" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Delete user data using the secure function
    const { data: deleteResult, error: deleteError } = await supabase
      .rpc("delete_user_account", { user_id_to_delete: user.id });

    if (deleteError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: deleteError.message || "Failed to delete user data",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!deleteResult?.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: deleteResult?.error || "Failed to delete user data",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Delete user from Supabase Auth (admin operation)
    console.log("Attempting to delete auth user:", user.id);
    const { error: adminDeleteError } = await supabase.auth.admin.deleteUser(
      user.id
    );

    if (adminDeleteError) {
      console.error("Error deleting auth user:", adminDeleteError);
      console.error("Auth error details:", JSON.stringify(adminDeleteError, null, 2));
      // Even if auth deletion fails, we've already deleted the user data
      // Log this for manual cleanup
    } else {
      console.log("Successfully deleted auth user");
    }

    return new Response(
      JSON.stringify({
        success: true,
        deletedRecords: deleteResult.deleted_records,
        authDeleted: !adminDeleteError
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
        stack: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});