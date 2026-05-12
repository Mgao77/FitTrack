-- Migration 002: Add AI meal logging fields
-- Adds notes (stores original user sentence) and is_ai_estimate flag to meals table
-- Adds 'ai_estimate' as valid source value for meal_items

ALTER TABLE meals
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS is_ai_estimate BOOLEAN NOT NULL DEFAULT FALSE;
