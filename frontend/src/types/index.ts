export type StorageType = 'Refrigerator' | 'Freezer' | 'Pantry' | 'Outside';

export type ItemStatus = 'Fresh' | 'Expiring Soon' | 'Critical' | 'Expired' | 'Consumed' | 'Wasted';

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  notifications_enabled: boolean;
  notification_days_before_expiry: number;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
  description?: string;
}

export interface StorageLocation {
  id: number;
  name: string;
  icon?: string;
  temperature_type?: string;
}

export interface InventoryItem {
  id: number;
  user_id: number;
  food_name: string;
  category_id?: number;
  barcode?: string;
  quantity: number;
  unit: string;
  storage_location: StorageType;
  purchase_date: string;
  expiry_date: string;
  image_url?: string;
  is_leftover: boolean;
  notes?: string;
  status: ItemStatus;
  days_until_expiry: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface InventoryStats {
  total_items: number;
  total_quantity: number;
  expiring_soon_items: number;
  expired_items: number;
  critical_items: number;
  fresh_items: number;
  refrigerator_items: number;
  freezer_items: number;
  pantry_items: number;
  outside_items: number;
  leftover_items: number;
}

export interface Leftover {
  id: number;
  user_id: number;
  inventory_item_id?: number;
  name: string;
  quantity: number;
  unit: string;
  prepared_date: string;
  use_before_date: string;
  storage_location: string;
  notes?: string;
  is_consumed: boolean;
  days_remaining: number;
  created_at: string;
}

export interface RecipeIngredient {
  id: number;
  ingredient_name: string;
  quantity?: number;
  unit?: string;
  is_optional: boolean;
  is_available: boolean;
  is_expiring_soon: boolean;
}

export interface Recipe {
  id: number;
  title: string;
  description?: string;
  cuisine?: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  instructions: string[];
  image_url?: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  servings: number;
  ingredients: RecipeIngredient[];
}

export interface RecipeRecommendation extends Recipe {
  match_percentage: number;
  matched_ingredients: string[];
  missing_ingredients: string[];
  expiring_ingredients_used: string[];
  leftovers_used: string[];
  recommendation_score: number;
  recommendation_reason: string;
}

export interface CookedIngredientResult {
  inventory_item_id: number;
  food_name: string;
  deducted_quantity: number;
  remaining_quantity: number;
  unit: string;
  fully_consumed: boolean;
}

export interface CookRecipeResponse {
  recipe_id: number;
  recipe_title: string;
  consumed_items: CookedIngredientResult[];
  message: string;
}

export interface BarcodeLookup {
  found: boolean;
  barcode: string;
  food_name?: string;
  category_id?: number;
  category_name?: string;
  default_unit?: string;
  typical_shelf_life_days?: number;
  image_url?: string;
  calories_per_100g?: number;
  brand?: string;
  suggested_storage?: StorageType;
}

export interface CategoryWaste {
  category_name: string;
  wasted_count: number;
  wasted_quantity_approx_kg: number;
  percentage_of_total_waste: number;
}

export interface WasteAnalytics {
  timeframe: string;
  total_consumed_items: number;
  total_expired_items: number;
  total_wasted_items: number;
  waste_rate_percentage: number;
  most_wasted_items: { food_name: string; quantity: string; wasted_times: string }[];
  category_breakdown: CategoryWaste[];
  estimated_money_saved_usd: number;
}

export interface WasteRiskPredictionItem {
  food_name: string;
  category_name: string;
  risk_level: 'Low' | 'Moderate' | 'High';
  confidence_score: number;
  predicted_waste_probability: number;
  recommendation: string;
  has_sufficient_data: boolean;
  data_points_count: number;
}

export interface WasteRiskPredictions {
  items: WasteRiskPredictionItem[];
  model_version: string;
  overall_kitchen_risk: string;
}

export interface AssistantMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  suggested_actions?: string[];
  referenced_items?: string[];
  recipe_suggestions?: any[];
}
