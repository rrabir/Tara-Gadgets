import {
  Product,
  Category,
  Brand,
  DeliveryZone,
  StoreSettings,
  ContentPage,
  Coupon,
  Order,
  AuditLogEntry
} from '../src/types/index.ts';

export const BANGLADESH_DISTRICTS = [
  'Dhaka', 'Gazipur', 'Narayanganj', 'Narsingdi', 'Tangail', 'Kishoreganj', 'Manikganj', 'Munshiganj',
  'Chattogram', "Cox's Bazar", 'Cumilla', 'Feni', 'Noakhali', 'Brahmanbaria', 'Chandpur',
  'Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj',
  'Rajshahi', 'Bogura', 'Pabna', 'Sirajganj', 'Naogaon', 'Natore', 'Chapai Nawabganj', 'Joypurhat',
  'Khulna', 'Jashore', 'Kushtia', 'Jhenaidah', 'Satkhira', 'Bagerhat', 'Chuadanga', 'Meherpur', 'Magura', 'Narail',
  'Barishal', 'Patuakhali', 'Bhola', 'Pirojpur', 'Jhalokathi', 'Barguna',
  'Rangpur', 'Dinajpur', 'Kurigram', 'Gaibandha', 'Nilphamari', 'Thakurgaon', 'Panchagarh', 'Lalmonirhat',
  'Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur',
  'Faridpur', 'Gopalganj', 'Madaripur', 'Rajbari', 'Shariatpur'
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Earbuds & Audio', slug: 'earbuds-audio', description: 'True wireless stereo earbuds, ANC headphones, and premium Bluetooth audio.', productCount: 4 },
  { id: 'cat-2', name: 'Smartwatches', slug: 'smartwatches', description: 'Fitness trackers, AMOLED calling watches, and rugged outdoor smartwatches.', productCount: 3 },
  { id: 'cat-3', name: 'Fast Chargers', slug: 'fast-chargers', description: 'GaN PD 3.0 multi-port wall adapters and high-wattage desktop chargers.', productCount: 3 },
  { id: 'cat-4', name: 'Power Banks', slug: 'power-banks', description: 'High-capacity battery packs, wireless magnetic power banks, and fast charge banks.', productCount: 3 },
  { id: 'cat-5', name: 'Accessories & Cables', slug: 'accessories', description: 'Braided Type-C cables, MagSafe mounts, OTG adapters, and converters.', productCount: 3 }
];

export const INITIAL_BRANDS: Brand[] = [
  { id: 'brand-1', name: 'Aura Sound', slug: 'aura-sound', productCount: 3 },
  { id: 'brand-2', name: 'Apex Tech', slug: 'apex-tech', productCount: 3 },
  { id: 'brand-3', name: 'Zolt Power', slug: 'zolt-power', productCount: 3 },
  { id: 'brand-4', name: 'VoltMax', slug: 'voltmax', productCount: 3 },
  { id: 'brand-5', name: 'Tara Gear', slug: 'tara-gear', productCount: 4 }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Aura Sound Pro ANC Wireless Earbuds',
    slug: 'aura-sound-pro-anc-wireless-earbuds',
    brand: 'Aura Sound',
    category: 'Earbuds & Audio',
    description: 'Experience deep immersive sound with 42dB Hybrid Active Noise Cancellation, quad-mic ENC for crystal-clear calls on Dhaka streets, and up to 40 hours of combined playtime. Features Bluetooth 5.4 with low-latency gaming mode and IPX5 water resistance.',
    regularPrice: 3850,
    salePrice: 3290,
    sku: 'TG-AUR-ANC01',
    stock: 24,
    images: [
      '/src/assets/images/gadget_anc_earbuds_1793251027311.jpg'
    ],
    coverImage: '/src/assets/images/gadget_anc_earbuds_1793251027311.jpg',
    videoUrl: '',
    variants: [
      { id: 'v1-1', name: 'Matte Navy Blue', color: 'Navy Blue', colorHex: '#1e293b', sku: 'TG-AUR-ANC01-NV', price: 3290, stock: 14 },
      { id: 'v1-2', name: 'Graphite Black', color: 'Black', colorHex: '#0f172a', sku: 'TG-AUR-ANC01-BK', price: 3290, stock: 10 }
    ],
    specifications: [
      { key: 'Noise Cancellation', value: '42dB Hybrid Active Noise Cancellation (ANC)' },
      { key: 'Driver Size', value: '11mm Titanium Dynamic Driver' },
      { key: 'Battery Life', value: '8h (Earbuds) / 40h (With Charging Case)' },
      { key: 'Fast Charging', value: '10 min charge = 2 hours playback (Type-C)' },
      { key: 'Bluetooth Version', value: 'v5.4 (AAC, SBC codecs supported)' },
      { key: 'Water Resistance', value: 'IPX5 Sweat & Splash Proof' },
      { key: 'Microphone', value: '4-Mic Environmental Noise Cancellation (ENC)' }
    ],
    compatibility: ['Android', 'iOS', 'Windows', 'macOS'],
    warranty: '6 Months Official Replacement Warranty',
    inTheBox: [
      'Aura Sound Pro ANC Earbuds',
      'Wireless Charging Case',
      '3 Pairs Silicone Ear Tips (S/M/L)',
      'Braided USB Type-C Cable',
      'User Manual & Warranty Card'
    ],
    deliveryInfo: 'Usually delivers in 24-48 hours in Dhaka City and 2-3 business days across all Bangladesh districts.',
    status: 'published',
    isFeatured: true,
    isNewArrival: true,
    salesCount: 18,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-25T14:30:00Z'
  },
  {
    id: 'prod-2',
    name: 'Apex Titan AMOLED Bluetooth Calling Smartwatch',
    slug: 'apex-titan-amoled-bluetooth-calling-smartwatch',
    brand: 'Apex Tech',
    category: 'Smartwatches',
    description: 'A rugged precision titanium-cased smartwatch built for daily performance. Boasting a vivid 1.96-inch HD AMOLED Always-On Display with 1000 nits peak outdoor brightness, crystal-clear Hi-Fi Bluetooth calling, 120+ athletic sports modes, and continuous SpO2/heart rate monitoring.',
    regularPrice: 5200,
    salePrice: 4490,
    sku: 'TG-APX-TTN02',
    stock: 16,
    images: [
      '/src/assets/images/gadget_smartwatch_ultra_1793251027897.jpg'
    ],
    coverImage: '/src/assets/images/gadget_smartwatch_ultra_1793251027897.jpg',
    videoUrl: '',
    variants: [
      { id: 'v2-1', name: 'Titanium Silver / Black Strap', color: 'Titanium / Black', colorHex: '#475569', sku: 'TG-APX-TTN02-SL', price: 4490, stock: 9 },
      { id: 'v2-2', name: 'Deep Space Gray / Orange Strap', color: 'Gray / Orange', colorHex: '#334155', sku: 'TG-APX-TTN02-OR', price: 4650, stock: 7 }
    ],
    specifications: [
      { key: 'Display', value: '1.96" HD AMOLED (410x502 px), 1000 Nits Peak' },
      { key: 'Always On Display', value: 'Supported (Analog & Digital dials)' },
      { key: 'Calling Function', value: 'Single-chip Hi-Fi Bluetooth Calling with dial pad' },
      { key: 'Battery Capacity', value: '380mAh (7-10 Days Typical, 25 Days Standby)' },
      { key: 'Health Tracking', value: '24/7 Heart Rate, SpO2, Sleep Stages, Stress' },
      { key: 'Water Resistance', value: 'IP68 Waterproof (Up to 1.5m)' },
      { key: 'Chassis Material', value: 'Aerospace-Grade Zinc Titanium Alloy' }
    ],
    compatibility: ['Android 6.0 and above', 'iOS 10.0 and above'],
    warranty: '1 Year Brand Replacement Warranty',
    inTheBox: [
      'Apex Titan Smartwatch Body',
      'Fluororubber Quick-Release Strap',
      'Magnetic Pogo-Pin Fast Charger',
      'Screen Protector (Pre-applied)',
      'Bengali & English Quick Start Guide'
    ],
    deliveryInfo: 'Fast Cash on Delivery available across all 64 districts in Bangladesh.',
    status: 'published',
    isFeatured: true,
    isNewArrival: false,
    salesCount: 32,
    createdAt: '2026-09-15T12:00:00Z',
    updatedAt: '2026-10-20T08:15:00Z'
  },
  {
    id: 'prod-3',
    name: 'Zolt 65W GaN Dual USB-C Fast Wall Charger',
    slug: 'zolt-65w-gan-dual-usb-c-fast-wall-charger',
    brand: 'Zolt Power',
    category: 'Fast Chargers',
    description: 'Compact Next-Gen GaN III technology charger capable of powering MacBooks, laptops, iPhones, and Android smartphones at high speeds simultaneously. Intelligent power distribution protects your valuable electronics against over-voltage, overheating, and short circuits.',
    regularPrice: 2800,
    salePrice: 2350,
    sku: 'TG-ZLT-GAN65',
    stock: 35,
    images: [
      '/src/assets/images/gadget_fast_gan_charger_1793251028679.jpg'
    ],
    coverImage: '/src/assets/images/gadget_fast_gan_charger_1793251028679.jpg',
    videoUrl: '',
    variants: [
      { id: 'v3-1', name: 'Clean White (Foldable US Pins)', color: 'White', colorHex: '#f8fafc', sku: 'TG-ZLT-GAN65-WH', price: 2350, stock: 22 },
      { id: 'v3-2', name: 'Matte Charcoal Black', color: 'Black', colorHex: '#1e293b', sku: 'TG-ZLT-GAN65-BK', price: 2350, stock: 13 }
    ],
    specifications: [
      { key: 'Total Output', value: '65W Max Power Delivery 3.0 / PPS / QC 4.0' },
      { key: 'Port Configuration', value: '2x USB-C Power Delivery Ports' },
      { key: 'Single Port C1/C2', value: '65W Max (5V/3A, 9V/3A, 12V/3A, 15V/3A, 20V/3.25A)' },
      { key: 'Dual Port Usage', value: 'C1 (45W) + C2 (20W) Intelligent Split' },
      { key: 'Technology', value: 'Gallium Nitride (GaN III) Thermal Architecture' },
      { key: 'Pin Type', value: 'Foldable US 2-Pin (Compact Travel Friendly)' },
      { key: 'Certifications', value: 'CE, FCC, RoHS, UL-level thermal cut-off' }
    ],
    compatibility: ['MacBook Air/Pro', 'iPhone 16/15/14/13', 'Samsung S24/S23 Ultra', 'Pixel', 'iPad Pro', 'Steam Deck'],
    warranty: '6 Months Official Replacement Warranty',
    inTheBox: [
      'Zolt 65W GaN Dual USB-C Adapter',
      'Safety Information Manual',
      'Tara Gadgets Authenticity Card'
    ],
    deliveryInfo: 'Instant dispatch. Same day shipping inside Dhaka for orders confirmed before 3:00 PM.',
    status: 'published',
    isFeatured: true,
    isNewArrival: false,
    salesCount: 45,
    createdAt: '2026-09-20T09:00:00Z',
    updatedAt: '2026-10-22T11:00:00Z'
  },
  {
    id: 'prod-4',
    name: 'VoltMax MagCharge 20,000mAh Power Bank',
    slug: 'voltmax-magcharge-20000mah-power-bank',
    brand: 'VoltMax',
    category: 'Power Banks',
    description: 'High-density 20,000mAh aviation-safe Li-polymer battery pack with 22.5W two-way fast charging and a precision digital LED percentage display. Charges up to three devices concurrently with support for PD 3.0, QC 3.0, and Huawei SCP protocols.',
    regularPrice: 3400,
    salePrice: 2850,
    sku: 'TG-VLT-PB20K',
    stock: 20,
    images: [
      '/src/assets/images/gadget_powerbank_20000_1793251028329.jpg'
    ],
    coverImage: '/src/assets/images/gadget_powerbank_20000_1793251028329.jpg',
    videoUrl: '',
    variants: [
      { id: 'v4-1', name: 'Gunmetal Gray', color: 'Gray', colorHex: '#475569', sku: 'TG-VLT-PB20K-GY', price: 2850, stock: 12 },
      { id: 'v4-2', name: 'Midnight Blue', color: 'Blue', colorHex: '#1e3a8a', sku: 'TG-VLT-PB20K-BL', price: 2850, stock: 8 }
    ],
    specifications: [
      { key: 'Capacity', value: '20,000mAh / 74Wh (Aviation Airline Approved)' },
      { key: 'Display', value: 'Smart Digital LED Percentage Screen (0-100%)' },
      { key: 'Input Ports', value: 'USB-C (18W Max) / Micro-USB (18W Max)' },
      { key: 'Output Ports', value: '1x USB-C (20W PD) + 2x USB-A (22.5W QC/SCP)' },
      { key: 'Phone Charges', value: 'Approx. 4.2 full charges for 4500mAh smartphone' },
      { key: 'Weight', value: '385 grams' },
      { key: 'Protection', value: '10-Layer Smart Temperature & Short-Circuit IC' }
    ],
    compatibility: ['All Android Smartphones', 'iPhones', 'iPads', 'Smartwatches & TWS'],
    warranty: '6 Months Official Replacement Warranty',
    inTheBox: [
      'VoltMax 20,000mAh Power Bank',
      'Braided Type-C Fast Charge Cable (30cm)',
      'User Manual and Warranty Document'
    ],
    deliveryInfo: 'Carefully packaged in shock-proof bubble wrapping for safe country-wide transit.',
    status: 'published',
    isFeatured: true,
    isNewArrival: true,
    salesCount: 29,
    createdAt: '2026-10-05T14:00:00Z',
    updatedAt: '2026-10-26T16:45:00Z'
  },
  {
    id: 'prod-5',
    name: 'Tara Armor Braided 100W USB-C to USB-C Fast Cable (1.2m)',
    slug: 'tara-armor-braided-100w-usb-c-cable',
    brand: 'Tara Gear',
    category: 'Accessories & Cables',
    description: 'Ultra-durable Kevlar-reinforced braided cable supporting up to 100W (20V/5A) Power Delivery charging and 480Mbps high-speed data transmission. Tested for 30,000+ bends with zinc-alloy strain relief collars.',
    regularPrice: 850,
    salePrice: 650,
    sku: 'TG-ACC-C100W',
    stock: 50,
    images: [
      '/src/assets/images/gadget_fast_gan_charger_1793251028679.jpg'
    ],
    coverImage: '/src/assets/images/gadget_fast_gan_charger_1793251028679.jpg',
    videoUrl: '',
    variants: [
      { id: 'v5-1', name: '1.2 Meter / Slate Gray', color: 'Gray', colorHex: '#334155', sku: 'TG-ACC-C100W-12', price: 650, stock: 35 },
      { id: 'v5-2', name: '2.0 Meter / Slate Gray', color: 'Gray', colorHex: '#1e293b', sku: 'TG-ACC-C100W-20', price: 790, stock: 15 }
    ],
    specifications: [
      { key: 'Max Power', value: '100W Power Delivery (E-Marker Chip built-in)' },
      { key: 'Data Rate', value: 'USB 2.0 (480 Mbps)' },
      { key: 'Material', value: 'Double-braided high-density nylon & Zinc Alloy' },
      { key: 'Bend Lifespan', value: '30,000+ Verified 90-degree flex tests' }
    ],
    compatibility: ['Laptops', 'Tablets', 'Android Phones', 'iPhone 15/16 Series'],
    warranty: '6 Months Replacement Warranty',
    inTheBox: ['100W Braided Cable', 'Velcro Cable Tie'],
    deliveryInfo: 'Available for Cash on Delivery country-wide.',
    status: 'published',
    isFeatured: false,
    isNewArrival: false,
    salesCount: 65,
    createdAt: '2026-09-10T10:00:00Z',
    updatedAt: '2026-10-18T10:00:00Z'
  }
];

export const INITIAL_DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'zone-1',
    name: 'Inside Dhaka City',
    fee: 70,
    estimatedDays: '1 - 2 Business Days',
    freeDeliveryThreshold: 5000,
    isActive: true
  },
  {
    id: 'zone-2',
    name: 'Dhaka Suburbs (Gazipur, Savar, Narayanganj, Keraniganj)',
    fee: 100,
    estimatedDays: '2 - 3 Business Days',
    freeDeliveryThreshold: 6000,
    isActive: true
  },
  {
    id: 'zone-3',
    name: 'Outside Dhaka (All 63 Districts across Bangladesh)',
    fee: 130,
    estimatedDays: '2 - 4 Business Days',
    freeDeliveryThreshold: 7000,
    isActive: true
  }
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Tara Gadgets',
  tagline: 'Authentic Gadgets & Premium Gear in Bangladesh',
  email: 'taragadgets@gmail.com',
  facebookUrl: 'https://www.facebook.com/taragadgetsbd',
  phonePlaceholder: '+880 1XXX-XXXXXX',
  addressPlaceholder: 'Dhaka, Bangladesh',
  currency: 'BDT',
  currencySymbol: '৳',
  timezone: 'Asia/Dhaka',
  announcementBarText: '⚡ Official Tara Gadgets BD · Cash on Delivery & 100% Genuine Warranty across Bangladesh',
  isAnnouncementBarActive: true,
  freeDeliveryMinSpend: 5000,
  logoText: 'Tara Gadgets',
  primaryColor: '#1d4ed8',
  enableCod: true,
  enableOnlinePayment: false,
  sslcommerzStatus: 'not-configured',
  bkashStatus: 'not-configured',
  nagadStatus: 'not-configured'
};

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cp-1',
    code: 'TARA100',
    discountType: 'fixed',
    discountValue: 100,
    minOrderValue: 2000,
    usageCount: 14,
    maxUsageLimit: 200,
    expiresAt: '2026-12-31T23:59:59Z',
    isActive: true
  },
  {
    id: 'cp-2',
    code: 'WELCOME5',
    discountType: 'percentage',
    discountValue: 5,
    minOrderValue: 1500,
    maxDiscount: 300,
    usageCount: 8,
    maxUsageLimit: 500,
    expiresAt: '2026-12-31T23:59:59Z',
    isActive: true
  }
];

export const INITIAL_PAGES: ContentPage[] = [
  {
    id: 'page-about',
    slug: 'about',
    title: 'About Tara Gadgets BD',
    content: `Welcome to Tara Gadgets BD. We are dedicated to delivering authentic, high-quality audio accessories, smart wearables, fast chargers, and daily tech essentials to customers throughout Bangladesh.

Every product listed in our store undergoes inspection for genuine authenticity, build quality, and battery integrity before dispatch. We believe in honest pricing, clear technical specifications, and reliable customer service without exaggerated claims.`,
    isDraft: false,
    updatedAt: '2026-10-20T12:00:00Z'
  },
  {
    id: 'page-delivery',
    slug: 'delivery-policy',
    title: 'Delivery Policy',
    content: `Delivery Coverage:
We deliver across all 64 districts in Bangladesh through trusted courier networks including Steadfast Courier, RedX, and Paperfly.

Delivery Timelines:
- Inside Dhaka City: 24 to 48 hours
- Dhaka Suburbs (Savar, Gazipur, Narayanganj): 48 to 72 hours
- Outside Dhaka: 2 to 4 business days

Delivery Charges:
- Inside Dhaka: ৳70
- Dhaka Suburbs: ৳100
- Outside Dhaka: ৳130
Free shipping applies on eligible orders exceeding ৳5,000.

Cash on Delivery Verification:
For COD orders, customers may inspect the parcel condition upon delivery before settlement with the courier representative.`,
    isDraft: false,
    updatedAt: '2026-10-20T12:00:00Z'
  },
  {
    id: 'page-warranty',
    slug: 'warranty-policy',
    title: 'Warranty & Claims Policy',
    content: `Warranty Period:
Most electronics carried by Tara Gadgets BD include 6 Months to 1 Year official replacement warranty as explicitly specified on the product page.

Warranty Conditions:
1. The product must have the original serial number/IMEI sticker intact.
2. Original packaging and invoice receipt must be presented during claim.
3. Warranty covers factory manufacturing defects, internal circuit failure, or battery malfunction.
4. Physical damage, water ingress (unless rated waterproof and within stated depth limits), accidental drops, or unauthorized repairs are strictly excluded from warranty coverage.`,
    isDraft: false,
    updatedAt: '2026-10-20T12:00:00Z'
  },
  {
    id: 'page-returns',
    slug: 'return-and-refund-policy',
    title: 'Return & Refund Policy',
    content: `Return Window:
Customers have 3 days from parcel delivery to report an issue or request an exchange for defective, damaged, or incorrect items.

Procedure:
1. Submit a return request through your Tara Gadgets account or contact our official email at taragadgets@gmail.com with your Order ID and photo/video proof.
2. Our order management team will review and approve valid return shipments.
3. Staff inspect the returned item prior to issuing a replacement or processing a refund. Returned stock is never restocked without thorough physical inspection.

Refund Timelines:
Refunds for approved claims are processed via bKash, Nagad, or Bank Transfer within 3-5 business days after inspection.`,
    isDraft: false,
    updatedAt: '2026-10-20T12:00:00Z'
  },
  {
    id: 'page-terms',
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    content: `By placing an order on Tara Gadgets BD, you agree to provide authentic contact and address details within Bangladesh. Repeated fake orders or unaccepted Cash on Delivery packages without justifiable defect cause will result in phone number blacklisting across courier partner networks.`,
    isDraft: false,
    updatedAt: '2026-10-20T12:00:00Z'
  },
  {
    id: 'page-privacy',
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    content: `Tara Gadgets BD respects customer privacy. We collect customer name, phone number, and delivery address solely for parcel fulfillment, SMS tracking notifications, and order verification. We never sell or share customer personal information with unauthorized third parties.`,
    isDraft: false,
    updatedAt: '2026-10-20T12:00:00Z'
  },
  {
    id: 'page-faq',
    slug: 'faq',
    title: 'Frequently Asked Questions (FAQ)',
    content: `Q: Are all products authentic?
A: Yes, every gadget sold by Tara Gadgets BD is 100% genuine and comes with warranty documentation.

Q: Can I check the product before paying the delivery agent?
A: For Cash on Delivery parcels, you can inspect the package exterior and seal in front of the delivery agent.

Q: How can I track my order?
A: Use our "Track Order" page by entering your Order Number (e.g., TG-2026-1042) and phone number.

Q: What payment methods do you accept?
A: Currently, Cash on Delivery is active for all orders. Secure online payments will be activated once merchant gateway setup is finalized.`,
    isDraft: false,
    updatedAt: '2026-10-20T12:00:00Z'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'TG-2026-1001',
    isGuest: false,
    customerId: 'cust-1',
    address: {
      customerName: 'Tanvir Hossain',
      phone: '01711223344',
      email: 'tanvir.h@example.com',
      district: 'Dhaka',
      area: 'Dhanmondi 27',
      fullAddress: 'House 42, Road 27, Dhanmondi, Dhaka-1209',
      orderNotes: 'Please call before delivery'
    },
    items: [
      {
        productId: 'prod-1',
        productName: 'Aura Sound Pro ANC Wireless Earbuds',
        sku: 'TG-AUR-ANC01-NV',
        image: '/src/assets/images/gadget_anc_earbuds_1793251027311.jpg',
        variantName: 'Matte Navy Blue',
        quantity: 1,
        unitPrice: 3290,
        totalPrice: 3290
      }
    ],
    subtotal: 3290,
    shippingFee: 70,
    discount: 100,
    couponCode: 'TARA100',
    total: 3260,
    paymentMethod: 'cash-on-delivery',
    paymentStatus: 'cod-pending',
    orderStatus: 'delivered',
    courierStatus: 'settled',
    courierName: 'Steadfast Courier',
    courierTrackingId: 'STF-882910',
    courierTrackingUrl: 'https://steadfast.com.bd/t/STF-882910',
    internalNotes: ['Customer confirmed via phone call', 'Delivered and COD settled'],
    createdAt: '2026-10-21T09:30:00Z',
    updatedAt: '2026-10-23T15:00:00Z'
  },
  {
    id: 'ord-1002',
    orderNumber: 'TG-2026-1002',
    isGuest: true,
    address: {
      customerName: 'Sabbir Ahmed',
      phone: '01822334455',
      district: 'Chattogram',
      area: 'GEC Circle',
      fullAddress: 'Flat 4B, Nasirabad Housing, GEC, Chattogram',
      orderNotes: ''
    },
    items: [
      {
        productId: 'prod-2',
        productName: 'Apex Titan AMOLED Bluetooth Calling Smartwatch',
        sku: 'TG-APX-TTN02-SL',
        image: '/src/assets/images/gadget_smartwatch_ultra_1793251027897.jpg',
        variantName: 'Titanium Silver / Black Strap',
        quantity: 1,
        unitPrice: 4490,
        totalPrice: 4490
      }
    ],
    subtotal: 4490,
    shippingFee: 130,
    discount: 0,
    total: 4620,
    paymentMethod: 'cash-on-delivery',
    paymentStatus: 'cod-pending',
    orderStatus: 'shipped',
    courierStatus: 'in-transit',
    courierName: 'RedX Delivery',
    courierTrackingId: 'RDX-994120',
    courierTrackingUrl: 'https://redx.com.bd/track?trackingId=RDX-994120',
    internalNotes: ['Dispatched on Oct 27 morning'],
    createdAt: '2026-10-27T06:15:00Z',
    updatedAt: '2026-10-27T11:20:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '2026-10-28T18:00:00Z',
    userId: 'system-init',
    userName: 'System Setup',
    userRole: 'owner',
    action: 'SYSTEM_BOOTSTRAP',
    entityType: 'STORE',
    entityId: 'tara-gadgets',
    details: 'Initial store catalog, delivery zones, and Bangladesh compliance settings initialized.'
  }
];

export const SPECIFICATION_TEMPLATES: Record<string, { key: string; placeholder: string }[]> = {
  'earbuds-audio': [
    { key: 'Noise Cancellation', placeholder: 'e.g. 42dB Hybrid ANC' },
    { key: 'Driver Size', placeholder: 'e.g. 10mm / 12mm Dynamic' },
    { key: 'Battery Life', placeholder: 'e.g. 8h buds / 36h case' },
    { key: 'Bluetooth Version', placeholder: 'e.g. v5.3 / v5.4' },
    { key: 'Water Resistance', placeholder: 'e.g. IPX5 Splashproof' },
    { key: 'Microphone', placeholder: 'e.g. 4-Mic ENC' }
  ],
  'smartwatches': [
    { key: 'Display', placeholder: 'e.g. 1.96" HD AMOLED (410x502)' },
    { key: 'Calling Function', placeholder: 'e.g. Bluetooth Calling with Mic & Speaker' },
    { key: 'Battery Life', placeholder: 'e.g. 7-10 Days Typical' },
    { key: 'Health Tracking', placeholder: 'e.g. 24/7 Heart Rate, SpO2, Sleep' },
    { key: 'Water Resistance', placeholder: 'e.g. IP68 Waterproof' },
    { key: 'Chassis Material', placeholder: 'e.g. Zinc Alloy / Titanium' }
  ],
  'fast-chargers': [
    { key: 'Total Output', placeholder: 'e.g. 65W Max GaN' },
    { key: 'Port Configuration', placeholder: 'e.g. 2x Type-C + 1x USB-A' },
    { key: 'Protocols', placeholder: 'e.g. PD 3.0, PPS, QC 4.0' },
    { key: 'Pin Type', placeholder: 'e.g. US 2-Pin / EU 2-Pin' }
  ],
  'power-banks': [
    { key: 'Capacity', placeholder: 'e.g. 20,000mAh (74Wh)' },
    { key: 'Output Power', placeholder: 'e.g. 22.5W / 30W Fast Charge' },
    { key: 'Display', placeholder: 'e.g. Digital LED Percentage Screen' },
    { key: 'Ports', placeholder: 'e.g. 1x USB-C In/Out, 2x USB-A Out' }
  ],
  'accessories': [
    { key: 'Material', placeholder: 'e.g. Braided Nylon + Aluminum' },
    { key: 'Power / Rating', placeholder: 'e.g. 100W (20V/5A)' },
    { key: 'Length', placeholder: 'e.g. 1.2m / 2.0m' },
    { key: 'Compatibility', placeholder: 'e.g. Type-C Laptops & Mobiles' }
  ]
};
