import { getCachedAuthToken } from '@/lib/utils/auth-token';

const BASE_API_URL =
  process.env.NEXT_PUBLIC_SERVER_REST_URL ??
  process.env.SERVER_REST_URL ??
  'https://ftifto-backend.onrender.com';

const API_BASE = `${BASE_API_URL}/api/v1`;

interface Product {
  _id?: string;
  title: string;
  description?: string;
  price: number;
  discountedPrice?: number;
  image?: string;
  gallery?: string[];
  restaurant: string;
  categories?: string[];
  tags?: string[];
  variations?: Array<{
    title: string;
    price: number;
    discounted?: number;
  }>;
  addons?: Array<{
    title: string;
    description?: string;
    quantityMinimum?: number;
    quantityMaximum?: number;
    options?: Array<{
      title: string;
      description?: string;
      price: number;
    }>;
  }>;
  available?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  preparationTime?: number;
  stock?: number;
  isOutOfStock?: boolean;
  subCategory?: string;
  nutrition?: {
    calories?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
  };
  [key: string]: any;
}

interface GetProductsParams {
  restaurant?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

interface GetProductsResponse {
  total: number;
  page: number;
  limit: number;
  results: Product[];
}

const getAuthHeaders = () => {
  const token = getCachedAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const productsService = {
  /**
   * Get products with optional filters
   */
  async getProducts(
    params?: GetProductsParams
  ): Promise<GetProductsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.restaurant) queryParams.append('restaurant', params.restaurant);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined)
      queryParams.append('isActive', String(params.isActive));
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));

    const url = `${API_BASE}/products${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Failed to fetch products',
      }));
      throw new Error(error.message || 'Failed to fetch products');
    }

    return response.json();
  },

  /**
   * Get a single product by ID
   */
  async getProduct(id: string): Promise<Product> {
    const url = `${API_BASE}/products/${id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Failed to fetch product',
      }));
      throw new Error(error.message || 'Failed to fetch product');
    }

    return response.json();
  },

  /**
   * Create a new product
   */
  async createProduct(data: Partial<Product>): Promise<Product> {
    const url = `${API_BASE}/products`;

    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Failed to create product',
      }));
      throw new Error(error.message || 'Failed to create product');
    }

    return response.json();
  },

  /**
   * Update a product
   */
  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const url = `${API_BASE}/products/${id}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Failed to update product',
      }));
      throw new Error(error.message || 'Failed to update product');
    }

    return response.json();
  },

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<{ message: string }> {
    const url = `${API_BASE}/products/${id}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Failed to delete product',
      }));
      throw new Error(error.message || 'Failed to delete product');
    }

    return response.json();
  },

  /**
   * Toggle product availability
   */
  async toggleProductAvailability(
    id: string,
    available: boolean
  ): Promise<Product> {
    const url = `${API_BASE}/products/${id}/availability`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ available }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Failed to toggle product availability',
      }));
      throw new Error(
        error.message || 'Failed to toggle product availability'
      );
    }

    return response.json();
  },
};

