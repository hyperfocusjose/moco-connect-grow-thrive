
import { SupabaseClient } from '@supabase/supabase-js'

declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    auth: {
      admin: {
        createUser(params: {
          email: string;
          password: string;
          email_confirm?: boolean;
          user_metadata?: {
            [key: string]: any;
          };
        }): Promise<{
          data: { user: any };
          error: null | { message: string };
        }>;
      };
    };
  }
}
