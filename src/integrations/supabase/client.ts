
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fermfvwyoqewedrzgben.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlcm1mdnd5b3Fld2VkcnpnYmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MDQ3MDMsImV4cCI6MjA2MDk4MDcwM30.3ZoAxX3eb_29KQMj5nV8Dzd60tvdundDSbjNSS2vwII";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
