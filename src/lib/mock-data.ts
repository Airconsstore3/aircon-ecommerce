// Mock data for frontend development - no database connection required
// This mirrors the database schema from CLAUDE.md

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string;
  type: 'residential_unit' | 'commercial_unit' | 'installation_kit' | 'maintenance_package' | 'service' | 'bundle' | 'warranty_plan' | 'repair_service';
  brand: string | null;
  btu_size?: string | null;
  images: string[];
  price_zar: number;
  sale_price_zar?: number;
  is_published: boolean;
  is_enquiry_only: boolean;
  is_featured: boolean;
  sort_order: number;
  specs: Record<string, string>;
  documents: string[];
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  parent_id?: string;
  sort_order: number;
  is_published: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface Promotion {
  id: string;
  name: string;
  code?: string;
  type: 'percentage' | 'fixed_amount' | 'bundle';
  value: number;
  applies_to: 'all' | 'category' | 'product';
  category_id?: string;
  product_id?: string;
  min_order_zar?: number;
  starts_at?: string;
  expires_at?: string;
  is_active: boolean;
  max_uses?: number | null;
  current_uses: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_ref: string;
  status: 'payment_sent' | 'paid' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
  total_zar: number;
  scheduled_date?: string;
  scheduled_time_slot?: string;
  completion_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderTracking {
  id: string;
  order_id: string;
  status: string;
  note: string;
  internal_note?: string;
  created_at: string;
}

// Categories
export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Residential Aircon',
    slug: 'residential',
    description: 'Split wall units, portable units, and ceiling cassettes for homes',
    image_url: '/images/categories/residential.jpg',
    sort_order: 1,
    is_published: true,
    meta_title: 'Residential Air Conditioning Units | Cape Town',
    meta_description: 'Shop residential aircon units including split wall, portable, and ceiling cassette systems for Cape Town homes.',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'Commercial Aircon',
    slug: 'commercial',
    description: 'Ducted systems, multi-split, and VRF systems for commercial properties',
    image_url: '/images/categories/commercial.jpg',
    sort_order: 2,
    is_published: true,
    meta_title: 'Commercial Air Conditioning Solutions | Cape Town',
    meta_description: 'Commercial aircon solutions including ducted systems, multi-split, and VRF for offices, retail, and hospitality.',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-3',
    name: 'Installation Services',
    slug: 'installation',
    description: 'Professional installation services for residential and commercial properties',
    image_url: '/images/categories/installation.jpg',
    sort_order: 3,
    is_published: true,
    meta_title: 'Aircon Installation Services | Cape Town',
    meta_description: 'Professional aircon installation services in Cape Town Metro. Standard and premium installation options available.',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-4',
    name: 'Maintenance & Care',
    slug: 'maintenance',
    description: 'Maintenance packages, repair services, and extended warranties',
    image_url: '/images/categories/maintenance.jpg',
    sort_order: 4,
    is_published: true,
    meta_title: 'Aircon Maintenance & Repair Services | Cape Town',
    meta_description: 'Keep your aircon running efficiently with our maintenance packages, repair services, and extended warranties.',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

// Products - 8 products covering all types from CLAUDE.md
export const mockProducts: Product[] = [
  // 1. Residential Unit - Samsung 9000BTU
  {
    id: 'prod-1',
    name: 'Samsung 9000BTU Inverter Split Wall Unit',
    slug: 'samsung-9000btu-inverter-split-wall',
    description: 'Energy-efficient inverter split wall air conditioner perfect for small to medium rooms. Features whisper-quiet operation and smart Wi-Fi control.',
    category_id: 'cat-1',
    type: 'residential_unit',
    brand: 'Samsung',
    btu_size: '9000BTU',
    images: [
      '/Hero Images/Featured In section/AR80 Wall-mount AC with Windfree™ and AI technology.png',
      '/Hero Images/Featured In section/AR80 Wall-mount AC with Windfree™ and AI technology.png',
    ],
    price_zar: 8999,
    sale_price_zar: 7999,
    is_published: true,
    is_enquiry_only: false,
    is_featured: true,
    sort_order: 1,
    specs: {
      eer: '3.5',
      noise_db_indoor: '19 dB',
      noise_db_outdoor: '48 dB',
      coverage_m2: '25 m²',
      inverter: 'Yes',
      wifi_enabled: 'Yes',
      heat_pump: 'Yes',
      r32_refrigerant: 'Yes',
      colour: 'White',
      pipe_connection: '1/4" liquid, 3/8" suction',
    },
    documents: [
      '/documents/samsung-9000btu-spec-sheet.pdf',
      '/documents/samsung-9000btu-manual.pdf',
    ],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  // 2. Residential Unit - LG 12000BTU
  {
    id: 'prod-2',
    name: 'LG 12000BTU Inverter Split Wall Unit',
    slug: 'lg-12000btu-inverter-split-wall',
    description: 'Powerful 12000BTU inverter air conditioner for medium to large rooms. Advanced air purification and dual inverter compressor technology.',
    category_id: 'cat-1',
    type: 'residential_unit',
    brand: 'LG',
    btu_size: '12000BTU',
    images: [
      '/Hero Images/Featured In section/WindFree™ 4-Way Cassette.png',
      '/Hero Images/Featured In section/WindFree™ 4-Way Cassette.png',
    ],
    price_zar: 11999,
    is_published: true,
    is_enquiry_only: false,
    is_featured: true,
    sort_order: 2,
    specs: {
      eer: '3.8',
      noise_db_indoor: '21 dB',
      noise_db_outdoor: '52 dB',
      coverage_m2: '35 m²',
      inverter: 'Yes',
      wifi_enabled: 'Yes',
      heat_pump: 'Yes',
      r32_refrigerant: 'Yes',
      colour: 'White',
      pipe_connection: '1/4" liquid, 1/2" suction',
    },
    documents: [
      '/documents/lg-12000btu-spec-sheet.pdf',
    ],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  // 3. Commercial Unit - Daikin Ducted (enquiry only)
  {
    id: 'prod-3',
    name: 'Daikin 24000BTU Commercial Ducted System',
    slug: 'daikin-24000btu-commercial-ducted',
    description: 'High-capacity ducted air conditioning system for commercial spaces. Requires professional site survey for accurate quotation.',
    category_id: 'cat-2',
    type: 'commercial_unit',
    brand: 'Daikin',
    btu_size: '24000BTU',
    images: [
      '/Hero Images/Featured In section/Daikin Emura.png',
      '/Hero Images/Featured In section/Daikin Emura.png',
    ],
    price_zar: 0, // No price for enquiry-only
    is_published: true,
    is_enquiry_only: true, // Commercial units are enquiry-only
    is_featured: false,
    sort_order: 3,
    specs: {
      eer: '4.2',
      seer: '8.5',
      coverage_m2: '80 m²',
      inverter: 'Yes',
      wifi_enabled: 'Yes',
      heat_pump: 'Yes',
      r32_refrigerant: 'Yes',
      colour: 'White',
    },
    documents: [
      '/documents/daikin-ducted-spec-sheet.pdf',
    ],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  // 4. Installation Service
  {
    id: 'prod-4',
    name: 'Standard Residential Installation',
    slug: 'standard-residential-installation',
    description: 'Professional installation for single split wall unit. Includes standard pipe run up to 3m, electrical connection, and testing.',
    category_id: 'cat-3',
    type: 'service',
    brand: null,
    btu_size: null,
    images: [
      '/Hero Images/Featured In section/MAIN  C ARD/MAIN 2.png',
    ],
    price_zar: 2499,
    is_published: true,
    is_enquiry_only: true, // Services require enquiry
    is_featured: false,
    sort_order: 4,
    specs: {
      property_type: 'Residential',
      pipe_run: 'Up to 3m',
      includes: 'Electrical connection, testing, warranty registration',
    },
    documents: [],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  // 5. Maintenance Package
  {
    id: 'prod-5',
    name: 'Annual Maintenance Plan',
    slug: 'annual-maintenance-plan',
    description: 'Comprehensive annual maintenance service including filter cleaning, refrigerant check, and performance report. One visit per year.',
    category_id: 'cat-4',
    type: 'maintenance_package',
    brand: null,
    btu_size: null,
    images: [
      '/Hero Images/Featured In section/MAIN  C ARD/MAIN 2.png',
    ],
    price_zar: 899,
    is_published: true,
    is_enquiry_only: false,
    is_featured: false,
    sort_order: 5,
    specs: {
      visits_per_year: '1',
      includes: 'Filter cleaning, refrigerant check, drainage inspection, electrical check, performance report',
      billing_interval: '12 months',
    },
    documents: [
      '/documents/maintenance-plan-terms.pdf',
    ],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  // 6. Installation Kit
  {
    id: 'prod-6',
    name: 'Copper Pipe Kit 3m Complete Set',
    slug: 'copper-pipe-kit-3m',
    description: 'Complete 3m copper pipe kit with all fittings included. High-quality copper for optimal heat transfer and durability.',
    category_id: 'cat-3',
    type: 'installation_kit',
    brand: null,
    btu_size: null,
    images: [
      '/Hero Images/Featured In section/Midea 6,000 BTU DOE Smart Portable Air Conditioner,.png',
      '/Hero Images/Featured In section/Midea 6,000 BTU DOE Smart Portable Air Conditioner,.png',
    ],
    price_zar: 699,
    is_published: true,
    is_enquiry_only: false,
    is_featured: false,
    sort_order: 6,
    specs: {
      length: '3 meters',
      includes: 'Copper pipes, insulation, fittings, flaring tool',
      suitable_for: '9000BTU - 12000BTU units',
    },
    documents: [
      '/documents/pipe-kit-specs.pdf',
    ],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  // 7. Extended Warranty
  {
    id: 'prod-7',
    name: '1-Year Extended Warranty Plan',
    slug: '1-year-extended-warranty',
    description: 'Extended warranty coverage for parts and labour. Covers compressor failure, PCB failure, and refrigerant leaks. Must be purchased within 30 days of unit purchase.',
    category_id: 'cat-4',
    type: 'warranty_plan',
    brand: null,
    btu_size: null,
    images: [
      '/Hero Images/Featured In section/MAIN  C ARD/MAIN 2.png',
    ],
    price_zar: 1299,
    is_published: true,
    is_enquiry_only: false,
    is_featured: false,
    sort_order: 7,
    specs: {
      duration: '1 year',
      coverage: 'Parts + labour for manufacturer defects',
      excludes: 'Physical damage, power surge damage, cosmetic damage',
    },
    documents: [
      '/documents/warranty-terms.pdf',
    ],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  // 8. Supply & Install Bundle
  {
    id: 'prod-8',
    name: 'Samsung 9000BTU Complete Package',
    slug: 'samsung-9000btu-complete-package',
    description: 'Complete package including Samsung 9000BTU inverter unit + standard installation. Save R500 compared to buying separately.',
    category_id: 'cat-3',
    type: 'bundle',
    brand: 'Samsung',
    btu_size: '9000BTU',
    images: [
      '/Hero Images/Featured In section/AR80 Wall-mount AC with Windfree™ and AI technology.png',
    ],
    price_zar: 10499,
    sale_price_zar: 9999,
    is_published: true,
    is_enquiry_only: true, // Bundles require enquiry for scheduling
    is_featured: true,
    sort_order: 8,
    specs: {
      includes: 'Samsung 9000BTU unit, standard installation, 3m pipe kit',
      savings: 'R500',
      property_type: 'Residential',
    },
    documents: [
      '/documents/bundle-terms.pdf',
    ],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

// Promotions - 2 promotions
export const mockPromotions: Promotion[] = [
  // 1. Percentage discount - sitewide on residential units
  {
    id: 'promo-1',
    name: 'Summer Sale - 15% Off All Residential Units',
    code: 'SUMMER15',
    type: 'percentage',
    value: 15,
    applies_to: 'category',
    category_id: 'cat-1',
    min_order_zar: 3000,
    starts_at: '2025-01-01T00:00:00Z',
    expires_at: '2025-03-31T23:59:59Z',
    is_active: true,
    max_uses: 100,
    current_uses: 23,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  // 2. Fixed amount discount - order over R5000
  {
    id: 'promo-2',
    name: 'R500 Off Orders Over R5000',
    code: 'SAVE500',
    type: 'fixed_amount',
    value: 500,
    applies_to: 'all',
    min_order_zar: 5000,
    starts_at: '2025-01-01T00:00:00Z',
    expires_at: '2025-12-31T23:59:59Z',
    is_active: true,
    max_uses: null,
    current_uses: 45,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

// Mock Order for tracking page
export const mockOrder: Order = {
  id: 'order-1',
  order_ref: 'ORD-2025-0042',
  status: 'in_progress',
  total_zar: 9999,
  scheduled_date: '2025-02-15',
  scheduled_time_slot: '08:00-12:00',
  completion_notes: null,
  created_at: '2025-02-01T10:30:00Z',
  updated_at: '2025-02-15T09:15:00Z',
};

// Order tracking history for the mock order
export const mockOrderTracking: OrderTracking[] = [
  {
    id: 'track-1',
    order_id: 'order-1',
    status: 'payment_sent',
    note: 'Payment link sent to customer',
    internal_note: 'PayFast payment initiated',
    created_at: '2025-02-01T10:30:00Z',
  },
  {
    id: 'track-2',
    order_id: 'order-1',
    status: 'paid',
    note: 'Payment received via PayFast',
    internal_note: 'ITN webhook verified - payment successful',
    created_at: '2025-02-01T14:22:00Z',
  },
  {
    id: 'track-3',
    order_id: 'order-1',
    status: 'scheduled',
    note: 'Installation scheduled for 15 Feb 2025, 08:00-12:00',
    internal_note: 'Technician: John D. assigned',
    created_at: '2025-02-02T09:00:00Z',
  },
  {
    id: 'track-4',
    order_id: 'order-1',
    status: 'in_progress',
    note: 'Technician en route to your location',
    internal_note: 'Technician confirmed departure',
    created_at: '2025-02-15T08:45:00Z',
  },
];
