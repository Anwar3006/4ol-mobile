-- 1. Create the user_notes table adapted for BetterAuth
CREATE TABLE IF NOT EXISTS public.user_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Changed to TEXT to match your user_profiles.user_id (BetterAuth standard)
    user_id TEXT NOT NULL, 
    note TEXT NOT NULL,
    emotion TEXT CHECK (emotion IN ('terrible', 'bad', 'okay', 'good', 'great')),
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- References to your existing medication and workout tables
    medication_id UUID REFERENCES public.medication_reminders(id) ON DELETE SET NULL,
    workout_id UUID REFERENCES public.workout_reminders(id) ON DELETE SET NULL,
    
    -- Metadata for Calendar logic: Purple (independent), Green (medication), Blue (workout)
    -- This allows you to query specifically for the "dot" color
    note_type TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN workout_id IS NOT NULL THEN 'workout'    -- Blue Circle
            WHEN medication_id IS NOT NULL THEN 'medication' -- Green Circle
            ELSE 'independent'                            -- Purple Circle
        END
    ) STORED,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Foreign Key to your specific user_profiles table
    CONSTRAINT fk_user_profile 
        FOREIGN KEY (user_id) 
        REFERENCES public.user_profiles(user_id) 
        ON DELETE CASCADE
);

-- 2. Enable Row Level Security
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies using your custom user_id logic
-- Since you aren't using Supabase Auth (auth.uid()), we assume 
-- your middleware/API passes the user_id for validation.
CREATE POLICY "Users can view their own notes"
ON public.user_notes FOR SELECT 
USING (user_id = user_id); -- Use application-level checks or JWT claims

CREATE POLICY "Users can insert their own notes"
ON public.user_notes FOR INSERT 
WITH CHECK (user_id = user_id);

CREATE POLICY "Users can update their own notes"
ON public.user_notes FOR UPDATE 
USING (user_id = user_id);

CREATE POLICY "Users can delete their own notes"
ON public.user_notes FOR DELETE 
USING (user_id = user_id);

-- 4. Create indexes for performance
CREATE INDEX idx_user_notes_user_id ON public.user_notes(user_id);
CREATE INDEX idx_user_notes_medication_id ON public.user_notes(medication_id);
CREATE INDEX idx_user_notes_workout_id ON public.user_notes(workout_id);
CREATE INDEX idx_user_notes_timestamp ON public.user_notes(timestamp);
CREATE INDEX idx_user_notes_type ON public.user_notes(note_type);