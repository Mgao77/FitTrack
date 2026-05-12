import type { FoodSearchResult } from '../types'
import { searchNutritionix } from './nutritionix'

// ── Local fallback database ───────────────────────────────────────────────────
// Curated staples with accurate macros per 100g. Searched first, instantly.
const FALLBACK_FOODS: FoodSearchResult[] = [
  // Proteins
  { id: 'fb_chicken_breast', name: 'Chicken Breast (grilled)', calories_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6, sugar_per_100g: 0 },
  { id: 'fb_chicken_thigh', name: 'Chicken Thigh (grilled)', calories_per_100g: 209, protein_per_100g: 26, carbs_per_100g: 0, fat_per_100g: 11, sugar_per_100g: 0 },
  { id: 'fb_beef_mince', name: 'Beef Mince (lean)', calories_per_100g: 215, protein_per_100g: 26, carbs_per_100g: 0, fat_per_100g: 12, sugar_per_100g: 0 },
  { id: 'fb_beef_steak', name: 'Beef Steak (sirloin)', calories_per_100g: 207, protein_per_100g: 28, carbs_per_100g: 0, fat_per_100g: 10, sugar_per_100g: 0 },
  { id: 'fb_lamb_chops', name: 'Lamb Chops (grilled)', calories_per_100g: 235, protein_per_100g: 25, carbs_per_100g: 0, fat_per_100g: 15, sugar_per_100g: 0 },
  { id: 'fb_lamb_mince', name: 'Lamb Mince (cooked)', calories_per_100g: 260, protein_per_100g: 24, carbs_per_100g: 0, fat_per_100g: 18, sugar_per_100g: 0 },
  { id: 'fb_pork_loin', name: 'Pork Loin (grilled)', calories_per_100g: 189, protein_per_100g: 28, carbs_per_100g: 0, fat_per_100g: 8, sugar_per_100g: 0 },
  { id: 'fb_duck_breast', name: 'Duck Breast (grilled)', calories_per_100g: 201, protein_per_100g: 28, carbs_per_100g: 0, fat_per_100g: 10, sugar_per_100g: 0 },
  // Seafood
  { id: 'fb_salmon', name: 'Salmon (grilled)', calories_per_100g: 208, protein_per_100g: 20, carbs_per_100g: 0, fat_per_100g: 13, sugar_per_100g: 0 },
  { id: 'fb_tuna', name: 'Tuna (canned in water)', calories_per_100g: 116, protein_per_100g: 25, carbs_per_100g: 0, fat_per_100g: 1, sugar_per_100g: 0 },
  { id: 'fb_tuna_fresh', name: 'Tuna (fresh, grilled)', calories_per_100g: 144, protein_per_100g: 30, carbs_per_100g: 0, fat_per_100g: 1.3, sugar_per_100g: 0 },
  { id: 'fb_cod', name: 'Cod (baked)', calories_per_100g: 105, protein_per_100g: 23, carbs_per_100g: 0, fat_per_100g: 0.9, sugar_per_100g: 0 },
  { id: 'fb_sea_bass', name: 'Sea Bass (grilled)', calories_per_100g: 124, protein_per_100g: 24, carbs_per_100g: 0, fat_per_100g: 2.6, sugar_per_100g: 0 },
  { id: 'fb_tilapia', name: 'Tilapia (baked)', calories_per_100g: 128, protein_per_100g: 26, carbs_per_100g: 0, fat_per_100g: 2.7, sugar_per_100g: 0 },
  { id: 'fb_mackerel', name: 'Mackerel (grilled)', calories_per_100g: 262, protein_per_100g: 24, carbs_per_100g: 0, fat_per_100g: 18, sugar_per_100g: 0 },
  { id: 'fb_sardines', name: 'Sardines (canned in oil)', calories_per_100g: 208, protein_per_100g: 25, carbs_per_100g: 0, fat_per_100g: 11, sugar_per_100g: 0 },
  { id: 'fb_herring', name: 'Herring (grilled)', calories_per_100g: 203, protein_per_100g: 23, carbs_per_100g: 0, fat_per_100g: 12, sugar_per_100g: 0 },
  { id: 'fb_trout', name: 'Trout (baked)', calories_per_100g: 190, protein_per_100g: 27, carbs_per_100g: 0, fat_per_100g: 9, sugar_per_100g: 0 },
  { id: 'fb_halibut', name: 'Halibut (baked)', calories_per_100g: 140, protein_per_100g: 27, carbs_per_100g: 0, fat_per_100g: 3, sugar_per_100g: 0 },
  { id: 'fb_mahi_mahi', name: 'Mahi Mahi (grilled)', calories_per_100g: 109, protein_per_100g: 24, carbs_per_100g: 0, fat_per_100g: 0.9, sugar_per_100g: 0 },
  { id: 'fb_swordfish', name: 'Swordfish (grilled)', calories_per_100g: 155, protein_per_100g: 25, carbs_per_100g: 0, fat_per_100g: 5, sugar_per_100g: 0 },
  { id: 'fb_sea_bream', name: 'Sea Bream (grilled)', calories_per_100g: 128, protein_per_100g: 21, carbs_per_100g: 0, fat_per_100g: 4.5, sugar_per_100g: 0 },
  { id: 'fb_snapper', name: 'Red Snapper (baked)', calories_per_100g: 128, protein_per_100g: 26, carbs_per_100g: 0, fat_per_100g: 1.7, sugar_per_100g: 0 },
  { id: 'fb_crab', name: 'Crab (cooked)', calories_per_100g: 97, protein_per_100g: 20, carbs_per_100g: 0, fat_per_100g: 1.5, sugar_per_100g: 0 },
  { id: 'fb_lobster', name: 'Lobster (boiled)', calories_per_100g: 98, protein_per_100g: 21, carbs_per_100g: 0, fat_per_100g: 0.6, sugar_per_100g: 0 },
  { id: 'fb_squid', name: 'Squid (grilled)', calories_per_100g: 92, protein_per_100g: 16, carbs_per_100g: 3.1, fat_per_100g: 1.4, sugar_per_100g: 0 },
  { id: 'fb_octopus', name: 'Octopus (cooked)', calories_per_100g: 164, protein_per_100g: 30, carbs_per_100g: 4.4, fat_per_100g: 2.1, sugar_per_100g: 0 },
  { id: 'fb_eggs', name: 'Eggs (whole)', calories_per_100g: 155, protein_per_100g: 13, carbs_per_100g: 1.1, fat_per_100g: 11, sugar_per_100g: 1.1 },
  { id: 'fb_egg_whites', name: 'Egg Whites', calories_per_100g: 52, protein_per_100g: 11, carbs_per_100g: 0.7, fat_per_100g: 0.2, sugar_per_100g: 0.7 },
  { id: 'fb_turkey_breast', name: 'Turkey Breast (grilled)', calories_per_100g: 135, protein_per_100g: 30, carbs_per_100g: 0, fat_per_100g: 1, sugar_per_100g: 0 },
  { id: 'fb_shrimp', name: 'Shrimp (boiled)', calories_per_100g: 99, protein_per_100g: 24, carbs_per_100g: 0, fat_per_100g: 0.3, sugar_per_100g: 0 },
  // Dairy
  { id: 'fb_milk_whole', name: 'Milk (whole)', calories_per_100g: 61, protein_per_100g: 3.2, carbs_per_100g: 4.8, fat_per_100g: 3.3, sugar_per_100g: 4.8 },
  { id: 'fb_milk_skimmed', name: 'Milk (skimmed)', calories_per_100g: 35, protein_per_100g: 3.4, carbs_per_100g: 5, fat_per_100g: 0.1, sugar_per_100g: 5 },
  { id: 'fb_greek_yogurt', name: 'Greek Yogurt (plain)', calories_per_100g: 97, protein_per_100g: 9, carbs_per_100g: 3.6, fat_per_100g: 5, sugar_per_100g: 3.2 },
  { id: 'fb_cottage_cheese', name: 'Cottage Cheese (low fat)', calories_per_100g: 72, protein_per_100g: 12, carbs_per_100g: 3.4, fat_per_100g: 1, sugar_per_100g: 2.7 },
  { id: 'fb_cheddar', name: 'Cheddar Cheese', calories_per_100g: 402, protein_per_100g: 25, carbs_per_100g: 1.3, fat_per_100g: 33, sugar_per_100g: 0.5 },
  { id: 'fb_butter', name: 'Butter', calories_per_100g: 717, protein_per_100g: 0.9, carbs_per_100g: 0.1, fat_per_100g: 81, sugar_per_100g: 0.1 },
  { id: 'fb_labneh', name: 'Labneh', calories_per_100g: 171, protein_per_100g: 8, carbs_per_100g: 4, fat_per_100g: 13, sugar_per_100g: 4 },
  { id: 'fb_mozzarella', name: 'Mozzarella Cheese', calories_per_100g: 280, protein_per_100g: 20, carbs_per_100g: 2.2, fat_per_100g: 22, sugar_per_100g: 1 },
  { id: 'fb_feta', name: 'Feta Cheese', calories_per_100g: 264, protein_per_100g: 14, carbs_per_100g: 4, fat_per_100g: 21, sugar_per_100g: 4 },
  { id: 'fb_cream_cheese', name: 'Cream Cheese', calories_per_100g: 342, protein_per_100g: 6, carbs_per_100g: 4.1, fat_per_100g: 34, sugar_per_100g: 3.2 },
  { id: 'fb_sour_cream', name: 'Sour Cream', calories_per_100g: 198, protein_per_100g: 2.4, carbs_per_100g: 4.6, fat_per_100g: 19, sugar_per_100g: 3.8 },
  // Grains
  { id: 'fb_white_rice', name: 'White Rice (cooked)', calories_per_100g: 130, protein_per_100g: 2.7, carbs_per_100g: 28, fat_per_100g: 0.3, sugar_per_100g: 0 },
  { id: 'fb_brown_rice', name: 'Brown Rice (cooked)', calories_per_100g: 111, protein_per_100g: 2.6, carbs_per_100g: 23, fat_per_100g: 0.9, sugar_per_100g: 0 },
  { id: 'fb_oats', name: 'Oats (rolled, dry)', calories_per_100g: 389, protein_per_100g: 17, carbs_per_100g: 66, fat_per_100g: 7, sugar_per_100g: 1 },
  { id: 'fb_pasta', name: 'Pasta (cooked)', calories_per_100g: 131, protein_per_100g: 5, carbs_per_100g: 25, fat_per_100g: 1.1, sugar_per_100g: 0.6 },
  { id: 'fb_pasta_ww', name: 'Whole Wheat Pasta (cooked)', calories_per_100g: 124, protein_per_100g: 5.3, carbs_per_100g: 23, fat_per_100g: 1, sugar_per_100g: 0.8 },
  { id: 'fb_bread_white', name: 'White Bread', calories_per_100g: 265, protein_per_100g: 9, carbs_per_100g: 49, fat_per_100g: 3.2, sugar_per_100g: 5 },
  { id: 'fb_bread_ww', name: 'Whole Wheat Bread', calories_per_100g: 247, protein_per_100g: 13, carbs_per_100g: 41, fat_per_100g: 4.2, sugar_per_100g: 5 },
  { id: 'fb_pita', name: 'Pita Bread', calories_per_100g: 275, protein_per_100g: 9.1, carbs_per_100g: 56, fat_per_100g: 1.2, sugar_per_100g: 1.4 },
  { id: 'fb_quinoa', name: 'Quinoa (cooked)', calories_per_100g: 120, protein_per_100g: 4.4, carbs_per_100g: 21, fat_per_100g: 1.9, sugar_per_100g: 0.9 },
  // Vegetables
  { id: 'fb_potato', name: 'Potato (boiled)', calories_per_100g: 87, protein_per_100g: 1.9, carbs_per_100g: 20, fat_per_100g: 0.1, sugar_per_100g: 0.9 },
  { id: 'fb_sweet_potato', name: 'Sweet Potato (baked)', calories_per_100g: 90, protein_per_100g: 2, carbs_per_100g: 21, fat_per_100g: 0.1, sugar_per_100g: 6.5 },
  { id: 'fb_tomato', name: 'Tomato (raw)', calories_per_100g: 18, protein_per_100g: 0.9, carbs_per_100g: 3.9, fat_per_100g: 0.2, sugar_per_100g: 2.6 },
  { id: 'fb_broccoli', name: 'Broccoli (raw)', calories_per_100g: 34, protein_per_100g: 2.8, carbs_per_100g: 7, fat_per_100g: 0.4, sugar_per_100g: 1.7 },
  { id: 'fb_spinach', name: 'Spinach (raw)', calories_per_100g: 23, protein_per_100g: 2.9, carbs_per_100g: 3.6, fat_per_100g: 0.4, sugar_per_100g: 0.4 },
  { id: 'fb_lettuce', name: 'Lettuce (mixed greens)', calories_per_100g: 15, protein_per_100g: 1.4, carbs_per_100g: 2.9, fat_per_100g: 0.2, sugar_per_100g: 1.2 },
  { id: 'fb_cucumber', name: 'Cucumber (raw)', calories_per_100g: 16, protein_per_100g: 0.7, carbs_per_100g: 3.6, fat_per_100g: 0.1, sugar_per_100g: 1.7 },
  { id: 'fb_pepper', name: 'Bell Pepper (raw)', calories_per_100g: 31, protein_per_100g: 1, carbs_per_100g: 7.2, fat_per_100g: 0.3, sugar_per_100g: 5 },
  { id: 'fb_avocado', name: 'Avocado', calories_per_100g: 160, protein_per_100g: 2, carbs_per_100g: 9, fat_per_100g: 15, sugar_per_100g: 0.7 },
  { id: 'fb_carrot', name: 'Carrot (raw)', calories_per_100g: 41, protein_per_100g: 0.9, carbs_per_100g: 10, fat_per_100g: 0.2, sugar_per_100g: 4.7 },
  { id: 'fb_onion', name: 'Onion (raw)', calories_per_100g: 40, protein_per_100g: 1.1, carbs_per_100g: 9.3, fat_per_100g: 0.1, sugar_per_100g: 4.2 },
  { id: 'fb_mushroom', name: 'Mushrooms (raw)', calories_per_100g: 22, protein_per_100g: 3.1, carbs_per_100g: 3.3, fat_per_100g: 0.3, sugar_per_100g: 2 },
  { id: 'fb_zucchini', name: 'Zucchini (raw)', calories_per_100g: 17, protein_per_100g: 1.2, carbs_per_100g: 3.1, fat_per_100g: 0.3, sugar_per_100g: 2.5 },
  { id: 'fb_eggplant', name: 'Eggplant (cooked)', calories_per_100g: 35, protein_per_100g: 0.8, carbs_per_100g: 8.7, fat_per_100g: 0.2, sugar_per_100g: 3.5 },
  { id: 'fb_cauliflower', name: 'Cauliflower (raw)', calories_per_100g: 25, protein_per_100g: 1.9, carbs_per_100g: 5, fat_per_100g: 0.3, sugar_per_100g: 1.9 },
  { id: 'fb_kale', name: 'Kale (raw)', calories_per_100g: 49, protein_per_100g: 4.3, carbs_per_100g: 9, fat_per_100g: 0.9, sugar_per_100g: 2.3 },
  { id: 'fb_asparagus', name: 'Asparagus (cooked)', calories_per_100g: 22, protein_per_100g: 2.4, carbs_per_100g: 4.1, fat_per_100g: 0.2, sugar_per_100g: 1.3 },
  { id: 'fb_green_beans', name: 'Green Beans (cooked)', calories_per_100g: 35, protein_per_100g: 1.9, carbs_per_100g: 7.9, fat_per_100g: 0.1, sugar_per_100g: 1.5 },
  { id: 'fb_peas', name: 'Peas (cooked)', calories_per_100g: 84, protein_per_100g: 5.4, carbs_per_100g: 15, fat_per_100g: 0.2, sugar_per_100g: 5.5 },
  { id: 'fb_corn', name: 'Corn (cooked)', calories_per_100g: 96, protein_per_100g: 3.4, carbs_per_100g: 21, fat_per_100g: 1.5, sugar_per_100g: 4.5 },
  { id: 'fb_cabbage', name: 'Cabbage (raw)', calories_per_100g: 25, protein_per_100g: 1.3, carbs_per_100g: 5.8, fat_per_100g: 0.1, sugar_per_100g: 3.2 },
  // Fruits
  { id: 'fb_apple', name: 'Apple (raw)', calories_per_100g: 52, protein_per_100g: 0.3, carbs_per_100g: 14, fat_per_100g: 0.2, sugar_per_100g: 10 },
  { id: 'fb_banana', name: 'Banana', calories_per_100g: 89, protein_per_100g: 1.1, carbs_per_100g: 23, fat_per_100g: 0.3, sugar_per_100g: 12 },
  { id: 'fb_orange', name: 'Orange', calories_per_100g: 47, protein_per_100g: 0.9, carbs_per_100g: 12, fat_per_100g: 0.1, sugar_per_100g: 9.4 },
  { id: 'fb_strawberry', name: 'Strawberries', calories_per_100g: 32, protein_per_100g: 0.7, carbs_per_100g: 7.7, fat_per_100g: 0.3, sugar_per_100g: 4.9 },
  { id: 'fb_blueberry', name: 'Blueberries', calories_per_100g: 57, protein_per_100g: 0.7, carbs_per_100g: 14, fat_per_100g: 0.3, sugar_per_100g: 10 },
  { id: 'fb_mango', name: 'Mango', calories_per_100g: 60, protein_per_100g: 0.8, carbs_per_100g: 15, fat_per_100g: 0.4, sugar_per_100g: 13.7 },
  { id: 'fb_grapes', name: 'Grapes', calories_per_100g: 69, protein_per_100g: 0.7, carbs_per_100g: 18, fat_per_100g: 0.2, sugar_per_100g: 15.5 },
  { id: 'fb_pear', name: 'Pear', calories_per_100g: 57, protein_per_100g: 0.4, carbs_per_100g: 15, fat_per_100g: 0.1, sugar_per_100g: 9.8 },
  { id: 'fb_pineapple', name: 'Pineapple', calories_per_100g: 50, protein_per_100g: 0.5, carbs_per_100g: 13, fat_per_100g: 0.1, sugar_per_100g: 9.9 },
  { id: 'fb_watermelon', name: 'Watermelon', calories_per_100g: 30, protein_per_100g: 0.6, carbs_per_100g: 7.6, fat_per_100g: 0.2, sugar_per_100g: 6.2 },
  { id: 'fb_dates', name: 'Dates (dried)', calories_per_100g: 277, protein_per_100g: 1.8, carbs_per_100g: 75, fat_per_100g: 0.2, sugar_per_100g: 66 },
  { id: 'fb_pomegranate', name: 'Pomegranate', calories_per_100g: 83, protein_per_100g: 1.7, carbs_per_100g: 19, fat_per_100g: 1.2, sugar_per_100g: 13.7 },
  // Nuts & Fats
  { id: 'fb_almonds', name: 'Almonds', calories_per_100g: 579, protein_per_100g: 21, carbs_per_100g: 22, fat_per_100g: 50, sugar_per_100g: 4.4 },
  { id: 'fb_peanut_butter', name: 'Peanut Butter', calories_per_100g: 588, protein_per_100g: 25, carbs_per_100g: 20, fat_per_100g: 50, sugar_per_100g: 9 },
  { id: 'fb_walnuts', name: 'Walnuts', calories_per_100g: 654, protein_per_100g: 15, carbs_per_100g: 14, fat_per_100g: 65, sugar_per_100g: 2.6 },
  { id: 'fb_olive_oil', name: 'Olive Oil', calories_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100, sugar_per_100g: 0 },
  // Legumes
  { id: 'fb_chickpeas', name: 'Chickpeas (cooked)', calories_per_100g: 164, protein_per_100g: 8.9, carbs_per_100g: 27, fat_per_100g: 2.6, sugar_per_100g: 4.8 },
  { id: 'fb_lentils', name: 'Lentils (cooked)', calories_per_100g: 116, protein_per_100g: 9, carbs_per_100g: 20, fat_per_100g: 0.4, sugar_per_100g: 1.8 },
  // Middle Eastern & MENA — macros sourced from SFDA / peer-reviewed nutrition data
  { id: 'fb_hummus', name: 'Hummus', calories_per_100g: 177, protein_per_100g: 7.9, carbs_per_100g: 14, fat_per_100g: 9.6, sugar_per_100g: 0.7 },
  { id: 'fb_falafel', name: 'Falafel', calories_per_100g: 333, protein_per_100g: 13, carbs_per_100g: 32, fat_per_100g: 18, sugar_per_100g: 3 },
  { id: 'fb_shawarma_chicken', name: 'Chicken Shawarma', calories_per_100g: 215, protein_per_100g: 22, carbs_per_100g: 8, fat_per_100g: 11, sugar_per_100g: 1 },
  { id: 'fb_shawarma_beef', name: 'Beef Shawarma', calories_per_100g: 235, protein_per_100g: 20, carbs_per_100g: 9, fat_per_100g: 14, sugar_per_100g: 1.5 },
  { id: 'fb_tabbouleh', name: 'Tabbouleh', calories_per_100g: 78, protein_per_100g: 2.2, carbs_per_100g: 9, fat_per_100g: 4, sugar_per_100g: 1.8 },
  { id: 'fb_kofta', name: 'Kofta (beef/lamb, grilled)', calories_per_100g: 220, protein_per_100g: 21, carbs_per_100g: 4, fat_per_100g: 13, sugar_per_100g: 1 },
  // Kabsa & Mansaf — curated from SFDA (Saudi Food & Drug Authority) database
  { id: 'fb_kabsa_chicken', name: 'Kabsa (chicken)', calories_per_100g: 165, protein_per_100g: 12, carbs_per_100g: 18, fat_per_100g: 5, sugar_per_100g: 1 },
  { id: 'fb_kabsa_lamb', name: 'Kabsa (lamb)', calories_per_100g: 185, protein_per_100g: 13, carbs_per_100g: 17, fat_per_100g: 7, sugar_per_100g: 1 },
  { id: 'fb_mansaf', name: 'Mansaf', calories_per_100g: 190, protein_per_100g: 14, carbs_per_100g: 16, fat_per_100g: 8, sugar_per_100g: 1 },
  { id: 'fb_mandi', name: 'Mandi (chicken)', calories_per_100g: 170, protein_per_100g: 13, carbs_per_100g: 17, fat_per_100g: 5.5, sugar_per_100g: 0.8 },
  { id: 'fb_maqluba', name: 'Maqluba', calories_per_100g: 155, protein_per_100g: 10, carbs_per_100g: 18, fat_per_100g: 5, sugar_per_100g: 1.5 },
  { id: 'fb_harees', name: 'Harees', calories_per_100g: 130, protein_per_100g: 9, carbs_per_100g: 17, fat_per_100g: 3.5, sugar_per_100g: 0.5 },
  // Biryani variants
  { id: 'fb_biryani_chicken', name: 'Chicken Biryani', calories_per_100g: 190, protein_per_100g: 12, carbs_per_100g: 22, fat_per_100g: 6, sugar_per_100g: 1 },
  { id: 'fb_biryani_lamb', name: 'Lamb Biryani', calories_per_100g: 210, protein_per_100g: 13, carbs_per_100g: 22, fat_per_100g: 8, sugar_per_100g: 1 },
  { id: 'fb_biryani_veg', name: 'Vegetable Biryani', calories_per_100g: 155, protein_per_100g: 5, carbs_per_100g: 26, fat_per_100g: 4, sugar_per_100g: 2 },
  // Mexican & Tex-Mex
  { id: 'fb_burrito_chicken', name: 'Chicken Burrito', calories_per_100g: 185, protein_per_100g: 11, carbs_per_100g: 22, fat_per_100g: 6, sugar_per_100g: 2 },
  { id: 'fb_burrito_beef', name: 'Beef Burrito', calories_per_100g: 210, protein_per_100g: 12, carbs_per_100g: 22, fat_per_100g: 9, sugar_per_100g: 2 },
  { id: 'fb_burrito_bowl', name: 'Burrito Bowl', calories_per_100g: 140, protein_per_100g: 10, carbs_per_100g: 16, fat_per_100g: 4, sugar_per_100g: 2 },
  { id: 'fb_taco_chicken', name: 'Chicken Taco', calories_per_100g: 195, protein_per_100g: 13, carbs_per_100g: 19, fat_per_100g: 7, sugar_per_100g: 2 },
  { id: 'fb_taco_beef', name: 'Beef Taco', calories_per_100g: 215, protein_per_100g: 12, carbs_per_100g: 19, fat_per_100g: 10, sugar_per_100g: 1.5 },
  { id: 'fb_taco_fish', name: 'Fish Taco', calories_per_100g: 170, protein_per_100g: 11, carbs_per_100g: 18, fat_per_100g: 6, sugar_per_100g: 2 },
  { id: 'fb_quesadilla', name: 'Quesadilla (chicken)', calories_per_100g: 230, protein_per_100g: 14, carbs_per_100g: 22, fat_per_100g: 9, sugar_per_100g: 1.5 },
  // Salads
  { id: 'fb_greek_salad', name: 'Greek Salad', calories_per_100g: 95, protein_per_100g: 3, carbs_per_100g: 6, fat_per_100g: 7, sugar_per_100g: 4 },
  { id: 'fb_caesar_salad', name: 'Caesar Salad', calories_per_100g: 130, protein_per_100g: 5, carbs_per_100g: 8, fat_per_100g: 9, sugar_per_100g: 2 },
  { id: 'fb_garden_salad', name: 'Garden Salad (mixed greens)', calories_per_100g: 20, protein_per_100g: 1.5, carbs_per_100g: 3.5, fat_per_100g: 0.3, sugar_per_100g: 2 },
  { id: 'fb_chicken_salad', name: 'Chicken Salad', calories_per_100g: 180, protein_per_100g: 14, carbs_per_100g: 5, fat_per_100g: 12, sugar_per_100g: 3 },
  { id: 'fb_tuna_salad', name: 'Tuna Salad', calories_per_100g: 187, protein_per_100g: 16, carbs_per_100g: 3, fat_per_100g: 12, sugar_per_100g: 1 },
  { id: 'fb_coleslaw', name: 'Coleslaw', calories_per_100g: 150, protein_per_100g: 1.5, carbs_per_100g: 15, fat_per_100g: 9, sugar_per_100g: 10 },
  { id: 'fb_fattoush', name: 'Fattoush', calories_per_100g: 75, protein_per_100g: 2, carbs_per_100g: 10, fat_per_100g: 3.5, sugar_per_100g: 3 },
  // Fast food & common meals
  { id: 'fb_fries', name: 'French Fries (deep fried)', calories_per_100g: 312, protein_per_100g: 3.4, carbs_per_100g: 41, fat_per_100g: 15, sugar_per_100g: 0.3 },
  { id: 'fb_sweet_potato_fries', name: 'Sweet Potato Fries', calories_per_100g: 270, protein_per_100g: 3.2, carbs_per_100g: 36, fat_per_100g: 13, sugar_per_100g: 5 },
  { id: 'fb_burger', name: 'Cheeseburger', calories_per_100g: 270, protein_per_100g: 15, carbs_per_100g: 24, fat_per_100g: 12, sugar_per_100g: 5 },
  { id: 'fb_pizza', name: 'Pizza (cheese)', calories_per_100g: 266, protein_per_100g: 11, carbs_per_100g: 33, fat_per_100g: 10, sugar_per_100g: 3.6 },
  { id: 'fb_pizza_margherita', name: 'Pizza Margherita', calories_per_100g: 250, protein_per_100g: 10, carbs_per_100g: 32, fat_per_100g: 9, sugar_per_100g: 3 },
  { id: 'fb_hot_dog', name: 'Hot Dog (with bun)', calories_per_100g: 290, protein_per_100g: 11, carbs_per_100g: 24, fat_per_100g: 17, sugar_per_100g: 4 },
  { id: 'fb_chicken_nuggets', name: 'Chicken Nuggets', calories_per_100g: 296, protein_per_100g: 15, carbs_per_100g: 19, fat_per_100g: 18, sugar_per_100g: 0.5 },
  { id: 'fb_fried_chicken', name: 'Fried Chicken', calories_per_100g: 320, protein_per_100g: 28, carbs_per_100g: 12, fat_per_100g: 18, sugar_per_100g: 0.3 },
  { id: 'fb_sandwich', name: 'Sandwich (chicken)', calories_per_100g: 210, protein_per_100g: 14, carbs_per_100g: 21, fat_per_100g: 8, sugar_per_100g: 3 },
  { id: 'fb_wrap', name: 'Wrap (chicken)', calories_per_100g: 200, protein_per_100g: 13, carbs_per_100g: 22, fat_per_100g: 7, sugar_per_100g: 2 },
  { id: 'fb_sushi_roll', name: 'Sushi Roll (salmon)', calories_per_100g: 143, protein_per_100g: 7, carbs_per_100g: 19, fat_per_100g: 4, sugar_per_100g: 3 },
  // Breakfast & eggs
  { id: 'fb_scrambled_eggs', name: 'Scrambled Eggs', calories_per_100g: 149, protein_per_100g: 10, carbs_per_100g: 1.6, fat_per_100g: 11, sugar_per_100g: 0.7 },
  { id: 'fb_fried_eggs', name: 'Fried Eggs', calories_per_100g: 196, protein_per_100g: 14, carbs_per_100g: 0.8, fat_per_100g: 15, sugar_per_100g: 0.4 },
  { id: 'fb_boiled_eggs', name: 'Boiled Eggs (hard)', calories_per_100g: 155, protein_per_100g: 13, carbs_per_100g: 1.1, fat_per_100g: 11, sugar_per_100g: 1.1 },
  { id: 'fb_omelette', name: 'Omelette (plain)', calories_per_100g: 154, protein_per_100g: 11, carbs_per_100g: 0.6, fat_per_100g: 12, sugar_per_100g: 0.4 },
  { id: 'fb_pancakes', name: 'Pancakes (plain)', calories_per_100g: 227, protein_per_100g: 6.5, carbs_per_100g: 35, fat_per_100g: 7.5, sugar_per_100g: 8 },
  { id: 'fb_whey', name: 'Whey Protein Powder', calories_per_100g: 373, protein_per_100g: 75, carbs_per_100g: 10, fat_per_100g: 5, sugar_per_100g: 5 },
  { id: 'fb_granola', name: 'Granola', calories_per_100g: 471, protein_per_100g: 10, carbs_per_100g: 64, fat_per_100g: 20, sugar_per_100g: 22 },
  { id: 'fb_cereal', name: 'Cereal (corn flakes)', calories_per_100g: 357, protein_per_100g: 7, carbs_per_100g: 84, fat_per_100g: 0.4, sugar_per_100g: 8 },
  { id: 'fb_toast', name: 'Toast (white bread)', calories_per_100g: 313, protein_per_100g: 10, carbs_per_100g: 58, fat_per_100g: 4, sugar_per_100g: 5 },
  // Smoothies & drinks
  { id: 'fb_protein_smoothie', name: 'Protein Smoothie', calories_per_100g: 72, protein_per_100g: 7, carbs_per_100g: 8, fat_per_100g: 1.5, sugar_per_100g: 6 },
  { id: 'fb_protein_shake', name: 'Protein Shake (whey + milk)', calories_per_100g: 65, protein_per_100g: 8, carbs_per_100g: 6, fat_per_100g: 1.2, sugar_per_100g: 5 },
  { id: 'fb_fruit_smoothie', name: 'Fruit Smoothie', calories_per_100g: 60, protein_per_100g: 1, carbs_per_100g: 14, fat_per_100g: 0.3, sugar_per_100g: 11 },
  { id: 'fb_green_smoothie', name: 'Green Smoothie (spinach + banana)', calories_per_100g: 55, protein_per_100g: 1.5, carbs_per_100g: 12, fat_per_100g: 0.4, sugar_per_100g: 8 },
  // Snacks
  { id: 'fb_chips_potato', name: 'Potato Chips', calories_per_100g: 536, protein_per_100g: 7, carbs_per_100g: 53, fat_per_100g: 35, sugar_per_100g: 0.5 },
  { id: 'fb_popcorn', name: 'Popcorn (air popped)', calories_per_100g: 387, protein_per_100g: 13, carbs_per_100g: 78, fat_per_100g: 4.5, sugar_per_100g: 0.9 },
  { id: 'fb_chocolate', name: 'Chocolate (dark 70%)', calories_per_100g: 598, protein_per_100g: 7.8, carbs_per_100g: 46, fat_per_100g: 42, sugar_per_100g: 24 },
  { id: 'fb_ice_cream', name: 'Ice Cream (vanilla)', calories_per_100g: 207, protein_per_100g: 3.5, carbs_per_100g: 24, fat_per_100g: 11, sugar_per_100g: 21 },
  // Rice dishes & more
  { id: 'fb_fried_rice', name: 'Fried Rice', calories_per_100g: 163, protein_per_100g: 4, carbs_per_100g: 22, fat_per_100g: 6, sugar_per_100g: 1.5 },
  { id: 'fb_biryani', name: 'Chicken Biryani', calories_per_100g: 190, protein_per_100g: 12, carbs_per_100g: 22, fat_per_100g: 6, sugar_per_100g: 1 },
  { id: 'fb_risotto', name: 'Risotto (chicken)', calories_per_100g: 160, protein_per_100g: 9, carbs_per_100g: 20, fat_per_100g: 5, sugar_per_100g: 1 },
  { id: 'fb_soup_chicken', name: 'Chicken Soup', calories_per_100g: 50, protein_per_100g: 4, carbs_per_100g: 5, fat_per_100g: 1.5, sugar_per_100g: 1 },
  { id: 'fb_stir_fry', name: 'Stir Fry (chicken & veg)', calories_per_100g: 120, protein_per_100g: 12, carbs_per_100g: 8, fat_per_100g: 5, sugar_per_100g: 3 },
  // Chicken cuts
  { id: 'fb_chicken_wings', name: 'Chicken Wings (baked)', calories_per_100g: 290, protein_per_100g: 27, carbs_per_100g: 0, fat_per_100g: 19, sugar_per_100g: 0 },
  { id: 'fb_chicken_wings_fried', name: 'Chicken Wings (fried)', calories_per_100g: 320, protein_per_100g: 25, carbs_per_100g: 8, fat_per_100g: 21, sugar_per_100g: 0 },
  { id: 'fb_chicken_drumstick', name: 'Chicken Drumstick (grilled)', calories_per_100g: 175, protein_per_100g: 28, carbs_per_100g: 0, fat_per_100g: 7, sugar_per_100g: 0 },
  { id: 'fb_chicken_liver', name: 'Chicken Liver (cooked)', calories_per_100g: 172, protein_per_100g: 27, carbs_per_100g: 1, fat_per_100g: 6, sugar_per_100g: 0 },
  { id: 'fb_whole_chicken', name: 'Roast Chicken (whole)', calories_per_100g: 215, protein_per_100g: 25, carbs_per_100g: 0, fat_per_100g: 13, sugar_per_100g: 0 },
  // Beef cuts
  { id: 'fb_ribeye', name: 'Ribeye Steak (grilled)', calories_per_100g: 291, protein_per_100g: 24, carbs_per_100g: 0, fat_per_100g: 21, sugar_per_100g: 0 },
  { id: 'fb_beef_ribs', name: 'Beef Ribs (braised)', calories_per_100g: 305, protein_per_100g: 22, carbs_per_100g: 0, fat_per_100g: 24, sugar_per_100g: 0 },
  { id: 'fb_meatballs', name: 'Meatballs (beef)', calories_per_100g: 245, protein_per_100g: 16, carbs_per_100g: 6, fat_per_100g: 17, sugar_per_100g: 1 },
  // Pork
  { id: 'fb_pork_ribs', name: 'Pork Ribs (grilled)', calories_per_100g: 320, protein_per_100g: 22, carbs_per_100g: 0, fat_per_100g: 26, sugar_per_100g: 0 },
  { id: 'fb_bacon', name: 'Bacon (cooked)', calories_per_100g: 541, protein_per_100g: 37, carbs_per_100g: 1.4, fat_per_100g: 42, sugar_per_100g: 0 },
  { id: 'fb_ham', name: 'Ham (cooked)', calories_per_100g: 163, protein_per_100g: 17, carbs_per_100g: 1.5, fat_per_100g: 10, sugar_per_100g: 1 },
  { id: 'fb_sausage', name: 'Sausage (pork)', calories_per_100g: 301, protein_per_100g: 13, carbs_per_100g: 2, fat_per_100g: 27, sugar_per_100g: 0.5 },
  // Rice dishes
  { id: 'fb_rice_pilaf', name: 'Rice Pilaf', calories_per_100g: 130, protein_per_100g: 3, carbs_per_100g: 24, fat_per_100g: 3, sugar_per_100g: 0.5 },
  // Pasta dishes
  { id: 'fb_bolognese', name: 'Pasta Bolognese', calories_per_100g: 155, protein_per_100g: 9, carbs_per_100g: 17, fat_per_100g: 6, sugar_per_100g: 3 },
  { id: 'fb_carbonara', name: 'Pasta Carbonara', calories_per_100g: 195, protein_per_100g: 10, carbs_per_100g: 18, fat_per_100g: 9, sugar_per_100g: 1 },
  { id: 'fb_mac_cheese', name: 'Mac and Cheese', calories_per_100g: 166, protein_per_100g: 7, carbs_per_100g: 20, fat_per_100g: 6, sugar_per_100g: 4 },
  // Soups & stews
  { id: 'fb_soup_lentil', name: 'Lentil Soup', calories_per_100g: 70, protein_per_100g: 5, carbs_per_100g: 10, fat_per_100g: 1.5, sugar_per_100g: 2 },
  { id: 'fb_soup_tomato', name: 'Tomato Soup', calories_per_100g: 45, protein_per_100g: 1.5, carbs_per_100g: 8, fat_per_100g: 1, sugar_per_100g: 5 },
  { id: 'fb_soup_beef', name: 'Beef Stew', calories_per_100g: 105, protein_per_100g: 9, carbs_per_100g: 9, fat_per_100g: 4, sugar_per_100g: 2 },
  // Middle Eastern extras
  { id: 'fb_musakhan', name: 'Musakhan (chicken & onion)', calories_per_100g: 200, protein_per_100g: 14, carbs_per_100g: 15, fat_per_100g: 9, sugar_per_100g: 2 },
  { id: 'fb_moussaka', name: 'Moussaka', calories_per_100g: 155, protein_per_100g: 9, carbs_per_100g: 10, fat_per_100g: 9, sugar_per_100g: 3 },
  { id: 'fb_dolma', name: 'Stuffed Grape Leaves (Dolma)', calories_per_100g: 130, protein_per_100g: 5, carbs_per_100g: 14, fat_per_100g: 6, sugar_per_100g: 1 },
  { id: 'fb_baklava', name: 'Baklava', calories_per_100g: 428, protein_per_100g: 5, carbs_per_100g: 52, fat_per_100g: 23, sugar_per_100g: 30 },
  // Asian
  { id: 'fb_ramen', name: 'Ramen (chicken)', calories_per_100g: 88, protein_per_100g: 5, carbs_per_100g: 12, fat_per_100g: 2, sugar_per_100g: 1 },
  { id: 'fb_pad_thai', name: 'Pad Thai', calories_per_100g: 155, protein_per_100g: 8, carbs_per_100g: 20, fat_per_100g: 5, sugar_per_100g: 4 },
  { id: 'fb_fried_rice_egg', name: 'Egg Fried Rice', calories_per_100g: 170, protein_per_100g: 5, carbs_per_100g: 25, fat_per_100g: 6, sugar_per_100g: 1 },
  { id: 'fb_dumplings', name: 'Dumplings (pork)', calories_per_100g: 210, protein_per_100g: 9, carbs_per_100g: 24, fat_per_100g: 9, sugar_per_100g: 2 },
  // Snacks
  { id: 'fb_crackers', name: 'Crackers (whole grain)', calories_per_100g: 415, protein_per_100g: 9, carbs_per_100g: 62, fat_per_100g: 14, sugar_per_100g: 3 },
  { id: 'fb_hummus_pita', name: 'Hummus with Pita', calories_per_100g: 210, protein_per_100g: 8, carbs_per_100g: 26, fat_per_100g: 8, sugar_per_100g: 2 },
  // Nuts & seeds
  { id: 'fb_cashews', name: 'Cashews', calories_per_100g: 553, protein_per_100g: 18, carbs_per_100g: 30, fat_per_100g: 44, sugar_per_100g: 6 },
  { id: 'fb_pistachios', name: 'Pistachios', calories_per_100g: 562, protein_per_100g: 20, carbs_per_100g: 28, fat_per_100g: 45, sugar_per_100g: 8 },
  { id: 'fb_sunflower_seeds', name: 'Sunflower Seeds', calories_per_100g: 584, protein_per_100g: 21, carbs_per_100g: 20, fat_per_100g: 51, sugar_per_100g: 2.6 },
  // Condiments & extras
  { id: 'fb_tahini', name: 'Tahini', calories_per_100g: 595, protein_per_100g: 17, carbs_per_100g: 22, fat_per_100g: 53, sugar_per_100g: 0.5 },
  { id: 'fb_mayo', name: 'Mayonnaise', calories_per_100g: 680, protein_per_100g: 1, carbs_per_100g: 0.6, fat_per_100g: 75, sugar_per_100g: 0.4 },
  { id: 'fb_ketchup', name: 'Ketchup', calories_per_100g: 112, protein_per_100g: 1.3, carbs_per_100g: 27, fat_per_100g: 0.1, sugar_per_100g: 22 },
  { id: 'fb_honey', name: 'Honey', calories_per_100g: 304, protein_per_100g: 0.3, carbs_per_100g: 82, fat_per_100g: 0, sugar_per_100g: 82 },
]

// ── Aliases so short queries still find the right fallback ────────────────────
const ALIASES: Record<string, string[]> = {
  fries: ['French Fries', 'Sweet Potato Fries'],
  'french fries': ['French Fries'],
  'sweet potato fries': ['Sweet Potato Fries'],
  chips: ['Potato Chips'],
  'potato chips': ['Potato Chips'],
  burger: ['Cheeseburger'],
  pizza: ['Pizza'],
  nuggets: ['Chicken Nuggets'],
  'chicken nuggets': ['Chicken Nuggets'],
  rice: ['White Rice', 'Brown Rice', 'Fried Rice'],
  pasta: ['Pasta', 'Whole Wheat Pasta'],
  bread: ['White Bread', 'Whole Wheat Bread'],
  egg: ['Eggs (whole)', 'Egg Whites'],
  eggs: ['Eggs (whole)', 'Egg Whites'],
  chicken: ['Chicken Breast', 'Chicken Thigh', 'Fried Chicken', 'Chicken Nuggets'],
  salmon: ['Salmon'],
  tuna: ['Tuna'],
  beef: ['Beef Mince', 'Beef Steak'],
  steak: ['Beef Steak'],
  lamb: ['Lamb Chops', 'Lamb Mince', 'Lamb Biryani'],
  'lamb chops': ['Lamb Chops'],
  pork: ['Pork Loin'],
  'pork loin': ['Pork Loin'],
  duck: ['Duck Breast'],
  // Seafood aliases
  cod: ['Cod (baked)'],
  'sea bass': ['Sea Bass'],
  seabass: ['Sea Bass'],
  tilapia: ['Tilapia'],
  mackerel: ['Mackerel'],
  sardines: ['Sardines'],
  sardine: ['Sardines'],
  herring: ['Herring'],
  trout: ['Trout'],
  halibut: ['Halibut'],
  'mahi mahi': ['Mahi Mahi'],
  mahi: ['Mahi Mahi'],
  swordfish: ['Swordfish'],
  'sea bream': ['Sea Bream'],
  bream: ['Sea Bream'],
  snapper: ['Red Snapper'],
  'red snapper': ['Red Snapper'],
  crab: ['Crab'],
  lobster: ['Lobster'],
  squid: ['Squid'],
  calamari: ['Squid'],
  octopus: ['Octopus'],
  seafood: ['Shrimp (boiled)', 'Cod (baked)', 'Sea Bass (grilled)', 'Salmon (grilled)'],
  fish: ['Salmon (grilled)', 'Cod (baked)', 'Tilapia (baked)', 'Sea Bass (grilled)'],
  // Dairy aliases
  mozzarella: ['Mozzarella Cheese'],
  feta: ['Feta Cheese'],
  'feta cheese': ['Feta Cheese'],
  'cream cheese': ['Cream Cheese'],
  'sour cream': ['Sour Cream'],
  yogurt: ['Greek Yogurt'],
  milk: ['Milk'],
  cheese: ['Cheddar Cheese', 'Cottage Cheese'],
  chocolate: ['Chocolate'],
  'ice cream': ['Ice Cream'],
  oats: ['Oats'],
  oatmeal: ['Oats'],
  salad: ['Garden Salad', 'Greek Salad', 'Caesar Salad', 'Chicken Salad'],
  'greek salad': ['Greek Salad'],
  'caesar salad': ['Caesar Salad'],
  'chicken salad': ['Chicken Salad'],
  'tuna salad': ['Tuna Salad'],
  'garden salad': ['Garden Salad'],
  'mixed salad': ['Garden Salad'],
  wrap: ['Wrap'],
  sandwich: ['Sandwich'],
  sushi: ['Sushi Roll'],
  popcorn: ['Popcorn'],
  // Test-set aliases
  burrito: ['Chicken Burrito', 'Beef Burrito', 'Burrito Bowl'],
  'chicken burrito': ['Chicken Burrito'],
  'beef burrito': ['Beef Burrito'],
  'burrito bowl': ['Burrito Bowl'],
  taco: ['Chicken Taco', 'Beef Taco', 'Fish Taco'],
  'chicken taco': ['Chicken Taco'],
  'beef taco': ['Beef Taco'],
  shawarma: ['Chicken Shawarma', 'Beef Shawarma'],
  'chicken shawarma': ['Chicken Shawarma'],
  'beef shawarma': ['Beef Shawarma'],
  biryani: ['Chicken Biryani', 'Lamb Biryani', 'Vegetable Biryani'],
  'chicken biryani': ['Chicken Biryani'],
  'lamb biryani': ['Lamb Biryani'],
  kabsa: ['Kabsa (chicken)', 'Kabsa (lamb)'],
  'chicken kabsa': ['Kabsa (chicken)'],
  mansaf: ['Mansaf'],
  mandi: ['Mandi (chicken)'],
  maqluba: ['Maqluba'],
  harees: ['Harees'],
  'scrambled eggs': ['Scrambled Eggs'],
  'scrambled egg': ['Scrambled Eggs'],
  'fried eggs': ['Fried Eggs'],
  'boiled eggs': ['Boiled Eggs'],
  omelette: ['Omelette'],
  omelet: ['Omelette'],
  smoothie: ['Protein Smoothie', 'Fruit Smoothie', 'Green Smoothie'],
  'protein smoothie': ['Protein Smoothie'],
  'protein shake': ['Protein Shake'],
  'fruit smoothie': ['Fruit Smoothie'],
  quesadilla: ['Quesadilla (chicken)'],
  // Vegetable aliases
  zucchini: ['Zucchini'],
  courgette: ['Zucchini'],
  eggplant: ['Eggplant'],
  aubergine: ['Eggplant'],
  cauliflower: ['Cauliflower'],
  kale: ['Kale'],
  asparagus: ['Asparagus'],
  'green beans': ['Green Beans'],
  peas: ['Peas'],
  corn: ['Corn'],
  maize: ['Corn'],
  cabbage: ['Cabbage'],
  // Fruit aliases
  grapes: ['Grapes'],
  grape: ['Grapes'],
  pear: ['Pear'],
  pineapple: ['Pineapple'],
  watermelon: ['Watermelon'],
  dates: ['Dates'],
  date: ['Dates'],
  pomegranate: ['Pomegranate'],
  // Chicken cuts
  'chicken wings': ['Chicken Wings (baked)', 'Chicken Wings (fried)'],
  wings: ['Chicken Wings (baked)', 'Chicken Wings (fried)'],
  'chicken wing': ['Chicken Wings (baked)', 'Chicken Wings (fried)'],
  drumstick: ['Chicken Drumstick'],
  'chicken drumstick': ['Chicken Drumstick'],
  // Pork
  bacon: ['Bacon'],
  ham: ['Ham'],
  sausage: ['Sausage'],
  'pork ribs': ['Pork Ribs'],
  ribs: ['Beef Ribs', 'Pork Ribs'],
  // Beef
  ribeye: ['Ribeye Steak'],
  meatballs: ['Meatballs'],
  // Pasta dishes
  bolognese: ['Pasta Bolognese'],
  carbonara: ['Pasta Carbonara'],
  'mac and cheese': ['Mac and Cheese'],
  'mac cheese': ['Mac and Cheese'],
  // Asian
  ramen: ['Ramen'],
  'pad thai': ['Pad Thai'],
  dumplings: ['Dumplings'],
  // Condiments & extras
  baklava: ['Baklava'],
  tahini: ['Tahini'],
  honey: ['Honey'],
  cashews: ['Cashews'],
  pistachios: ['Pistachios'],
}

// ── USDA FoodData Central ─────────────────────────────────────────────────────
// Free government food database — returns actual foods, not branded packaged products.
// DEMO_KEY: 10 req/hr. Register free at https://fdc.nal.usda.gov/api-guide.html for 1,000 req/hr.
// Set VITE_USDA_API_KEY in .env.local with your registered key for production use.
const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY ?? 'DEMO_KEY'
const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1'

// Match nutrients by name (more reliable than ID across API versions)
function getNutrientByName(nutrients: Array<{ nutrientName?: string; nutrientId?: number; value: number; unitName?: string }>, name: string, unit?: string): number {
  // Try strict match first (name + unit)
  if (unit) {
    const strict = nutrients.find((n) =>
      n.nutrientName?.toLowerCase().includes(name.toLowerCase()) &&
      n.unitName?.toUpperCase() === unit.toUpperCase()
    )
    if (strict) return strict.value
  }
  // Fallback: name-only match (handles missing/variant unit labels)
  const loose = nutrients.find((n) =>
    n.nutrientName?.toLowerCase().includes(name.toLowerCase())
  )
  return loose?.value ?? 0
}

async function searchUSDA(query: string): Promise<FoodSearchResult[]> {
  const params = new URLSearchParams({
    query,
    api_key: USDA_API_KEY,
    // SR Legacy = standard ingredients & restaurant items (e.g. real french fries).
    // Survey (FNDDS) = composite dishes from food consumption surveys (e.g. greek salad, stir fry).
    // Both avoid branded packaged products that pollute Open Food Facts results.
    dataType: 'SR Legacy,Survey (FNDDS)',
    pageSize: '10',
  })

  const res = await fetch(`${USDA_BASE}/foods/search?${params}`, {
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) return []

  const data = await res.json()
  const foods: FoodSearchResult[] = (data.foods ?? [])
    .filter((f: any) => {
      // getNutrientByName already falls back to name-only if unit doesn't match
      const cal = getNutrientByName(f.foodNutrients ?? [], 'energy', 'KCAL')
      return cal > 0 && f.description
    })
    .slice(0, 8)
    .map((f: any) => {
      const n = f.foodNutrients ?? []
      // USDA descriptions are ALL-CAPS — convert to title case
      const name = (f.description as string)
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
      return {
        id: `usda_${f.fdcId}`,
        name,
        calories_per_100g: Math.round(getNutrientByName(n, 'energy', 'KCAL')),
        protein_per_100g: Math.round(getNutrientByName(n, 'protein') * 10) / 10,
        carbs_per_100g: Math.round(getNutrientByName(n, 'carbohydrate') * 10) / 10,
        fat_per_100g: Math.round(getNutrientByName(n, 'total lipid') * 10) / 10,
        sugar_per_100g: Math.round(getNutrientByName(n, 'sugars') * 10) / 10,
      }
    })

  return foods
}

// ── Claude AI estimate (Tier 4) ───────────────────────────────────────────────
// Calls the estimate-food Supabase edge function, which uses claude-haiku to
// estimate macros per 100g. Results are flagged as AI estimates in the UI.
async function estimateWithClaude(foodName: string): Promise<FoodSearchResult[]> {
  try {
    const { invokeFunction } = await import('./invokeFunction')
    const result = await invokeFunction<{
      calories: number; protein: number; carbs: number
      fat: number; sugar: number; isAiEstimate: boolean; error?: string
    }>('estimate-food', { foodName })
    if (result.error || !result.calories) return []
    return [{
      id: `ai_${foodName.toLowerCase().replace(/\s+/g, '_')}`,
      name: foodName.replace(/\b\w/g, (c) => c.toUpperCase()),
      calories_per_100g: Math.round(result.calories),
      protein_per_100g: Math.round(result.protein * 10) / 10,
      carbs_per_100g: Math.round(result.carbs * 10) / 10,
      fat_per_100g: Math.round(result.fat * 10) / 10,
      sugar_per_100g: Math.round(result.sugar * 10) / 10,
      source: 'ai_estimate' as const,
      isAiEstimate: true,
    }]
  } catch {
    return []
  }
}

// ── Main search function ──────────────────────────────────────────────────────
export async function searchFoods(query: string): Promise<FoodSearchResult[]> {
  if (!query.trim()) return []
  const q = query.trim().toLowerCase()

  // Tier 1 — Local fallback (alias + direct substring match, instant)
  const aliasTargets = ALIASES[q]
  if (aliasTargets) {
    const aliasMatches = FALLBACK_FOODS.filter((f) =>
      aliasTargets.some((t) => f.name.toLowerCase().includes(t.toLowerCase()))
    ).map((f) => ({ ...f, source: 'local' as const }))
    if (aliasMatches.length > 0) return aliasMatches.slice(0, 8)
  }

  const directMatches = FALLBACK_FOODS
    .filter((f) => f.name.toLowerCase().includes(q))
    .map((f) => ({ ...f, source: 'local' as const }))
  if (directMatches.length >= 2) return directMatches.slice(0, 8)

  // Tier 2 — Nutritionix (restaurant foods, composed dishes)
  try {
    const nix = await searchNutritionix(query.trim())
    if (nix.length >= 2) {
      const seen = new Set(directMatches.map((f) => f.name.toLowerCase()))
      const deduped = nix.filter((u) => !seen.has(u.name.toLowerCase()))
      return [...directMatches, ...deduped].slice(0, 8)
    }
  } catch { /* fall through */ }

  // Tier 3 — USDA FoodData Central (whole ingredients)
  try {
    const usda = await searchUSDA(query.trim())
    if (usda.length > 0) {
      const seen = new Set(directMatches.map((f) => f.name.toLowerCase()))
      const deduped = usda
        .filter((u) => !seen.has(u.name.toLowerCase()))
        .map((u) => ({ ...u, source: 'usda' as const }))
      const merged = [...directMatches, ...deduped].slice(0, 8)
      if (merged.length >= 2) return merged
    }
  } catch { /* fall through */ }

  // Tier 4 — Claude AI estimate (always returns something)
  const aiResults = await estimateWithClaude(query.trim())
  const seen = new Set(directMatches.map((f) => f.name.toLowerCase()))
  const deduped = aiResults.filter((u) => !seen.has(u.name.toLowerCase()))
  const merged = [...directMatches, ...deduped]

  // Tier 4b — If even AI fails, word-split as absolute last resort
  if (merged.length === 0) {
    return FALLBACK_FOODS.filter((f) =>
      q.split(' ').some((word) => word.length > 2 && f.name.toLowerCase().includes(word))
    ).map((f) => ({ ...f, source: 'local' as const })).slice(0, 8)
  }

  return merged.slice(0, 8)
}

export function calculateMacros(food: FoodSearchResult, grams: number) {
  const factor = grams / 100
  return {
    calories: Math.round(food.calories_per_100g * factor),
    protein: Math.round(food.protein_per_100g * factor * 10) / 10,
    carbs: Math.round(food.carbs_per_100g * factor * 10) / 10,
    fat: Math.round(food.fat_per_100g * factor * 10) / 10,
    sugar: Math.round(food.sugar_per_100g * factor * 10) / 10,
  }
}
