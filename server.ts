import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_BRANDS,
  INITIAL_DELIVERY_ZONES,
  INITIAL_SETTINGS,
  INITIAL_COUPONS,
  INITIAL_PAGES,
  INITIAL_ORDERS,
  INITIAL_AUDIT_LOGS
} from './data/initial-data.ts';
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
  User,
  ReturnRequest,
  Review
} from './src/types/index.ts';
import { generateSitemapXml, generateRobotsTxt } from './src/services/seoGenerator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DB_PATH = path.join(__dirname, 'data', 'store-db.json');

// Interface for persistent server state
interface StoreDatabase {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  deliveryZones: DeliveryZone[];
  settings: StoreSettings;
  coupons: Coupon[];
  pages: ContentPage[];
  orders: Order[];
  auditLogs: AuditLogEntry[];
  users: User[];
  returnRequests: ReturnRequest[];
  reviews: Review[];
}

function loadDatabase(): StoreDatabase {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading store database, initializing defaults:', err);
  }

  const initialDb: StoreDatabase = {
    products: INITIAL_PRODUCTS,
    categories: INITIAL_CATEGORIES,
    brands: INITIAL_BRANDS,
    deliveryZones: INITIAL_DELIVERY_ZONES,
    settings: INITIAL_SETTINGS,
    coupons: INITIAL_COUPONS,
    pages: INITIAL_PAGES,
    orders: INITIAL_ORDERS,
    auditLogs: INITIAL_AUDIT_LOGS,
    users: [
      {
        id: 'user-owner-default',
        email: 'rrabir2004@gmail.com',
        name: 'Store Owner',
        role: 'owner',
        isVerified: true,
        createdAt: new Date().toISOString()
      }
    ],
    returnRequests: [],
    reviews: []
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: StoreDatabase): void {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store database:', err);
  }
}

// In-memory reference synced to file
let db = loadDatabase();

// In-memory idempotency cache for orders
const recentOrderHashes = new Map<string, number>();

// Helper: Normalize & validate Bangladesh phone numbers
export function normalizeBdPhone(phone: string): { isValid: boolean; normalized: string } {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  // Match +8801XXXXXXXXX or 01XXXXXXXXX
  const bdRegex = /^(?:\+?88)?(01[3-9]\d{8})$/;
  const match = cleaned.match(bdRegex);
  if (!match) {
    return { isValid: false, normalized: phone };
  }
  return { isValid: true, normalized: match[1] }; // returns standard 11 digits: 017XXXXXXXX
}

function logAudit(action: string, entityType: string, entityId: string, details: string, user?: { id: string; name: string; role: any }) {
  const entry: AuditLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    userId: user?.id || 'system',
    userName: user?.name || 'Authorized Admin',
    userRole: user?.role || 'owner',
    action,
    entityType,
    entityId,
    details
  };
  db.auditLogs.unshift(entry);
  if (db.auditLogs.length > 500) {
    db.auditLogs.pop();
  }
  saveDatabase(db);
}

// Server-side Gemini initialization with required telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

function getStoreSystemInstruction(): string {
  const catalogSummary = db.products
    .filter(p => p.status === 'published')
    .slice(0, 15)
    .map(p => `- ${p.name} (${p.brand}, ${p.category}): ৳${p.salePrice || p.regularPrice}${p.salePrice ? ` (Discounted from ৳${p.regularPrice})` : ''} | Stock: ${p.stock > 0 ? `${p.stock} units in stock` : 'Out of stock'} | Warranty: ${p.warranty}`)
    .join('\n');

  return `You are Tara, the official AI Tech Assistant for Tara Gadgets BD, Bangladesh's leading electronics and gadget store.

STORE DETAILS:
- Store Name: Tara Gadgets BD
- Market: Bangladesh (serves all 64 districts)
- Official Email: taragadgets@gmail.com
- Facebook Page: https://www.facebook.com/taragadgetsbd
- Currency: BDT, always written with the symbol ৳ (e.g. ৳2,499)
- Timezone: Asia/Dhaka

DELIVERY & PAYMENT POLICIES:
- Inside Dhaka: ৳70 delivery fee, delivered within 24-48 hours.
- Outside Dhaka: ৳130 delivery fee, delivered within 2-4 business days (Chittagong, Sylhet, Rajshahi, Khulna, Barisal, Rangpur, Mymensingh, etc.).
- Express Metro Delivery: ৳150 (available in Dhaka metropolitan areas).
- Cash on Delivery (COD) is available nationwide across all 64 districts. Customers can inspect the package on delivery.
- Free shipping on qualifying orders above promotional thresholds.

WARRANTY & RETURNS:
- 7-Day Replacement Guarantee: Hassle-free replacement for any verified manufacturing defect or transit issue.
- Official Warranty: 6 to 12 months official warranty on earbuds, smartwatches, and chargers.
- Authenticity: 100% genuine and sealed products.

CURRENT FEATURED INVENTORY:
${catalogSummary}

GUIDELINES:
- Be polite, tech-savvy, friendly, and helpful.
- Support both English and Bengali / Banglish naturally.
- Always quote exact prices in ৳ based on our store data.
- If recommending gadgets, highlight practical specs (battery life, ANC, IP rating, AMOLED display, fast charging).
- Keep responses concise and easy to read.`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // --- API ROUTES ---

  // Health / Config
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      store: db.settings.storeName,
      time: new Date().toISOString()
    });
  });

  // Store Settings
  app.get('/api/settings', (req: Request, res: Response) => {
    res.json(db.settings);
  });

  app.put('/api/settings', (req: Request, res: Response) => {
    const newSettings = req.body;
    db.settings = { ...db.settings, ...newSettings };
    logAudit('UPDATE_SETTINGS', 'STORE_SETTINGS', 'settings', 'Updated store configuration & contact');
    saveDatabase(db);
    res.json(db.settings);
  });

  // Categories
  app.get('/api/categories', (req: Request, res: Response) => {
    // dynamically recount products
    const cats = db.categories.map(c => ({
      ...c,
      productCount: db.products.filter(p => p.category === c.name && p.status === 'published').length
    }));
    res.json(cats);
  });

  app.post('/api/categories', (req: Request, res: Response) => {
    const { name, description } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      slug,
      description: description?.trim() || '',
      productCount: 0
    };
    db.categories.push(newCat);
    logAudit('CREATE_CATEGORY', 'CATEGORY', newCat.id, `Created category: ${newCat.name}`);
    saveDatabase(db);
    res.status(201).json(newCat);
  });

  // Brands
  app.get('/api/brands', (req: Request, res: Response) => {
    const brands = db.brands.map(b => ({
      ...b,
      productCount: db.products.filter(p => p.brand === b.name && p.status === 'published').length
    }));
    res.json(brands);
  });

  app.post('/api/brands', (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Brand name is required' });
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newBrand: Brand = {
      id: `brand-${Date.now()}`,
      name: name.trim(),
      slug,
      productCount: 0
    };
    db.brands.push(newBrand);
    logAudit('CREATE_BRAND', 'BRAND', newBrand.id, `Created brand: ${newBrand.name}`);
    saveDatabase(db);
    res.status(201).json(newBrand);
  });

  // Delivery Zones
  app.get('/api/delivery-zones', (req: Request, res: Response) => {
    res.json(db.deliveryZones);
  });

  app.put('/api/delivery-zones', (req: Request, res: Response) => {
    const zones = req.body;
    if (Array.isArray(zones)) {
      db.deliveryZones = zones;
      logAudit('UPDATE_DELIVERY_ZONES', 'DELIVERY_ZONES', 'all', 'Updated Bangladesh shipping zones and fees');
      saveDatabase(db);
      return res.json(db.deliveryZones);
    }
    res.status(400).json({ error: 'Invalid delivery zones payload' });
  });

  // Products
  app.get('/api/products', (req: Request, res: Response) => {
    let results = [...db.products];

    // Filter by status (public view only sees published unless includeAll specified for admin)
    const includeAll = req.query.includeAll === 'true';
    if (!includeAll) {
      results = results.filter(p => p.status === 'published');
    }

    // Category filter
    const category = req.query.category as string;
    if (category) {
      results = results.filter(p => p.category.toLowerCase() === category.toLowerCase() || p.slug === category);
    }

    // Brand filter
    const brand = req.query.brand as string;
    if (brand) {
      results = results.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
    }

    // Search query
    const q = (req.query.q as string || '').toLowerCase().trim();
    if (q) {
      results = results.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Availability filter
    const inStock = req.query.inStock === 'true';
    if (inStock) {
      results = results.filter(p => p.stock > 0);
    }

    // Price range
    const minPrice = parseFloat(req.query.minPrice as string);
    const maxPrice = parseFloat(req.query.maxPrice as string);
    if (!isNaN(minPrice)) {
      results = results.filter(p => (p.salePrice || p.regularPrice) >= minPrice);
    }
    if (!isNaN(maxPrice)) {
      results = results.filter(p => (p.salePrice || p.regularPrice) <= maxPrice);
    }

    // Sort
    const sort = req.query.sort as string;
    if (sort === 'price-low') {
      results.sort((a, b) => (a.salePrice || a.regularPrice) - (b.salePrice || b.regularPrice));
    } else if (sort === 'price-high') {
      results.sort((a, b) => (b.salePrice || b.regularPrice) - (a.salePrice || a.regularPrice));
    } else if (sort === 'popular') {
      results.sort((a, b) => b.salesCount - a.salesCount);
    } else {
      // Default: newest
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json(results);
  });

  // Single Product + Related
  app.get('/api/products/:idOrSlug', (req: Request, res: Response) => {
    const param = req.params.idOrSlug;
    const product = db.products.find(p => p.id === param || p.slug === param);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const related = db.products
      .filter(p => p.id !== product.id && p.status === 'published' && (p.category === product.category || p.brand === product.brand))
      .slice(0, 4);

    res.json({ product, related });
  });

  // Create Product (Admin)
  app.post('/api/products', (req: Request, res: Response) => {
    const data = req.body;
    if (!data.name || !data.regularPrice || !data.category) {
      return res.status(400).json({ error: 'Product name, category, and regular price are required' });
    }

    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: data.name,
      slug,
      brand: data.brand || 'Tara Original',
      category: data.category,
      description: data.description || '',
      regularPrice: Number(data.regularPrice),
      salePrice: data.salePrice ? Number(data.salePrice) : undefined,
      sku: data.sku || `TG-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      stock: Number(data.stock) || 0,
      images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [data.coverImage || '/src/assets/images/gadget_anc_earbuds_1793251027311.jpg'],
      coverImage: data.coverImage || data.images?.[0] || '/src/assets/images/gadget_anc_earbuds_1793251027311.jpg',
      videoUrl: data.videoUrl || '',
      variants: Array.isArray(data.variants) ? data.variants : [],
      specifications: Array.isArray(data.specifications) ? data.specifications : [],
      compatibility: Array.isArray(data.compatibility) ? data.compatibility : [],
      warranty: data.warranty || '6 Months Official Replacement Warranty',
      inTheBox: Array.isArray(data.inTheBox) ? data.inTheBox : [],
      deliveryInfo: data.deliveryInfo || 'Fast Cash on Delivery across Bangladesh.',
      status: data.status || 'published',
      isFeatured: Boolean(data.isFeatured),
      isNewArrival: Boolean(data.isNewArrival),
      salesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.products.unshift(newProduct);
    logAudit('CREATE_PRODUCT', 'PRODUCT', newProduct.id, `Created product "${newProduct.name}" (SKU: ${newProduct.sku})`);
    saveDatabase(db);
    res.status(201).json(newProduct);
  });

  // Update Product
  app.put('/api/products/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    const index = db.products.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const current = db.products[index];
    const updated: Product = {
      ...current,
      ...req.body,
      id: current.id,
      updatedAt: new Date().toISOString()
    };

    db.products[index] = updated;
    logAudit('UPDATE_PRODUCT', 'PRODUCT', id, `Updated product "${updated.name}"`);
    saveDatabase(db);
    res.json(updated);
  });

  // Delete / Archive Product
  app.delete('/api/products/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    const index = db.products.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const removed = db.products[index];
    db.products.splice(index, 1);
    logAudit('DELETE_PRODUCT', 'PRODUCT', id, `Removed product "${removed.name}"`);
    saveDatabase(db);
    res.json({ success: true, id });
  });

  // Duplicate Product
  app.post('/api/products/:id/duplicate', (req: Request, res: Response) => {
    const id = req.params.id;
    const product = db.products.find(p => p.id === id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const duplicated: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      name: `${product.name} (Copy)`,
      slug: `${product.slug}-copy-${Date.now()}`,
      sku: `${product.sku}-CP`,
      status: 'draft',
      salesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.products.unshift(duplicated);
    logAudit('DUPLICATE_PRODUCT', 'PRODUCT', duplicated.id, `Duplicated from "${product.name}"`);
    saveDatabase(db);
    res.status(201).json(duplicated);
  });

  // Bulk Product Actions (status change, delete, stock adjust)
  app.post('/api/products/bulk', (req: Request, res: Response) => {
    const { ids, action, value } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No product IDs provided' });
    }

    if (action === 'status') {
      db.products.forEach(p => {
        if (ids.includes(p.id)) {
          p.status = value;
          p.updatedAt = new Date().toISOString();
        }
      });
      logAudit('BULK_STATUS_CHANGE', 'PRODUCTS', ids.join(','), `Changed status of ${ids.length} products to ${value}`);
    } else if (action === 'delete') {
      db.products = db.products.filter(p => !ids.includes(p.id));
      logAudit('BULK_DELETE', 'PRODUCTS', ids.join(','), `Deleted ${ids.length} products`);
    }

    saveDatabase(db);
    res.json({ success: true, count: ids.length });
  });

  // Inventory manual adjustments
  app.post('/api/inventory/adjust', (req: Request, res: Response) => {
    const { productId, variantId, changeAmount, reason, staffName } = req.body;
    const product = db.products.find(p => p.id === productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const change = Number(changeAmount);
    if (isNaN(change)) {
      return res.status(400).json({ error: 'Invalid stock change amount' });
    }

    if (variantId) {
      const variant = product.variants.find(v => v.id === variantId);
      if (variant) {
        variant.stock = Math.max(0, variant.stock + change);
      }
    }
    product.stock = Math.max(0, product.stock + change);
    product.updatedAt = new Date().toISOString();

    logAudit('INVENTORY_ADJUSTMENT', 'PRODUCT', productId, `Stock adjustment of ${change > 0 ? '+' + change : change} by ${staffName || 'Staff'}. Reason: ${reason || 'Manual count audit'}`);
    saveDatabase(db);
    res.json({ success: true, newStock: product.stock });
  });

  // Coupons
  app.get('/api/coupons', (req: Request, res: Response) => {
    res.json(db.coupons);
  });

  app.post('/api/coupons', (req: Request, res: Response) => {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, maxUsageLimit, expiresAt } = req.body;
    if (!code?.trim() || !discountValue) {
      return res.status(400).json({ error: 'Code and discount value are required' });
    }

    const newCoupon: Coupon = {
      id: `cp-${Date.now()}`,
      code: code.trim().toUpperCase(),
      discountType: discountType || 'fixed',
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      usageCount: 0,
      maxUsageLimit: maxUsageLimit ? Number(maxUsageLimit) : undefined,
      expiresAt: expiresAt || '2026-12-31T23:59:59Z',
      isActive: true
    };

    db.coupons.push(newCoupon);
    logAudit('CREATE_COUPON', 'COUPON', newCoupon.id, `Created coupon ${newCoupon.code}`);
    saveDatabase(db);
    res.status(201).json(newCoupon);
  });

  // Validate Cart and calculate totals server-side
  app.post('/api/checkout/validate-cart', (req: Request, res: Response) => {
    const { items, couponCode, deliveryZoneId } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const prod = db.products.find(p => p.id === item.productId);
      if (!prod) {
        return res.status(400).json({ error: `Product no longer exists: ${item.productId}` });
      }

      let price = prod.salePrice || prod.regularPrice;
      let availableStock = prod.stock;
      let variantName = '';

      if (item.variantId) {
        const variant = prod.variants.find(v => v.id === item.variantId);
        if (variant) {
          price = variant.salePrice || variant.price || price;
          availableStock = variant.stock;
          variantName = variant.name;
        }
      }

      if (availableStock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${prod.name}" (${variantName || 'Standard'}). Available: ${availableStock}`
        });
      }

      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        image: prod.coverImage || prod.images[0],
        variantName,
        quantity: item.quantity,
        unitPrice: price,
        totalPrice: itemTotal
      });
    }

    // Determine delivery fee from zone
    const zone = db.deliveryZones.find(z => z.id === deliveryZoneId) || db.deliveryZones[0];
    let shippingFee = zone ? zone.fee : 70;
    if (zone?.freeDeliveryThreshold && subtotal >= zone.freeDeliveryThreshold) {
      shippingFee = 0;
    }

    // Determine coupon discount
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const cleanCode = couponCode.trim().toUpperCase();
      const cp = db.coupons.find(c => c.code === cleanCode && c.isActive);
      if (cp) {
        const isNotExpired = new Date(cp.expiresAt).getTime() > Date.now();
        const meetsMinSpend = subtotal >= cp.minOrderValue;
        const withinLimit = !cp.maxUsageLimit || cp.usageCount < cp.maxUsageLimit;

        if (isNotExpired && meetsMinSpend && withinLimit) {
          appliedCoupon = cp;
          if (cp.discountType === 'fixed') {
            discount = cp.discountValue;
          } else {
            discount = Math.round((subtotal * cp.discountValue) / 100);
            if (cp.maxDiscount && discount > cp.maxDiscount) {
              discount = cp.maxDiscount;
            }
          }
        }
      }
    }

    discount = Math.min(discount, subtotal);
    const total = subtotal + shippingFee - discount;

    res.json({
      subtotal,
      shippingFee,
      discount,
      total,
      deliveryZone: zone,
      couponApplied: appliedCoupon ? appliedCoupon.code : null,
      items: validatedItems
    });
  });

  // Server-side Atomic Order Placement
  app.post('/api/checkout/order', (req: Request, res: Response) => {
    const {
      customerName,
      phone,
      email,
      district,
      area,
      fullAddress,
      orderNotes,
      items,
      couponCode,
      deliveryZoneId,
      idempotencyKey
    } = req.body;

    // Validate Bangladesh Phone
    if (!phone) {
      return res.status(400).json({ error: 'Customer phone number is required' });
    }
    const phoneCheck = normalizeBdPhone(phone);
    if (!phoneCheck.isValid) {
      return res.status(400).json({
        error: 'Please enter a valid 11-digit Bangladesh phone number (e.g., 017XXXXXXXX or +8801XXXXXXXX)'
      });
    }

    if (!customerName?.trim() || !fullAddress?.trim() || !district?.trim()) {
      return res.status(400).json({ error: 'Customer name, district, and full delivery address are required' });
    }

    // Idempotency check against rapid repeated clicks
    const orderHash = `${phoneCheck.normalized}-${items.map((i: any) => `${i.productId}:${i.quantity}`).join(',')}-${idempotencyKey || ''}`;
    const lastPlaced = recentOrderHashes.get(orderHash);
    if (lastPlaced && Date.now() - lastPlaced < 15000) {
      return res.status(429).json({ error: 'Your order was already received. Please check your order confirmation.' });
    }
    recentOrderHashes.set(orderHash, Date.now());

    // Validate Items and atomically check stock
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const prod = db.products.find(p => p.id === item.productId);
      if (!prod) {
        return res.status(400).json({ error: `Product not found: ${item.productId}` });
      }

      let price = prod.salePrice || prod.regularPrice;
      let variantName = '';

      if (item.variantId) {
        const variant = prod.variants.find(v => v.id === item.variantId);
        if (variant) {
          if (variant.stock < item.quantity) {
            return res.status(400).json({ error: `Stock exhausted for variant ${variant.name} of ${prod.name}` });
          }
          price = variant.salePrice || variant.price || price;
          variantName = variant.name;
          variant.stock -= item.quantity;
        }
      }

      if (prod.stock < item.quantity) {
        return res.status(400).json({ error: `Stock exhausted for ${prod.name}. Available: ${prod.stock}` });
      }

      // Atomically decrement stock
      prod.stock -= item.quantity;
      prod.salesCount = (prod.salesCount || 0) + item.quantity;

      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        image: prod.coverImage || prod.images[0],
        variantName,
        quantity: item.quantity,
        unitPrice: price,
        totalPrice: itemTotal
      });
    }

    // Delivery Fee calculation
    const zone = db.deliveryZones.find(z => z.id === deliveryZoneId) || db.deliveryZones[0];
    let shippingFee = zone ? zone.fee : 70;
    if (zone?.freeDeliveryThreshold && subtotal >= zone.freeDeliveryThreshold) {
      shippingFee = 0;
    }

    // Coupon calculation
    let discount = 0;
    let validCouponCode = undefined;
    if (couponCode) {
      const cp = db.coupons.find(c => c.code === couponCode.trim().toUpperCase() && c.isActive);
      if (cp && new Date(cp.expiresAt).getTime() > Date.now() && subtotal >= cp.minOrderValue) {
        if (cp.discountType === 'fixed') {
          discount = cp.discountValue;
        } else {
          discount = Math.round((subtotal * cp.discountValue) / 100);
          if (cp.maxDiscount && discount > cp.maxDiscount) discount = cp.maxDiscount;
        }
        discount = Math.min(discount, subtotal);
        cp.usageCount += 1;
        validCouponCode = cp.code;
      }
    }

    const total = subtotal + shippingFee - discount;
    const orderNumber = `TG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      isGuest: true,
      address: {
        customerName: customerName.trim(),
        phone: phoneCheck.normalized,
        email: email?.trim() || undefined,
        district: district.trim(),
        area: area?.trim() || district.trim(),
        fullAddress: fullAddress.trim(),
        orderNotes: orderNotes?.trim() || undefined
      },
      items: orderItems,
      subtotal,
      shippingFee,
      discount,
      couponCode: validCouponCode,
      total,
      paymentMethod: 'cash-on-delivery',
      paymentStatus: 'cod-pending',
      orderStatus: 'new',
      courierStatus: 'unassigned',
      internalNotes: [`Order placed via website checkout with Cash on Delivery`],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.orders.unshift(newOrder);
    logAudit('CREATE_ORDER', 'ORDER', newOrder.id, `Order ${newOrder.orderNumber} placed by ${newOrder.address.customerName} (Total: ৳${newOrder.total})`);
    saveDatabase(db);

    res.status(201).json({
      success: true,
      order: newOrder
    });
  });

  // Secure Order Lookup (requires orderNumber AND phone to prevent guessing/exposing PII)
  app.get('/api/orders/lookup', (req: Request, res: Response) => {
    const orderNumber = req.query.orderNumber as string;
    const phone = req.query.phone as string;

    if (!orderNumber || !phone) {
      return res.status(400).json({ error: 'Order Number and Phone Number are required for tracking' });
    }

    const phoneCheck = normalizeBdPhone(phone);
    const order = db.orders.find(o =>
      o.orderNumber.toUpperCase() === orderNumber.trim().toUpperCase() &&
      o.address.phone.slice(-10) === phoneCheck.normalized.slice(-10)
    );

    if (!order) {
      return res.status(404).json({ error: 'No matching order found with the provided details' });
    }

    res.json(order);
  });

  // Admin Orders List & Filters
  app.get('/api/orders', (req: Request, res: Response) => {
    const status = req.query.status as string;
    let list = [...db.orders];
    if (status && status !== 'all') {
      list = list.filter(o => o.orderStatus === status);
    }
    res.json(list);
  });

  // Single Order
  app.get('/api/orders/:id', (req: Request, res: Response) => {
    const order = db.orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  });

  // Update Order Status with valid transitions
  app.put('/api/orders/:id/status', (req: Request, res: Response) => {
    const { status, note, staffName, courierName, courierTrackingId, courierTrackingUrl } = req.body;
    const order = db.orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const validStatuses = ['new', 'confirmed', 'packing', 'shipped', 'delivered', 'cancelled', 'failed-delivery', 'returned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const oldStatus = order.orderStatus;
    order.orderStatus = status;

    if (status === 'shipped') {
      order.courierStatus = 'in-transit';
      if (courierName) order.courierName = courierName;
      if (courierTrackingId) order.courierTrackingId = courierTrackingId;
      if (courierTrackingUrl) order.courierTrackingUrl = courierTrackingUrl;
    } else if (status === 'delivered') {
      order.courierStatus = 'collected';
    } else if (status === 'cancelled' || status === 'failed-delivery') {
      // release stock if cancelled before delivery and not yet restocked
      if (!order.isRestocked) {
        order.items.forEach(item => {
          const prod = db.products.find(p => p.id === item.productId);
          if (prod) {
            prod.stock += item.quantity;
            prod.salesCount = Math.max(0, (prod.salesCount || 0) - item.quantity);
          }
        });
        order.isRestocked = true;
      }
    }

    order.updatedAt = new Date().toISOString();
    const noteMsg = `Status changed from "${oldStatus}" to "${status}" by ${staffName || 'Staff'}${note ? `. Note: ${note}` : ''}`;
    order.internalNotes = order.internalNotes || [];
    order.internalNotes.push(noteMsg);

    logAudit('UPDATE_ORDER_STATUS', 'ORDER', order.id, noteMsg);
    saveDatabase(db);
    res.json(order);
  });

  // Confirm restocking of returned order (staff must inspect first)
  app.post('/api/orders/:id/restock', (req: Request, res: Response) => {
    const { inspectorName, inspectionNotes } = req.body;
    const order = db.orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.isRestocked) {
      return res.status(400).json({ error: 'Order items have already been restocked' });
    }

    order.items.forEach(item => {
      const prod = db.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock += item.quantity;
      }
    });

    order.isRestocked = true;
    order.internalNotes = order.internalNotes || [];
    order.internalNotes.push(`Stock restocked after physical inspection by ${inspectorName || 'Staff'}. Notes: ${inspectionNotes || 'Goods verified in resalable condition'}`);

    logAudit('RESTOCK_RETURN', 'ORDER', order.id, `Restocked items for returned order ${order.orderNumber}`);
    saveDatabase(db);
    res.json({ success: true, order });
  });

  // Record Refund (Partial or Full)
  app.post('/api/orders/:id/refund', (req: Request, res: Response) => {
    const { amount, reason, staffName } = req.body;
    const order = db.orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const refundVal = Number(amount);
    if (isNaN(refundVal) || refundVal <= 0 || refundVal > order.total) {
      return res.status(400).json({ error: `Invalid refund amount. Maximum refundable: ৳${order.total}` });
    }

    order.refundAmount = (order.refundAmount || 0) + refundVal;
    order.refundReason = reason || 'Customer claim accepted';
    order.paymentStatus = order.refundAmount >= order.total ? 'refunded' : 'partially-refunded';
    order.internalNotes = order.internalNotes || [];
    order.internalNotes.push(`Recorded refund of ৳${refundVal} by ${staffName || 'Staff'}. Reason: ${reason}`);

    logAudit('RECORD_REFUND', 'ORDER', order.id, `Refund of ৳${refundVal} recorded for ${order.orderNumber}`);
    saveDatabase(db);
    res.json(order);
  });

  // Content Pages
  app.get('/api/pages', (req: Request, res: Response) => {
    res.json(db.pages);
  });

  app.get('/api/pages/:slug', (req: Request, res: Response) => {
    const page = db.pages.find(p => p.slug === req.params.slug);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(page);
  });

  app.put('/api/pages/:id', (req: Request, res: Response) => {
    const page = db.pages.find(p => p.id === req.params.id);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const { title, content, isDraft } = req.body;
    if (title) page.title = title;
    if (content !== undefined) page.content = content;
    if (isDraft !== undefined) page.isDraft = Boolean(isDraft);
    page.updatedAt = new Date().toISOString();

    logAudit('UPDATE_PAGE', 'CONTENT_PAGE', page.id, `Updated page "${page.title}" (Draft: ${page.isDraft})`);
    saveDatabase(db);
    res.json(page);
  });

  // Reports
  app.get('/api/reports/summary', (req: Request, res: Response) => {
    const totalOrders = db.orders.length;
    const deliveredOrders = db.orders.filter(o => o.orderStatus === 'delivered');
    const totalDeliveredRevenue = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
    const totalPendingCod = db.orders
      .filter(o => ['new', 'confirmed', 'packing', 'shipped'].includes(o.orderStatus))
      .reduce((sum, o) => sum + o.total, 0);

    const lowStockProducts = db.products.filter(p => p.stock <= 5);

    res.json({
      totalOrders,
      deliveredOrdersCount: deliveredOrders.length,
      totalDeliveredRevenue,
      totalPendingCod,
      lowStockCount: lowStockProducts.length,
      productsCount: db.products.length,
      courierSettlements: {
        settled: db.orders.filter(o => o.courierStatus === 'settled').length,
        inTransit: db.orders.filter(o => o.courierStatus === 'in-transit').length,
        unassigned: db.orders.filter(o => o.courierStatus === 'unassigned').length
      }
    });
  });

  // Audit Logs
  app.get('/api/audit-logs', (req: Request, res: Response) => {
    res.json(db.auditLogs.slice(0, 100));
  });

  // Admin Auth / Initial Owner Verification
  app.get('/api/auth/users', (req: Request, res: Response) => {
    res.json(db.users);
  });

  app.post('/api/auth/setup-owner', (req: Request, res: Response) => {
    const { email, name } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      existing.role = 'owner';
      existing.isVerified = true;
      saveDatabase(db);
      return res.json({ success: true, user: existing });
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      email: email.trim().toLowerCase(),
      name: name?.trim() || 'Store Owner',
      role: 'owner',
      isVerified: true,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    logAudit('SETUP_OWNER', 'USER', newUser.id, `Designated ${newUser.email} as verified store owner.`);
    saveDatabase(db);
    res.status(201).json({ success: true, user: newUser });
  });

  // Image Upload / Storage
  app.post('/api/upload-image', (req: Request, res: Response) => {
    const { dataUrl, filename } = req.body;
    if (!dataUrl) {
      return res.status(400).json({ error: 'Image data URL required' });
    }
    // Return persistent URL
    res.json({ url: dataUrl });
  });

  // Dynamic Sitemap XML for search engine crawlers
  app.get('/sitemap.xml', (req: Request, res: Response) => {
    const origin = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const xml = generateSitemapXml(db.products, db.pages, db.categories, origin);
    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  });

  // Dynamic robots.txt for search engines
  app.get('/robots.txt', (req: Request, res: Response) => {
    const origin = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const robots = generateRobotsTxt(origin);
    res.header('Content-Type', 'text/plain; charset=utf-8');
    res.send(robots);
  });

  // Gemini Chatbot Endpoint (Multi-turn chat)
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { messages, model = 'gemini-3.8-flash' } = req.body;
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      // Format messages for @google/genai
      const contents = messages.map(m => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content || m.text || '' }]
      }));

      const systemInstruction = getStoreSystemInstruction();

      const response = await ai.models.generateContent({
        model: model === 'gemini-3.1-flash-lite' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction
        }
      });

      const reply = response.text || 'I am Tara from Tara Gadgets BD. How can I assist you with gadgets today?';
      res.json({
        reply,
        model: model === 'gemini-3.1-flash-lite' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash'
      });
    } catch (err: any) {
      console.error('Gemini Chat error:', err);
      res.status(500).json({
        error: err.message || 'Failed to generate response from Gemini'
      });
    }
  });

  // Gemini Voice Query & Speech synthesis
  app.post('/api/gemini/voice-query', async (req: Request, res: Response) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const systemInstruction = getStoreSystemInstruction() + '\nKeep your answer short, concise (1-2 sentences), natural for audio speech.';

      const textResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { systemInstruction }
      });

      const replyText = textResponse.text || 'Hello! Welcome to Tara Gadgets BD. How can I assist you?';

      let base64Audio = null;
      try {
        const speechResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [{ text: replyText }]
            }
          ],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Zephyr' }
              }
            }
          }
        });
        base64Audio = speechResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
      } catch (speechErr) {
        console.warn('TTS generation notice:', speechErr);
      }

      res.json({
        reply: replyText,
        audioBase64: base64Audio
      });
    } catch (err: any) {
      console.error('Voice query error:', err);
      res.status(500).json({ error: err.message || 'Failed voice query' });
    }
  });

  // Mount Vite middleware in development
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const httpServer = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    const { pathname } = new URL(request.url || '', `http://${request.headers.host}`);
    if (pathname === '/api/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('[Gemini Live] Client connected to live voice');
    let session: any = null;

    try {
      session = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: `You are Tara, the live real-time voice assistant for Tara Gadgets BD, Bangladesh's gadget store.
Keep answers concise, conversational, and direct (1-2 short sentences max). Mention prices in ৳ (BDT) and Cash on Delivery across Bangladesh. Friendly tech expert persona.`
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
          onclose: () => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'session_closed' }));
            }
          },
          onerror: (err) => {
            console.error('[Gemini Live] Session error:', err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ error: err?.message || 'Live session error' }));
            }
          }
        }
      });

      clientWs.on('message', (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          if (parsed.audio && session) {
            session.sendRealtimeInput({
              audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' }
            });
          } else if (parsed.text && session) {
            session.sendRealtimeInput({
              text: parsed.text
            });
          }
        } catch (e) {
          console.error('[Gemini Live] Error forwarding input:', e);
        }
      });

      clientWs.on('close', () => {
        console.log('[Gemini Live] Client disconnected');
        if (session && typeof session.close === 'function') {
          session.close().catch(() => {});
        }
      });

      clientWs.on('error', (err) => {
        console.error('[Gemini Live] Client socket error:', err);
        if (session && typeof session.close === 'function') {
          session.close().catch(() => {});
        }
      });

    } catch (err: any) {
      console.error('[Gemini Live] Failed to connect session:', err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ error: err.message || 'Failed to start Gemini Live' }));
      }
    }
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[Tara Gadgets Server] Running at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
