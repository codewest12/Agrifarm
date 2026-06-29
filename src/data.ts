import { Livestock, InventoryItem, FarmProduct, Order, TrackingLog } from './types';

export const INITIAL_LIVESTOCK: Livestock[] = [
  {
    id: 'LST-001',
    name: 'Bessie',
    type: 'cattle',
    breed: 'Holstein Friesian',
    ageMonths: 28,
    weightKg: 580,
    gender: 'female',
    healthStatus: 'healthy',
    imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&auto=format&fit=crop&q=80',
    price: 1850,
    lastCheckup: '2026-06-15',
    location: 'Milking Barn A',
    qrCode: 'AGRI-LST-001',
    tagId: 'RFID-C8912'
  },
  {
    id: 'LST-002',
    name: 'Duke',
    type: 'cattle',
    breed: 'Angus Bull',
    ageMonths: 36,
    weightKg: 850,
    gender: 'male',
    healthStatus: 'healthy',
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d159437b7f?w=600&auto=format&fit=crop&q=80',
    price: 3200,
    lastCheckup: '2026-06-10',
    location: 'North Pasture',
    qrCode: 'AGRI-LST-002',
    tagId: 'RFID-C3301'
  },
  {
    id: 'LST-003',
    name: 'Curly',
    type: 'sheep',
    breed: 'Merino',
    ageMonths: 18,
    weightKg: 68,
    gender: 'female',
    healthStatus: 'healthy',
    imageUrl: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=600&auto=format&fit=crop&q=80',
    price: 450,
    lastCheckup: '2026-06-22',
    location: 'East Grazing Field',
    qrCode: 'AGRI-LST-003',
    tagId: 'RFID-S2214'
  },
  {
    id: 'LST-004',
    name: 'Billy',
    type: 'goat',
    breed: 'Boer Goat',
    ageMonths: 24,
    weightKg: 74,
    gender: 'male',
    healthStatus: 'monitoring',
    imageUrl: 'https://images.unsplash.com/photo-1524413151693-e52d130d31fd?w=600&auto=format&fit=crop&q=80',
    price: 350,
    lastCheckup: '2026-06-28',
    location: 'Goat Pen B',
    qrCode: 'AGRI-LST-004',
    tagId: 'RFID-G7761'
  },
  {
    id: 'LST-005',
    name: 'Penny',
    type: 'pig',
    breed: 'Berkshire',
    ageMonths: 12,
    weightKg: 115,
    gender: 'female',
    healthStatus: 'healthy',
    imageUrl: 'https://images.unsplash.com/photo-1597528147509-3a30c25006b0?w=600&auto=format&fit=crop&q=80',
    price: 600,
    lastCheckup: '2026-06-19',
    location: 'Piggery Section 2',
    qrCode: 'AGRI-LST-005',
    tagId: 'RFID-P4509'
  },
  {
    id: 'LST-006',
    name: 'Rocky',
    type: 'poultry',
    breed: 'Rhode Island Red',
    ageMonths: 8,
    weightKg: 3.2,
    gender: 'male',
    healthStatus: 'healthy',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80',
    price: 45,
    lastCheckup: '2026-06-25',
    location: 'Coop Alpha',
    qrCode: 'AGRI-LST-006',
    tagId: 'TAG-H9912'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'INV-001',
    name: 'Premium Alfalfa Hay Feed',
    category: 'feed',
    quantity: 120,
    unit: 'Bales',
    minThreshold: 30,
    supplier: 'GreenValley Forage Co.',
    lastRestocked: '2026-06-10',
    pricePerUnit: 18.50
  },
  {
    id: 'INV-002',
    name: 'Organic Layer Poultry Pellets',
    category: 'feed',
    quantity: 15,
    unit: 'Bags (25kg)',
    minThreshold: 20, // This will trigger a low stock alert (15 < 20)
    supplier: 'EcoFeed Agricultural Ltd.',
    lastRestocked: '2026-05-25',
    pricePerUnit: 32.00
  },
  {
    id: 'INV-003',
    name: 'Bovine Multi-Vitamin Supplement',
    category: 'medical',
    quantity: 8,
    unit: 'Vials (100ml)',
    minThreshold: 10, // Low stock alert (8 < 10)
    supplier: 'BioCare Vet Supplies',
    lastRestocked: '2026-06-02',
    pricePerUnit: 45.00
  },
  {
    id: 'INV-004',
    name: 'Livestock Pen Disinfectant Spray',
    category: 'medical',
    quantity: 35,
    unit: 'Bottles (1L)',
    minThreshold: 15,
    supplier: 'HygieneAgri Solutions',
    lastRestocked: '2026-06-14',
    pricePerUnit: 14.99
  },
  {
    id: 'INV-005',
    name: 'RFID Ear Tags (Large Cattle)',
    category: 'equipment',
    quantity: 150,
    unit: 'Units',
    minThreshold: 50,
    supplier: 'TraceTech Ear-tags Inc.',
    lastRestocked: '2026-06-20',
    pricePerUnit: 2.75
  },
  {
    id: 'INV-006',
    name: 'Clean Rye Straw Bedding',
    category: 'bedding',
    quantity: 40,
    unit: 'Bales',
    minThreshold: 15,
    supplier: 'GreenValley Forage Co.',
    lastRestocked: '2026-06-12',
    pricePerUnit: 9.50
  }
];

export const INITIAL_PRODUCTS: FarmProduct[] = [
  {
    id: 'PRD-001',
    name: 'A2 Organic Grass-fed Milk',
    description: 'Fresh, pasteurized organic whole milk from our pasture-raised dairy cows.',
    price: 4.99,
    unit: 'Gallon',
    stock: 80,
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
    category: 'dairy'
  },
  {
    id: 'PRD-002',
    name: 'Farm-Fresh Cage-Free Brown Eggs',
    description: 'High-protein, golden-yolk eggs collected daily from Coop Alpha.',
    price: 5.50,
    unit: 'Dozen (12 Eggs)',
    stock: 120,
    imageUrl: 'https://images.unsplash.com/photo-1516448424440-5dbf97754e4b?w=500&auto=format&fit=crop&q=80',
    category: 'poultry'
  },
  {
    id: 'PRD-003',
    name: 'Handcrafted Aged Goat Cheese',
    description: 'Semi-hard goat cheese aged for 3 months with a subtle herbal tang.',
    price: 12.00,
    unit: 'Block (250g)',
    stock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1486887396153-fa416525c108?w=500&auto=format&fit=crop&q=80',
    category: 'dairy'
  },
  {
    id: 'PRD-004',
    name: 'Raw Unfiltered Clover Honey',
    description: 'Sweet, local raw honey harvested directly from our clover pasture beehives.',
    price: 9.50,
    unit: 'Jar (500g)',
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80',
    category: 'organic'
  },
  {
    id: 'PRD-005',
    name: 'Merino Wool Roving (Raw)',
    description: 'Super-soft, clean merino wool suitable for spinning or needle felting.',
    price: 16.00,
    unit: 'Pound',
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80',
    category: 'wool'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-5491',
    buyerName: 'Alice Green',
    buyerEmail: 'alice.green@farmbuyer.com',
    items: [
      { id: 'LST-003', name: 'Curly (Merino Sheep)', quantity: 1, price: 450, type: 'livestock' },
      { id: 'INV-001', name: 'Premium Alfalfa Hay Feed', quantity: 3, price: 18.5, type: 'inventory' }
    ],
    totalAmount: 505.50,
    status: 'processing',
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card (Stripe)',
    createdAt: '2026-06-28T14:22:00-07:00'
  },
  {
    id: 'ORD-1284',
    buyerName: 'John Miller',
    buyerEmail: 'john@millerorganic.com',
    items: [
      { id: 'PRD-001', name: 'A2 Organic Grass-fed Milk', quantity: 10, price: 4.99, type: 'product' },
      { id: 'PRD-002', name: 'Farm-Fresh Cage-Free Brown Eggs', quantity: 5, price: 5.5, type: 'product' }
    ],
    totalAmount: 77.40,
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card (Stripe)',
    createdAt: '2026-06-25T09:15:00-07:00'
  }
];

export const INITIAL_LOGS: TrackingLog[] = [
  {
    id: 'LOG-8821',
    livestockId: 'LST-004',
    livestockName: 'Billy (Boer Goat)',
    action: 'Health Checkup',
    notes: 'Mild limp observed on front right leg. Veterinary applied hoof balm. Placed on monitoring status.',
    timestamp: '2026-06-28T10:30:00-07:00',
    scannedBy: 'Admin (Dr. Harrison)'
  },
  {
    id: 'LOG-8819',
    livestockId: 'LST-001',
    livestockName: 'Bessie (Holstein Friesian)',
    action: 'Vaccination',
    notes: 'Annual Bovine BVD Booster vaccine administered.',
    timestamp: '2026-06-15T08:15:00-07:00',
    scannedBy: 'Admin (Dr. Harrison)'
  },
  {
    id: 'LOG-8818',
    livestockId: 'LST-003',
    livestockName: 'Curly (Merino Sheep)',
    action: 'Shearing',
    notes: 'Curly sheared. Harvested approx. 4.2 kg of high-quality fine merino wool roving.',
    timestamp: '2026-06-12T14:45:00-07:00',
    scannedBy: 'Inventory (Clara Penning)'
  }
];
