import {
  AuthResponse,
  User,
  InventoryItem,
  InventoryStats,
  Leftover,
  Recipe,
  RecipeRecommendation,
  CookRecipeResponse,
  BarcodeLookup,
  WasteAnalytics,
  WasteRiskPredictions,
  Category,
  StorageLocation
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('smart_kitchen_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('smart_kitchen_token', token);
    } else {
      localStorage.removeItem('smart_kitchen_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch (e) {
        // use default error message
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth Endpoints
  async register(data: { email: string; password: string; full_name: string }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Inventory Endpoints
  async getInventory(params?: {
    storage_location?: string;
    status?: string;
    category_id?: number;
    is_leftover?: boolean;
    search?: string;
    sort_by?: string;
  }): Promise<InventoryItem[]> {
    const query = new URLSearchParams();
    if (params?.storage_location && params.storage_location !== 'All') {
      query.append('storage_location', params.storage_location);
    }
    if (params?.status && params.status !== 'All') {
      query.append('status', params.status);
    }
    if (params?.category_id) {
      query.append('category_id', params.category_id.toString());
    }
    if (params?.is_leftover !== undefined) {
      query.append('is_leftover', params.is_leftover.toString());
    }
    if (params?.search) {
      query.append('search', params.search);
    }
    if (params?.sort_by) {
      query.append('sort_by', params.sort_by);
    }

    const qs = query.toString();
    return this.request<InventoryItem[]>(`/inventory${qs ? `?${qs}` : ''}`);
  }

  async getInventoryStats(): Promise<InventoryStats> {
    return this.request<InventoryStats>('/inventory/stats');
  }

  async createInventoryItem(data: Partial<InventoryItem>): Promise<InventoryItem> {
    return this.request<InventoryItem>('/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInventoryItem(id: number, data: Partial<InventoryItem>): Promise<InventoryItem> {
    return this.request<InventoryItem>(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInventoryItem(id: number): Promise<void> {
    return this.request<void>(`/inventory/${id}`, {
      method: 'DELETE',
    });
  }

  async consumeInventoryItem(id: number, data: { quantity?: number; action: string; waste_reason?: string }): Promise<InventoryItem> {
    return this.request<InventoryItem>(`/inventory/${id}/consume`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Leftovers Endpoints
  async getLeftovers(includeConsumed = false): Promise<Leftover[]> {
    return this.request<Leftover[]>(`/leftovers?include_consumed=${includeConsumed}`);
  }

  async createLeftover(data: Partial<Leftover>): Promise<Leftover> {
    return this.request<Leftover>('/leftovers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async consumeLeftover(id: number): Promise<Leftover> {
    return this.request<Leftover>(`/leftovers/${id}/consume`, {
      method: 'POST',
    });
  }

  async deleteLeftover(id: number): Promise<void> {
    return this.request<void>(`/leftovers/${id}`, {
      method: 'DELETE',
    });
  }

  // Recipes Endpoints
  async getRecipes(params?: { cuisine?: string; difficulty?: string; search?: string }): Promise<Recipe[]> {
    const query = new URLSearchParams();
    if (params?.cuisine) query.append('cuisine', params.cuisine);
    if (params?.difficulty) query.append('difficulty', params.difficulty);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return this.request<Recipe[]>(`/recipes${qs ? `?${qs}` : ''}`);
  }

  async getRecipeRecommendations(limit = 10, minScore = 0): Promise<RecipeRecommendation[]> {
    return this.request<RecipeRecommendation[]>(`/recipes/recommendations?limit=${limit}&min_score=${minScore}`);
  }

  async getRecipe(id: number): Promise<Recipe> {
    return this.request<Recipe>(`/recipes/${id}`);
  }

  async cookRecipe(recipeId: number, ingredientIds?: number[]): Promise<CookRecipeResponse> {
    return this.request<CookRecipeResponse>(`/recipes/${recipeId}/cook`, {
      method: 'POST',
      body: JSON.stringify(
        ingredientIds !== undefined ? { ingredient_ids: ingredientIds } : {}
      ),
    });
  }

  // Barcode Scanning Endpoints
  async scanBarcode(barcode: string): Promise<BarcodeLookup> {
    return this.request<BarcodeLookup>('/barcode/scan', {
      method: 'POST',
      body: JSON.stringify({ barcode }),
    });
  }

  // Analytics Endpoints
  async getWasteAnalytics(days = 30): Promise<WasteAnalytics> {
    return this.request<WasteAnalytics>(`/analytics/waste?days=${days}`);
  }

  async getWastePredictions(): Promise<WasteRiskPredictions> {
    return this.request<WasteRiskPredictions>('/analytics/predictions');
  }

  // AI Assistant Endpoints
  async chatAssistant(data: { message: string; conversation_history?: any[] }): Promise<any> {
    return this.request<any>('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Metadata Endpoints
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/categories');
  }

  async getStorageLocations(): Promise<StorageLocation[]> {
    return this.request<StorageLocation[]>('/storage-locations');
  }
}

export const api = new ApiClient();
