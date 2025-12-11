import { getCachedAuthToken } from '@/lib/utils/auth-token';

const BASE_API_URL =
  process.env.NEXT_PUBLIC_SERVER_REST_URL ??
  process.env.SERVER_REST_URL ??
  'https://ftifto-backend.onrender.com';

const API_BASE = `${BASE_API_URL}/api/v1`;

interface Restaurant {
  _id?: string;
  name: string;
  address: string;
  owner: string;
  phone?: string;
  email?: string;
  description?: string;
  image?: string;
  logo?: string;
  commissionRate?: number;
  commissionType?: 'fixed' | 'percentage';
  tax?: number;
  deliveryTime?: number;
  minimumOrder?: number;
  deliveryCharges?: number;
  isAvailable?: boolean;
  isActive?: boolean;
  [key: string]: any;
}

interface GetRestaurantsParams {
  search?: string;
  isActive?: boolean;
  isAvailable?: boolean;
}

const getAuthHeaders = () => {
  const token = getCachedAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const restaurantsService = {
  /**
   * Get all restaurants with optional filters
   */
  async getRestaurants(params?: GetRestaurantsParams): Promise<Restaurant[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined)
      queryParams.append('isActive', String(params.isActive));
    if (params?.isAvailable !== undefined)
      queryParams.append('isAvailable', String(params.isAvailable));

    const url = `${API_BASE}/admin/restaurants${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Failed to fetch restaurants',
      }));
      throw new Error(error.message || 'Failed to fetch restaurants');
    }

    return response.json();
  },

  /**
   * Get a single restaurant by ID
   */
  async getRestaurant(id: string): Promise<Restaurant> {
    const url = `${API_BASE}/admin/restaurants/${id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Failed to fetch restaurant',
      }));
      throw new Error(error.message || 'Failed to fetch restaurant');
    }

    return response.json();
  },

  /**
   * Create a new restaurant
   */
  async createRestaurant(data: Partial<Restaurant>): Promise<Restaurant> {
    const url = `${API_BASE}/admin/restaurants`;

    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Failed to create restaurant',
      }));
      throw new Error(error.message || 'Failed to create restaurant');
    }

    return response.json();
  },

  /**
   * Update a restaurant
   */
  async updateRestaurant(
    id: string,
    data: Partial<Restaurant>
  ): Promise<Restaurant> {
    const url = `${API_BASE}/admin/restaurants/${id}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Failed to update restaurant',
      }));
      throw new Error(error.message || 'Failed to update restaurant');
    }

    return response.json();
  },

  /**
   * Delete a restaurant
   */
  async deleteRestaurant(id: string): Promise<{ message: string }> {
    const url = `${API_BASE}/admin/restaurants/${id}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Failed to delete restaurant',
      }));
      throw new Error(error.message || 'Failed to delete restaurant');
    }

    return response.json();
  },

  /**
   * Toggle restaurant availability
   */
  async toggleRestaurantAvailability(id: string): Promise<Restaurant> {
    const url = `${API_BASE}/admin/restaurants/${id}/toggle`;

    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Failed to toggle restaurant availability',
      }));
      throw new Error(
        error.message || 'Failed to toggle restaurant availability'
      );
    }

    return response.json();
  },
};

