
-- The following SQL script needs to be run in the Supabase SQL Editor.
-- This creates a Row Level Security (RLS) policy that will allow 
-- authenticated users to view all profiles.

-- First, enable RLS on the profiles table if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Check if policy exists and drop it if it does
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Allow users to view all profiles'
    ) THEN
        DROP POLICY "Allow users to view all profiles" ON public.profiles;
    END IF;
END
$$;

-- Create a simple policy that allows any authenticated user to view all profiles
CREATE POLICY "Allow users to view all profiles" 
ON public.profiles
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create another policy to allow users to update their own profile
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Allow users to update own profile'
    ) THEN
        DROP POLICY "Allow users to update own profile" ON public.profiles;
    END IF;
END
$$;

CREATE POLICY "Allow users to update own profile" 
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);
