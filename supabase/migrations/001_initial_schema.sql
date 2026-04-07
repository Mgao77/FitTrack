-- supabase/migrations/001_initial_schema.sql

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  height_cm DECIMAL,
  weight_kg DECIMAL,
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  workout_frequency INTEGER,
  workout_environment TEXT,
  equipment JSONB DEFAULT '[]'::jsonb,
  goals JSONB,
  workout_preferences JSONB DEFAULT '[]'::jsonb,
  sports JSONB DEFAULT '[]'::jsonb,
  injuries JSONB DEFAULT '[]'::jsonb,
  dietary_restrictions JSONB DEFAULT '[]'::jsonb,
  foods_to_avoid JSONB DEFAULT '[]'::jsonb,
  unit_preference TEXT DEFAULT 'kg' CHECK (unit_preference IN ('kg', 'lbs')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS muscle_fatigue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  muscle_group TEXT NOT NULL,
  last_trained_at TIMESTAMPTZ NOT NULL,
  intensity TEXT DEFAULT 'moderate' CHECK (intensity IN ('light', 'moderate', 'heavy')),
  recovery_hours INTEGER DEFAULT 48,
  UNIQUE(user_id, muscle_group)
);

CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  workout_name TEXT NOT NULL,
  target_muscle_groups JSONB NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  total_duration_minutes INTEGER,
  estimated_calories_burned DECIMAL,
  total_volume DECIMAL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  exercise_name TEXT NOT NULL,
  primary_muscle TEXT NOT NULL,
  secondary_muscles JSONB DEFAULT '[]'::jsonb,
  set_number INTEGER NOT NULL,
  prescribed_reps INTEGER,
  prescribed_weight DECIMAL,
  actual_reps INTEGER NOT NULL,
  actual_weight DECIMAL NOT NULL,
  weight_unit TEXT DEFAULT 'kg',
  rest_seconds INTEGER,
  notes TEXT,
  met_value DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS progressive_overload (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  exercise_name TEXT NOT NULL,
  current_weight DECIMAL NOT NULL,
  current_reps INTEGER NOT NULL,
  consecutive_successes INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, exercise_name)
);

CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  photo_url TEXT,
  total_calories DECIMAL,
  total_protein DECIMAL,
  total_carbs DECIMAL,
  total_fat DECIMAL,
  total_sugar DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID REFERENCES meals(id) ON DELETE CASCADE NOT NULL,
  food_name TEXT NOT NULL,
  serving_grams DECIMAL,
  calories DECIMAL,
  protein DECIMAL,
  carbs DECIMAL,
  fat DECIMAL,
  sugar DECIMAL,
  source TEXT DEFAULT 'manual',
  open_food_facts_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS frequent_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  meal_name TEXT,
  items JSONB NOT NULL,
  times_logged INTEGER DEFAULT 1,
  last_logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weight_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  weight DECIMAL NOT NULL,
  unit TEXT DEFAULT 'kg',
  logged_at DATE DEFAULT CURRENT_DATE,
  UNIQUE(user_id, logged_at)
);

CREATE TABLE IF NOT EXISTS daily_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  calorie_target DECIMAL,
  protein_target DECIMAL,
  carb_target DECIMAL,
  fat_target DECIMAL,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  streak_type TEXT NOT NULL,
  current_count INTEGER DEFAULT 0,
  longest_count INTEGER DEFAULT 0,
  last_incremented_at DATE,
  UNIQUE(user_id, streak_type)
);

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_type TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE muscle_fatigue ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE progressive_overload ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE frequent_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "own_muscle_fatigue" ON muscle_fatigue FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_workouts" ON workouts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_exercise_logs" ON exercise_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_progressive_overload" ON progressive_overload FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_meals" ON meals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_meal_items" ON meal_items FOR ALL USING (
  auth.uid() = (SELECT user_id FROM meals WHERE id = meal_id)
);
CREATE POLICY "own_frequent_meals" ON frequent_meals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_weight_log" ON weight_log FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_daily_targets" ON daily_targets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_streaks" ON streaks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_achievements" ON achievements FOR ALL USING (auth.uid() = user_id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Friend'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
