-- Create tags table
CREATE TABLE public.tags (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),

  -- Relationships
  created_by_id uuid REFERENCES public.user_profiles(id),

  -- Data
  name text NOT NULL UNIQUE,
  description text
);

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Policies for tags
CREATE POLICY "Users can view tags" ON public.tags 
FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Authenticated users can create tags" ON public.tags 
FOR INSERT TO authenticated 
WITH CHECK ((SELECT auth.uid()) = created_by_id);

CREATE POLICY "Users can update own tags" ON public.tags 
FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = created_by_id)
WITH CHECK ((SELECT auth.uid()) = created_by_id);

-- Add updated_at trigger
CREATE TRIGGER set_updated_at_tags
  BEFORE UPDATE ON public.tags 
  FOR EACH ROW 
  EXECUTE FUNCTION extensions.moddatetime('updated_at');