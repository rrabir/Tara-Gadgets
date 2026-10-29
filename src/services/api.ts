import {
  Product,
  Category,
  Brand,
  DeliveryZone,
  StoreSettings,
  ContentPage,
  Coupon,
  Order,
  AuditLogEntry,
  User
} from '../types/index.ts';

const API_BASE = '/api';

export const api = {
  // Store Settings
  async getSettings(): Promise<StoreSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to load store settings');
    return res.json();
  },

  async updateSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to update store settings');
    return res.json();
  },

  // Products
  async getProducts(params?: {
    category?: string;
    brand?: string;
    q?: string;
    inStock?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    includeAll?: boolean;
  }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.brand) query.set('brand', params.brand);
    if (params?.q) query.set('q', params.q);
    if (params?.inStock) query.set('inStock', 'true');
    if (params?.minPrice !== undefined) query.set('minPrice', params.minPrice.toString());
    if (params?.maxPrice !== undefined) query.set('maxPrice', params.maxPrice.toString());
    if (params?.sort) query.set('sort', params.sort);
    if (params?.includeAll) query.set('includeAll', 'true');

    const url = `${API_BASE}/products${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProduct(idOrSlug: string): Promise<{ product: Product; related: Product[] }> {
    const res = await fetch(`${API_BASE}/products/${idOrSlug}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create product');
    }
    return res.json();
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update product');
    }
    return res.json();
  },

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete product');
    return res.json();
  },

  async duplicateProduct(id: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}/duplicate`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to duplicate product');
    return res.json();
  },

  async bulkUpdateProducts(ids: string[], action: 'status' | 'delete', value?: string): Promise<{ count: number }> {
    const res = await fetch(`${API_BASE}/products/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, action, value })
    });
    if (!res.ok) throw new Error('Failed bulk update');
    return res.json();
  },

  async adjustStock(productId: string, variantId?: string, changeAmount?: number, reason?: string, staffName?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/inventory/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, variantId, changeAmount, reason, staffName })
    });
    if (!res.ok) throw new Error('Failed to adjust stock');
    return res.json();
  },

  // Categories & Brands
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createCategory(data: { name: string; description?: string }): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json();
  },

  async getBrands(): Promise<Brand[]> {
    const res = await fetch(`${API_BASE}/brands`);
    if (!res.ok) throw new Error('Failed to fetch brands');
    return res.json();
  },

  async createBrand(data: { name: string }): Promise<Brand> {
    const res = await fetch(`${API_BASE}/brands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create brand');
    return res.json();
  },

  // Delivery Zones
  async getDeliveryZones(): Promise<DeliveryZone[]> {
    const res = await fetch(`${API_BASE}/delivery-zones`);
    if (!res.ok) throw new Error('Failed to fetch delivery zones');
    return res.json();
  },

  async updateDeliveryZones(zones: DeliveryZone[]): Promise<DeliveryZone[]> {
    const res = await fetch(`${API_BASE}/delivery-zones`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zones)
    });
    if (!res.ok) throw new Error('Failed to update delivery zones');
    return res.json();
  },

  // Checkout & Validation
  async validateCart(payload: { items: any[]; couponCode?: string; deliveryZoneId?: string }): Promise<{
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
    deliveryZone: DeliveryZone;
    couponApplied: string | null;
    items: any[];
  }> {
    const res = await fetch(`${API_BASE}/checkout/validate-cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Validation failed');
    }
    return res.json();
  },

  async placeOrder(orderData: any): Promise<{ success: boolean; order: Order }> {
    const res = await fetch(`${API_BASE}/checkout/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to place order');
    }
    return res.json();
  },

  async lookupOrder(orderNumber: string, phone: string): Promise<Order> {
    const q = new URLSearchParams({ orderNumber, phone });
    const res = await fetch(`${API_BASE}/orders/lookup?${q.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Order lookup failed');
    }
    return res.json();
  },

  // Orders Management (Admin)
  async getOrders(status?: string): Promise<Order[]> {
    const url = status && status !== 'all' ? `${API_BASE}/orders?status=${status}` : `${API_BASE}/orders`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async getOrder(id: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}`);
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  async updateOrderStatus(id: string, payload: {
    status: string;
    note?: string;
    staffName?: string;
    courierName?: string;
    courierTrackingId?: string;
    courierTrackingUrl?: string;
  }): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update order status');
    }
    return res.json();
  },

  async restockOrder(id: string, payload: { inspectorName?: string; inspectionNotes?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/orders/${id}/restock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to restock order');
    return res.json();
  },

  async recordRefund(id: string, payload: { amount: number; reason: string; staffName?: string }): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to record refund');
    return res.json();
  },

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    const res = await fetch(`${API_BASE}/coupons`);
    if (!res.ok) throw new Error('Failed to fetch coupons');
    return res.json();
  },

  async createCoupon(data: Partial<Coupon>): Promise<Coupon> {
    const res = await fetch(`${API_BASE}/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create coupon');
    return res.json();
  },

  // Content Pages
  async getPages(): Promise<ContentPage[]> {
    const res = await fetch(`${API_BASE}/pages`);
    if (!res.ok) throw new Error('Failed to fetch pages');
    return res.json();
  },

  async getPage(slug: string): Promise<ContentPage> {
    const res = await fetch(`${API_BASE}/pages/${slug}`);
    if (!res.ok) throw new Error('Page not found');
    return res.json();
  },

  async updatePage(id: string, data: Partial<ContentPage>): Promise<ContentPage> {
    const res = await fetch(`${API_BASE}/pages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update page');
    return res.json();
  },

  // Reports & Logs
  async getReportsSummary(): Promise<any> {
    const res = await fetch(`${API_BASE}/reports/summary`);
    if (!res.ok) throw new Error('Failed to fetch reports summary');
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLogEntry[]> {
    const res = await fetch(`${API_BASE}/audit-logs`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  // Users & Owner Setup
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/auth/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async setupOwner(email: string, name?: string): Promise<{ success: boolean; user: User }> {
    const res = await fetch(`${API_BASE}/auth/setup-owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });
    if (!res.ok) throw new Error('Failed to configure owner');
    return res.json();
  },

  // Gemini Chatbot & Voice
  async sendChatMessage(
    messages: { role: 'user' | 'model' | 'assistant'; content: string }[],
    model: string = 'gemini-3.8-flash'
  ): Promise<{ reply: string; model: string }> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, model })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to communicate with Tara AI Concierge');
    }
    return res.json();
  },

  async sendVoiceQuery(prompt: string): Promise<{ reply: string; audioBase64?: string }> {
    const res = await fetch(`${API_BASE}/gemini/voice-query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed voice query');
    }
    return res.json();
  }
};
