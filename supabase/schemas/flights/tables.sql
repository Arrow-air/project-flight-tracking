
-- Flight Legs Table
-- =============================================================
CREATE TABLE public.flight_legs (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),

  -- Relationships
  pilot_id uuid NOT NULL REFERENCES public.user_profiles(id),
  aircraft_id uuid NOT NULL REFERENCES public.aircraft(id),

  -- Data
  location text,
  altitude_m integer,
  temp_C smallint,
  title text,
  description text
);

-- Flight Notes Table
-- =============================================================
CREATE TABLE public.flight_notes (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),

  -- Relationships
  author_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  flight_leg_id uuid REFERENCES public.flight_legs(id) ON DELETE CASCADE,

  -- Data
  notes text,
  note_type public.flight_note_type NOT NULL
);

-- Flight Leg Logs Table
-- =============================================================
CREATE TABLE public.flight_leg_logs (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),

  -- Relationships
  flight_leg_id uuid REFERENCES public.flight_legs(id) ON DELETE CASCADE,
  uploaded_by_id uuid REFERENCES public.user_profiles(id),

  -- Data
  filename text NOT NULL,
  notes text,
  size_bytes bigint,
  bucket text NOT NULL DEFAULT 'flight_logs',
  object_path text NOT NULL,
  content_type text,
  checksum_sha256 text
);

-- Flight Leg Tags Table
-- =============================================================
CREATE TABLE public.flight_leg_tags (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),

  -- Relationships
  leg_id uuid NOT NULL REFERENCES public.flight_legs(id),
  tag_id uuid NOT NULL REFERENCES public.tags(id),
  tagged_by_id uuid REFERENCES public.user_profiles(id),

  -- Data
  CONSTRAINT flight_leg_tags_unique UNIQUE (tag_id, leg_id)
);


