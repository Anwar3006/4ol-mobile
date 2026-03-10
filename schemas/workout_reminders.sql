-- 1. Create the workout_reminders table adapted for BetterAuth
CREATE TABLE IF NOT EXISTS public.workout_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Changed to TEXT to match your user_profiles.user_id 
    user_id TEXT NOT NULL, 
    
    workout_type TEXT NOT NULL,
    duration TEXT NOT NULL, -- e.g., '30', '45', '60'
    time TEXT NOT NULL, -- e.g., '07:00', '18:30'
    days TEXT[] NOT NULL, -- Array of days, e.g., ['Mon', 'Wed', 'Fri']
    goals TEXT,
    
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_enabled BOOLEAN DEFAULT true NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Foreign Key to your specific user_profiles table
    CONSTRAINT fk_user_profile 
        FOREIGN KEY (user_id) 
        REFERENCES public.user_profiles(user_id) 
        ON DELETE CASCADE
);

-- 2. Enable Row Level Security
ALTER TABLE public.workout_reminders ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
CREATE POLICY "Users can view their own workout reminders"
ON public.workout_reminders FOR SELECT 
USING (user_id = user_id); 

CREATE POLICY "Users can insert their own workout reminders"
ON public.workout_reminders FOR INSERT 
WITH CHECK (user_id = user_id);

CREATE POLICY "Users can update their own workout reminders"
ON public.workout_reminders FOR UPDATE 
USING (user_id = user_id);

CREATE POLICY "Users can delete their own workout reminders"
ON public.workout_reminders FOR DELETE 
USING (user_id = user_id);

-- 4. Create indexes for performance
CREATE INDEX idx_workout_reminders_user_id ON public.workout_reminders(user_id);
CREATE INDEX idx_workout_reminders_is_active ON public.workout_reminders(is_active);
