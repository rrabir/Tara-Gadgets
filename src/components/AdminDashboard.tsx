import React, { useState, useEffect } from 'react';
import {
  X,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Settings,
  Tag,
  Truck,
  FileText,
  BarChart3,
  History,
  CreditCard,
  Plus,
  Search,
  Copy,
  Edit,
  Trash2,
  Printer,
  CheckCircle2,
  AlertCircle,
  Download,
  Users,
  ShieldCheck,
  RefreshCw,
  Eye,
  Check,
  Globe,
  ExternalLink,
  FileCode
} from 'lucide-react';
import {
  Product,
  Category,
  Brand,
  Order,
  StoreSettings,
  ContentPage,
  Coupon,
  DeliveryZone,
  AuditLogEntry,
  User,
  UserRole
} from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductFormModal } from './ProductFormModal.tsx';
import { InvoiceModal } from './InvoiceModal.tsx';
import { generateSitemapXml, generateRobotsTxt } from '../services/seoGenerator.ts';
import { useToast } from '../context/ToastContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { firestoreService } from '../services/firebase.ts';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
  onUpdateSettings: (settings: Partial<StoreSettings>) => void;
  categories: Category[];
  brands: Brand[];
  onRefreshData: () => void;
}

type AdminTab =
  | 'overview'
  | 'products'
  | 'orders'
  | 'inventory'
  | 'categories'
  | 'coupons'
  | 'delivery'
  | 'pages'
  | 'reports'
  | 'settings'
  | 'payments'
  | 'audit';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  categories,
  brands,
  onRefreshData
}) => {
  const toast = useToast();
  const { currentUser: authUser, firebaseUser } = useAuth();
  if (!isOpen) return null;

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Authenticated Admin User State (from Firebase Auth)
  const currentUser = authUser || {
    id: 'user-owner-default',
    email: 'rrabir2004@gmail.com',
    name: 'Verified Owner (rrabir2004@gmail.com)',
    role: 'owner',
    isVerified: true,
    createdAt: new Date().toISOString()
  };

  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Modals inside Admin
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // Filter States
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Manual Inventory Adjustment State
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);
  const [stockChangeVal, setStockChangeVal] = useState('5');
  const [stockChangeReason, setStockChangeReason] = useState('Physical shipment verified');

  // Order Action State
  const [activeOrderAction, setActiveOrderAction] = useState<Order | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<string>('confirmed');
  const [orderNote, setOrderNote] = useState('');
  const [courierName, setCourierName] = useState('Steadfast Courier');
  const [courierTrackingId, setCourierTrackingId] = useState('');
  const [courierTrackingUrl, setCourierTrackingUrl] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  // Category & Brand Form State
  const [newCatName, setNewCatName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');

  // Coupon Form State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponValue, setNewCouponValue] = useState('150');
  const [newCouponMin, setNewCouponMin] = useState('2000');

  // Load all admin data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [prods, ords, cps, pgs, zones, logs, sum] = await Promise.all([
        api.getProducts({ includeAll: true }),
        api.getOrders(),
        api.getCoupons(),
        api.getPages(),
        api.getDeliveryZones(),
        api.getAuditLogs(),
        api.getReportsSummary()
      ]);
      setProducts(prods);
      setOrders(ords);
      setCoupons(cps);
      setPages(pgs);
      setDeliveryZones(zones);
      setAuditLogs(logs);
      setSummary(sum);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchQ =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase());
    const matchCat = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    return matchQ && matchCat;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    return orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
  });

  // Product Actions
  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (editingProduct) {
        const updated = await api.updateProduct(editingProduct.id, productData);
        firestoreService.setProduct(updated).catch(() => {});
        toast.success(
          'Product Updated',
          `"${productData.name || editingProduct.name}" changes were saved to inventory.`
        );
      } else {
        const created = await api.createProduct(productData);
        firestoreService.setProduct(created).catch(() => {});
        toast.success(
          'Product Published',
          `"${productData.name}" has been added to Tara Gadgets BD catalog.`
        );
      }
      loadAdminData();
      onRefreshData();
    } catch (err: any) {
      toast.error('Save Failed', err.message || 'Could not save product.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to remove this product?')) {
      try {
        await api.deleteProduct(id);
        firestoreService.deleteProduct(id).catch(() => {});
        toast.info('Product Removed', 'The item has been deleted from the catalog.');
        loadAdminData();
        onRefreshData();
      } catch (err: any) {
        toast.error('Delete Failed', err.message || 'Could not delete product.');
      }
    }
  };

  const handleDuplicateProduct = async (id: string) => {
    try {
      await api.duplicateProduct(id);
      toast.success('Product Duplicated', 'A copy of the product was created in draft status.');
      loadAdminData();
      onRefreshData();
    } catch (err: any) {
      toast.error('Duplicate Failed', err.message || 'Could not duplicate product.');
    }
  };

  const handleBulkStatus = async (status: string) => {
    if (selectedProductIds.length === 0) return;
    try {
      await api.bulkUpdateProducts(selectedProductIds, 'status', status);
      toast.success(
        'Bulk Status Updated',
        `Changed status to "${status}" for ${selectedProductIds.length} products.`
      );
      setSelectedProductIds([]);
      loadAdminData();
      onRefreshData();
    } catch (err: any) {
      toast.error('Bulk Update Failed', err.message || 'Error updating products.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    if (confirm(`Delete ${selectedProductIds.length} selected products?`)) {
      try {
        await api.bulkUpdateProducts(selectedProductIds, 'delete');
        toast.info(
          'Bulk Delete Completed',
          `Successfully removed ${selectedProductIds.length} products.`
        );
        setSelectedProductIds([]);
        loadAdminData();
        onRefreshData();
      } catch (err: any) {
        toast.error('Bulk Delete Failed', err.message || 'Error deleting products.');
      }
    }
  };

  const handleAdjustStock = async () => {
    if (!stockModalProduct) return;
    try {
      const change = Number(stockChangeVal);
      await api.adjustStock(
        stockModalProduct.id,
        undefined,
        change,
        stockChangeReason,
        currentUser?.name
      );
      toast.success(
        'Stock Adjusted',
        `${change >= 0 ? '+' : ''}${change} units recorded for "${stockModalProduct.name}". Audit logged.`
      );
      setStockModalProduct(null);
      loadAdminData();
      onRefreshData();
    } catch (err: any) {
      toast.error('Adjustment Failed', err.message || 'Stock adjustment failed.');
    }
  };

  // Order Actions
  const handleUpdateOrderStatus = async () => {
    if (!activeOrderAction) return;
    try {
      await api.updateOrderStatus(activeOrderAction.id, {
        status: newOrderStatus,
        note: orderNote,
        staffName: currentUser?.name,
        courierName: newOrderStatus === 'shipped' ? courierName : undefined,
        courierTrackingId: newOrderStatus === 'shipped' ? courierTrackingId : undefined,
        courierTrackingUrl: newOrderStatus === 'shipped' ? courierTrackingUrl : undefined
      });
      firestoreService.updateOrderStatus(activeOrderAction.id, newOrderStatus, orderNote).catch(() => {});
      toast.order(
        `Order ${activeOrderAction.orderNumber}: ${newOrderStatus.toUpperCase()}`,
        `Status updated to "${newOrderStatus}". Real-time tracking is active.`
      );
      setActiveOrderAction(null);
      setOrderNote('');
      loadAdminData();
    } catch (err: any) {
      toast.error('Order Update Failed', err.message || 'Could not update order status.');
    }
  };

  const handleRestockOrder = async (orderId: string) => {
    if (confirm('Confirm items have been received and inspected before restocking?')) {
      try {
        await api.restockOrder(orderId, {
          inspectorName: currentUser?.name,
          inspectionNotes: 'Goods inspected by staff in undamaged condition.'
        });
        toast.success(
          'Restock Completed',
          `Order #${orderId.slice(-6)} items were returned to inventory counts.`
        );
        loadAdminData();
        onRefreshData();
      } catch (err: any) {
        toast.error('Restock Failed', err.message || 'Could not restock order.');
      }
    }
  };

  const handleRecordRefund = async (orderId: string) => {
    if (!refundAmount) return;
    try {
      await api.recordRefund(orderId, {
        amount: Number(refundAmount),
        reason: refundReason,
        staffName: currentUser?.name
      });
      toast.info(
        'Refund Logged',
        `৳${refundAmount} refund registered for order #${orderId.slice(-6)}.`
      );
      setRefundAmount('');
      setRefundReason('');
      loadAdminData();
    } catch (err: any) {
      toast.error('Refund Failed', err.message || 'Could not record refund.');
    }
  };

  // Category & Brand Creation
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await api.createCategory({ name: newCatName.trim() });
      toast.success('Category Added', `Category "${newCatName.trim()}" is ready.`);
      setNewCatName('');
      loadAdminData();
      onRefreshData();
    } catch (err: any) {
      toast.error('Error', err.message || 'Could not add category.');
    }
  };

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    try {
      await api.createBrand({ name: newBrandName.trim() });
      toast.success('Brand Added', `Brand "${newBrandName.trim()}" is ready.`);
      setNewBrandName('');
      loadAdminData();
      onRefreshData();
    } catch (err: any) {
      toast.error('Error', err.message || 'Could not add brand.');
    }
  };

  // Coupon Creation
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    try {
      await api.createCoupon({
        code: newCouponCode.trim(),
        discountType: 'fixed',
        discountValue: Number(newCouponValue),
        minOrderValue: Number(newCouponMin)
      });
      toast.success('Coupon Active', `Promo code "${newCouponCode.trim().toUpperCase()}" created.`);
      setNewCouponCode('');
      loadAdminData();
    } catch (err: any) {
      toast.error('Coupon Failed', err.message || 'Could not create coupon.');
    }
  };

  // Page Update
  const handleUpdatePageDraft = async (id: string, isDraft: boolean) => {
    try {
      await api.updatePage(id, { isDraft });
      toast.info(
        'Page Visibility Updated',
        `Policy page is now ${isDraft ? 'Draft (Hidden)' : 'Published'}.`
      );
      loadAdminData();
    } catch (err: any) {
      toast.error('Page Update Failed', err.message || 'Could not update page.');
    }
  };

  // Delivery Zones Update
  const handleUpdateZoneFee = async (id: string, fee: number) => {
    try {
      const updated = deliveryZones.map((z) => (z.id === id ? { ...z, fee } : z));
      await api.updateDeliveryZones(updated);
      setDeliveryZones(updated);
      toast.success('Shipping Fee Saved', `Updated zone shipping charge to ৳${fee}.`);
    } catch (err: any) {
      toast.error('Error', err.message || 'Could not update delivery fee.');
    }
  };

  // Export CSV
  const exportProductsCSV = () => {
    const headers = ['ID', 'Name', 'SKU', 'Brand', 'Category', 'Regular Price', 'Sale Price', 'Stock', 'Status'];
    const rows = products.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku,
      p.brand,
      p.category,
      p.regularPrice,
      p.salePrice || '',
      p.stock,
      p.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tara_gadgets_catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Catalog Exported', 'CSV spreadsheet file downloaded.');
  };

  // Download Sitemap XML
  const downloadSitemapXml = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://taragadgetsbd.com';
    const xml = generateSitemapXml(products, pages, categories, origin);
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Sitemap Generated', 'sitemap.xml downloaded for Google Search Console.');
  };

  // Download Robots.txt
  const downloadRobotsTxt = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://taragadgetsbd.com';
    const txt = generateRobotsTxt(origin);
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'robots.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Robots.txt Generated', 'robots.txt file downloaded.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex">
      <div className="w-full h-full bg-slate-100 flex flex-col md:flex-row overflow-hidden">
        
        {/* Admin Sidebar Navigation */}
        <div className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0">
          <div>
            {/* Sidebar Brand Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
                  <span>{settings.storeName}</span>
                  <span className="text-[10px] bg-blue-600 text-white font-semibold px-1.5 py-0.2 rounded">ADMIN</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[170px]">
                  {currentUser?.name}
                </div>
              </div>
              <button
                onClick={onClose}
                className="md:hidden text-slate-400 hover:text-white p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Menu */}
            <nav className="p-2 space-y-1 text-xs font-semibold overflow-y-auto max-h-[calc(100vh-140px)]">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'overview' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'products' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4" />
                  <span>Products</span>
                </div>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                  {products.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'orders' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Orders (COD)</span>
                </div>
                <span className="text-[10px] bg-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded font-bold">
                  {orders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'inventory' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Inventory & Alerts</span>
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'categories' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Categories & Brands</span>
              </button>

              <button
                onClick={() => setActiveTab('coupons')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'coupons' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Coupons & Offers</span>
              </button>

              <button
                onClick={() => setActiveTab('delivery')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'delivery' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Delivery Zones</span>
              </button>

              <button
                onClick={() => setActiveTab('pages')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'pages' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Content & Policies</span>
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'reports' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Reports & Analytics</span>
              </button>

              <button
                onClick={() => setActiveTab('payments')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'payments' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Payment Gateways</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'settings' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Store Settings</span>
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'audit' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Audit Activity Log</span>
              </button>
            </nav>
          </div>

          {/* Sidebar Bottom Exit */}
          <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Exit Admin Mode:</span>
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded text-xs cursor-pointer"
            >
              Back to Store
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Top Bar */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-slate-900 capitalize">
                {activeTab.replace('-', ' ')}
              </h1>
              {loading && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductFormOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Gadget</span>
              </button>

              <button
                onClick={onClose}
                className="hidden md:flex text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tab Content Panels */}
          <div className="p-4 sm:p-6 space-y-6">
            
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* KPI Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-semibold text-slate-500">Delivered Revenue</div>
                    <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                      ৳{(summary?.totalDeliveredRevenue || 0).toLocaleString()}
                    </div>
                    <div className="text-[11px] text-emerald-600 mt-1 font-medium">
                      {summary?.deliveredOrdersCount || 0} Delivered orders
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-semibold text-slate-500">Pending COD In-Transit</div>
                    <div className="text-2xl font-extrabold text-blue-600 mt-1 tabular-nums">
                      ৳{(summary?.totalPendingCod || 0).toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-medium">
                      Awaiting courier settlement
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-semibold text-slate-500">Total Orders Placed</div>
                    <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                      {orders.length}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-medium">
                      All Bangladesh districts
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-semibold text-slate-500">Low Stock Warnings</div>
                    <div className="text-2xl font-extrabold text-amber-600 mt-1 tabular-nums">
                      {summary?.lowStockCount || 0}
                    </div>
                    <div className="text-[11px] text-amber-700 mt-1 font-medium">
                      ≤ 5 units remaining
                    </div>
                  </div>
                </div>

                {/* Recent Orders Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-slate-900">Recent Customer Orders</div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      View All Orders
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Order ID</th>
                          <th className="p-3">Customer</th>
                          <th className="p-3">District</th>
                          <th className="p-3">Total (৳)</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Invoice</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.slice(0, 5).map((o) => (
                          <tr key={o.id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                            <td className="p-3 font-medium text-slate-800">{o.address.customerName}</td>
                            <td className="p-3 text-slate-600">{o.address.district}</td>
                            <td className="p-3 font-bold tabular-nums">৳{o.total.toLocaleString()}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold capitalize ${
                                o.orderStatus === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : o.orderStatus === 'shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-800'
                              }`}>
                                {o.orderStatus}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setInvoiceOrder(o)}
                                className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PRODUCTS TAB */}
            {activeTab === 'products' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
                {/* Search, Filter & Bulk bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                      <input
                        type="text"
                        placeholder="Search title, SKU, brand..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>

                    <select
                      value={productCategoryFilter}
                      onChange={(e) => setProductCategoryFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {selectedProductIds.length > 0 && (
                      <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg text-xs">
                        <span className="font-bold">{selectedProductIds.length} selected</span>
                        <button
                          onClick={() => handleBulkStatus('published')}
                          className="text-blue-600 font-semibold hover:underline"
                        >
                          Publish
                        </button>
                        <button
                          onClick={() => handleBulkStatus('draft')}
                          className="text-slate-600 font-semibold hover:underline"
                        >
                          Draft
                        </button>
                        <button
                          onClick={handleBulkDelete}
                          className="text-rose-600 font-semibold hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    )}

                    <button
                      onClick={exportProductsCSV}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Products Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3 w-8">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedProductIds(filteredProducts.map((p) => p.id));
                              else setSelectedProductIds([]);
                            }}
                          />
                        </th>
                        <th className="p-3">Product</th>
                        <th className="p-3">SKU</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Price (৳)</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedProductIds.includes(p.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedProductIds([...selectedProductIds, p.id]);
                                else setSelectedProductIds(selectedProductIds.filter((id) => id !== p.id));
                              }}
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <img src={p.coverImage} alt={p.name} className="w-10 h-10 object-cover rounded bg-white border border-slate-200 shrink-0" />
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate max-w-xs">{p.name}</div>
                                <div className="text-[11px] text-slate-400">{p.brand}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-slate-500">{p.sku}</td>
                          <td className="p-3 text-slate-600">{p.category}</td>
                          <td className="p-3 font-bold tabular-nums">
                            ৳{(p.salePrice || p.regularPrice).toLocaleString()}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => setStockModalProduct(p)}
                              className={`cursor-pointer hover:underline tabular-nums font-bold ${
                                p.stock <= 5 ? 'text-amber-600' : 'text-slate-800'
                              }`}
                            >
                              {p.stock} units
                            </button>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              p.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'draft'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setProductFormOpen(true);
                                }}
                                className="p-1 text-slate-600 hover:text-blue-600 cursor-pointer"
                                title="Edit"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDuplicateProduct(p.id)}
                                className="p-1 text-slate-600 hover:text-blue-600 cursor-pointer"
                                title="Duplicate"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
                {/* Status Bar Filter */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    {['all', 'new', 'confirmed', 'packing', 'shipped', 'delivered', 'cancelled', 'returned'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                          orderStatusFilter === st
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <div className="text-xs text-slate-500">
                    Showing {filteredOrders.length} orders
                  </div>
                </div>

                {/* Orders Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Customer & Phone</th>
                        <th className="p-3">Address</th>
                        <th className="p-3">Items</th>
                        <th className="p-3">Total (৳)</th>
                        <th className="p-3">Fulfillment Status</th>
                        <th className="p-3">Courier</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                          <td className="p-3">
                            <div className="font-bold text-slate-800">{o.address.customerName}</div>
                            <div className="font-medium text-slate-600">{o.address.phone}</div>
                          </td>
                          <td className="p-3 max-w-xs text-slate-600">
                            <div className="font-semibold text-slate-800">{o.address.district}</div>
                            <div className="truncate text-[11px]">{o.address.fullAddress}</div>
                          </td>
                          <td className="p-3 text-slate-700">
                            {o.items.map((i, idx) => (
                              <div key={idx} className="truncate max-w-[180px]">
                                {i.quantity}x {i.productName}
                              </div>
                            ))}
                          </td>
                          <td className="p-3 font-bold tabular-nums">৳{o.total.toLocaleString()}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              o.orderStatus === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : o.orderStatus === 'shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : o.orderStatus === 'cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}>
                              {o.orderStatus}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600">
                            {o.courierName ? (
                              <div>
                                <div className="font-semibold">{o.courierName}</div>
                                {o.courierTrackingId && <div className="font-mono text-[10px]">{o.courierTrackingId}</div>}
                              </div>
                            ) : (
                              <span className="text-slate-400">Unassigned</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setActiveOrderAction(o);
                                  setNewOrderStatus(o.orderStatus);
                                }}
                                className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                              >
                                Manage
                              </button>
                              <button
                                onClick={() => setInvoiceOrder(o)}
                                className="text-slate-500 hover:text-slate-700 cursor-pointer"
                                title="Print Invoice"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. INVENTORY TAB */}
            {activeTab === 'inventory' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Inventory Stock & Auditable Adjustments</h3>
                    <p className="text-xs text-slate-500">
                      Every stock change is recorded to the immutable audit activity log.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Product Name</th>
                        <th className="p-3">SKU</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Stock Units</th>
                        <th className="p-3">Stock Health</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map((p) => (
                        <tr key={p.id}>
                          <td className="p-3 font-bold text-slate-900">{p.name}</td>
                          <td className="p-3 font-mono text-slate-500">{p.sku}</td>
                          <td className="p-3 text-slate-600">{p.category}</td>
                          <td className="p-3 font-bold tabular-nums text-sm">{p.stock}</td>
                          <td className="p-3">
                            {p.stock <= 5 ? (
                              <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                                Low Stock
                              </span>
                            ) : (
                              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                                Healthy
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setStockModalProduct(p)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-2.5 py-1 rounded text-xs cursor-pointer"
                            >
                              Adjust Count
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. CATEGORIES & BRANDS TAB */}
            {activeTab === 'categories' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Categories */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Manage Categories</h3>
                  <form onSubmit={handleCreateCategory} className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Category name (e.g. Smart Audio)"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                    >
                      Add Category
                    </button>
                  </form>

                  <div className="divide-y divide-slate-100">
                    {categories.map((c) => (
                      <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{c.name}</span>
                        <span className="text-slate-400">{c.productCount || 0} products</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Manage Brands</h3>
                  <form onSubmit={handleCreateBrand} className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Brand name (e.g. Apex Tech)"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                    >
                      Add Brand
                    </button>
                  </form>

                  <div className="divide-y divide-slate-100">
                    {brands.map((b) => (
                      <div key={b.id} className="py-2.5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{b.name}</span>
                        <span className="text-slate-400">{b.productCount || 0} products</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 6. COUPONS TAB */}
            {activeTab === 'coupons' && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Coupons & Promo Codes</h3>
                <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Coupon Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TARA200"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs uppercase text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Discount (৳ Fixed)</label>
                    <input
                      type="number"
                      required
                      value={newCouponValue}
                      onChange={(e) => setNewCouponValue(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Min Order Value (৳)</label>
                    <input
                      type="number"
                      value={newCouponMin}
                      onChange={(e) => setNewCouponMin(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs cursor-pointer"
                    >
                      Create Coupon
                    </button>
                  </div>
                </form>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Code</th>
                        <th className="p-3">Discount</th>
                        <th className="p-3">Min Order</th>
                        <th className="p-3">Redeemed Count</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {coupons.map((cp) => (
                        <tr key={cp.id}>
                          <td className="p-3 font-mono font-bold text-blue-600">{cp.code}</td>
                          <td className="p-3 font-semibold">
                            {cp.discountType === 'fixed' ? `৳${cp.discountValue}` : `${cp.discountValue}%`}
                          </td>
                          <td className="p-3 tabular-nums">৳{cp.minOrderValue.toLocaleString()}</td>
                          <td className="p-3 tabular-nums">{cp.usageCount} times</td>
                          <td className="p-3">
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 7. DELIVERY ZONES TAB */}
            {activeTab === 'delivery' && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Bangladesh Delivery Zones & Rates</h3>
                  <p className="text-xs text-slate-500">
                    Configure official shipping fees charged to customers at checkout. Do not hardcode rates.
                  </p>
                </div>

                <div className="space-y-3">
                  {deliveryZones.map((zone) => (
                    <div key={zone.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{zone.name}</div>
                        <div className="text-xs text-slate-500">{zone.estimatedDays}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-700">Fee (৳):</span>
                        <input
                          type="number"
                          value={zone.fee}
                          onChange={(e) => handleUpdateZoneFee(zone.id, Number(e.target.value))}
                          className="w-24 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold tabular-nums"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. CONTENT & POLICIES TAB */}
            {activeTab === 'pages' && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Content Pages & Legal Policies</h3>
                  <p className="text-xs text-slate-500">
                    Keep policy text marked as draft until the store owner reviews and approves it.
                  </p>
                </div>

                <div className="divide-y divide-slate-200">
                  {pages.map((p) => (
                    <div key={p.id} className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{p.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">Slug: /{p.slug}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          p.isDraft ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {p.isDraft ? 'Draft (Review Pending)' : 'Published (Live)'}
                        </span>

                        <button
                          onClick={() => handleUpdatePageDraft(p.id, !p.isDraft)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          {p.isDraft ? 'Mark as Published' : 'Switch to Draft'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9. REPORTS TAB */}
            {activeTab === 'reports' && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Real Sales Records & Settlement Summary</h3>
                  <p className="text-xs text-slate-500">
                    Real store transaction figures. Separates collected cash from pending COD.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-xs font-bold text-slate-500">Collected Cash Revenue</div>
                    <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
                      ৳{(summary?.totalDeliveredRevenue || 0).toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Confirmed delivered items only</div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-xs font-bold text-slate-500">Outstanding COD In Transit</div>
                    <div className="text-2xl font-black text-blue-600 mt-1 tabular-nums">
                      ৳{(summary?.totalPendingCod || 0).toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">In transit via courier partners</div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-xs font-bold text-slate-500">Courier Settlement Rate</div>
                    <div className="text-2xl font-black text-emerald-600 mt-1 tabular-nums">
                      {summary?.courierSettlements?.settled || 0} Parcels
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Settled and banked</div>
                  </div>
                </div>

                {/* Best Selling Products */}
                <div>
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Best-Selling Products by Real Verified Sales
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Rank</th>
                          <th className="p-3">Product Title</th>
                          <th className="p-3">Units Sold</th>
                          <th className="p-3">Stock Left</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {products
                          .slice()
                          .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
                          .slice(0, 5)
                          .map((p, idx) => (
                            <tr key={p.id}>
                              <td className="p-3 font-bold text-blue-600">#{idx + 1}</td>
                              <td className="p-3 font-semibold text-slate-900">{p.name}</td>
                              <td className="p-3 font-bold tabular-nums">{p.salesCount || 0} units</td>
                              <td className="p-3 text-slate-600 tabular-nums">{p.stock} in stock</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 10. PAYMENTS TAB */}
            {activeTab === 'payments' && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Payment Providers & Verification Status</h3>
                  <p className="text-xs text-slate-500">
                    Online gateways remain safely disabled until verified merchant credentials are provided.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* COD (Active) */}
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                        <span>Cash on Delivery (COD)</span>
                        <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded">
                          ACTIVE
                        </span>
                      </div>
                      <div className="text-xs text-emerald-700 mt-1">
                        Nationwide courier parcel delivery with cash collection upon doorstep receipt.
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-800">Enabled by Default</span>
                  </div>

                  {/* SSLCOMMERZ */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <span>SSLCOMMERZ Payment Gateway</span>
                        <span className="text-[10px] bg-slate-200 text-slate-600 font-medium px-1.5 py-0.2 rounded">
                          Not configured
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Requires Store ID and Store Password from merchant.sslcommerz.com.
                      </div>
                    </div>
                    <button
                      disabled
                      className="bg-slate-200 text-slate-500 font-semibold px-3 py-1.5 rounded-lg text-xs cursor-not-allowed"
                    >
                      Awaiting Credentials
                    </button>
                  </div>

                  {/* bKash Merchant API */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <span>bKash Direct Merchant Checkout</span>
                        <span className="text-[10px] bg-slate-200 text-slate-600 font-medium px-1.5 py-0.2 rounded">
                          Not configured
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Requires App Key, App Secret, and Merchant Username from bKash Developer Portal.
                      </div>
                    </div>
                    <button
                      disabled
                      className="bg-slate-200 text-slate-500 font-semibold px-3 py-1.5 rounded-lg text-xs cursor-not-allowed"
                    >
                      Awaiting Credentials
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 11. STORE SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Store Details & Content Customization</h3>
                  <p className="text-xs text-slate-500">Edit store brand name, announcement bar, and contact links.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Store Name</label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => onUpdateSettings({ storeName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Logo Text / Wordmark</label>
                    <input
                      type="text"
                      value={settings.logoText}
                      onChange={(e) => onUpdateSettings({ logoText: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Official Email</label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => onUpdateSettings({ email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Facebook URL</label>
                    <input
                      type="url"
                      value={settings.facebookUrl}
                      onChange={(e) => onUpdateSettings({ facebookUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Announcement Bar Text</label>
                    <input
                      type="text"
                      value={settings.announcementBarText}
                      onChange={(e) => onUpdateSettings({ announcementBarText: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>Currency: <strong>{settings.currency} ({settings.currencySymbol})</strong></span>
                  <span>Timezone: <strong>{settings.timezone}</strong></span>
                </div>

                {/* Search Engine Optimization (SEO) & Sitemaps */}
                <div className="border-t border-slate-200 pt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <span>Search Engine Optimization (SEO) & Indexing</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Dynamic XML sitemaps and crawler access rules generated live from current product catalog.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={downloadSitemapXml}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download sitemap.xml</span>
                      </button>

                      <button
                        type="button"
                        onClick={downloadRobotsTxt}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download robots.txt</span>
                      </button>
                    </div>
                  </div>

                  {/* Endpoints & Index Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                          <FileCode className="w-3.5 h-3.5 text-blue-600" />
                          <span>XML Sitemap Endpoint</span>
                        </div>
                        <a
                          href="/sitemap.xml"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>Open Live XML</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Automatically indexes {products.filter((p) => p.status === 'published').length} published products, {categories.length} category paths, and {pages.filter((p) => !p.isDraft).length} policy documents.
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                          <FileCode className="w-3.5 h-3.5 text-blue-600" />
                          <span>Robots.txt Directive</span>
                        </div>
                        <a
                          href="/robots.txt"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>Open Live robots.txt</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Instructs Googlebot and other web crawlers to index storefront pages while restricting private <code>/admin</code> and <code>/api</code> endpoints.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 12. AUDIT ACTIVITY LOG */}
            {activeTab === 'audit' && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Immutable Administrative Activity Log</h3>
                  <p className="text-xs text-slate-500">
                    Complete audit trail of all product changes, stock adjustments, and order state updates.
                  </p>
                </div>

                <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="py-3 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-700 font-mono">{log.action}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-slate-800 font-medium">{log.details}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>Staff: {log.userName}</span>
                        <span>·</span>
                        <span>Role: {log.userRole}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Form Modal (Create / Edit) */}
      <ProductFormModal
        isOpen={productFormOpen}
        onClose={() => {
          setProductFormOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        categories={categories}
        brands={brands}
        onSave={handleSaveProduct}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        order={invoiceOrder}
        settings={settings}
        onClose={() => setInvoiceOrder(null)}
      />

      {/* Inventory Adjustment Modal */}
      {stockModalProduct && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900">
              Adjust Stock: {stockModalProduct.name}
            </h3>
            <div>
              <label className="block text-xs text-slate-600 mb-1">
                Change Amount (Positive to add, Negative to remove)
              </label>
              <input
                type="number"
                value={stockChangeVal}
                onChange={(e) => setStockChangeVal(e.target.value)}
                className="w-full border border-slate-200 rounded p-2 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Reason for Audit Log</label>
              <input
                type="text"
                value={stockChangeReason}
                onChange={(e) => setStockChangeReason(e.target.value)}
                className="w-full border border-slate-200 rounded p-2 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setStockModalProduct(null)}
                className="px-3 py-1.5 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustStock}
                className="bg-blue-600 text-white font-bold px-4 py-1.5 rounded text-xs"
              >
                Save Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Status & Courier Management Modal */}
      {activeOrderAction && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Manage Order: {activeOrderAction.orderNumber}
              </h3>
              <button onClick={() => setActiveOrderAction(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Fulfillment Status</label>
                <select
                  value={newOrderStatus}
                  onChange={(e) => setNewOrderStatus(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2"
                >
                  <option value="new">New (Pending Confirmation)</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="packing">Packing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="failed-delivery">Failed Delivery</option>
                  <option value="returned">Returned</option>
                </select>
              </div>

              {newOrderStatus === 'shipped' && (
                <div className="space-y-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="font-bold text-blue-900">Courier Assignment</div>
                  <div>
                    <label className="block text-[11px] text-blue-800">Courier Partner</label>
                    <select
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      className="w-full bg-white border border-blue-200 rounded p-1.5"
                    >
                      <option value="Steadfast Courier">Steadfast Courier</option>
                      <option value="RedX Delivery">RedX Delivery</option>
                      <option value="Paperfly">Paperfly</option>
                      <option value="Sundarban Courier">Sundarban Courier</option>
                      <option value="Pathao Courier">Pathao Courier</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-blue-800">Tracking Number / Waybill</label>
                    <input
                      type="text"
                      placeholder="e.g. STF-882910"
                      value={courierTrackingId}
                      onChange={(e) => setCourierTrackingId(e.target.value)}
                      className="w-full bg-white border border-blue-200 rounded p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-blue-800">Tracking Web Link</label>
                    <input
                      type="url"
                      placeholder="https://steadfast.com.bd/t/..."
                      value={courierTrackingUrl}
                      onChange={(e) => setCourierTrackingUrl(e.target.value)}
                      className="w-full bg-white border border-blue-200 rounded p-1.5"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Note</label>
                <input
                  type="text"
                  placeholder="e.g. Phone confirmed with customer"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2"
                />
              </div>

              {/* Restock option if returned */}
              {activeOrderAction.orderStatus === 'returned' && !activeOrderAction.isRestocked && (
                <div className="pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => handleRestockOrder(activeOrderAction.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg"
                  >
                    Confirm Physical Inspection & Restock Items
                  </button>
                </div>
              )}

              {/* Record Refund */}
              <div className="pt-2 border-t space-y-2">
                <div className="font-bold text-slate-800">Record Refund</div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Amount (৳)"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-1/2 border border-slate-200 rounded p-1.5"
                  />
                  <input
                    type="text"
                    placeholder="Reason"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-1/2 border border-slate-200 rounded p-1.5"
                  />
                </div>
                {refundAmount && (
                  <button
                    type="button"
                    onClick={() => handleRecordRefund(activeOrderAction.id)}
                    className="w-full bg-rose-600 text-white font-bold py-1.5 rounded"
                  >
                    Record Refund of ৳{refundAmount}
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setActiveOrderAction(null)}
                className="px-3 py-1.5 text-xs text-slate-600"
              >
                Close
              </button>
              <button
                onClick={handleUpdateOrderStatus}
                className="bg-blue-600 text-white font-bold px-4 py-1.5 rounded-lg text-xs"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
