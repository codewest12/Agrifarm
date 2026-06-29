export type UserRole = 'admin' | 'inventory' | 'buyer' | 'guest';

export interface Livestock {
  id: string;
  name: string;
  type: 'cattle' | 'sheep' | 'goat' | 'pig' | 'poultry';
  breed: string;
  ageMonths: number;
  weightKg: number;
  gender: 'male' | 'female';
  healthStatus: 'healthy' | 'monitoring' | 'treatment' | 'quarantined';
  imageUrl: string;
  price: number;
  lastCheckup: string;
  location: string;
  qrCode: string;
  tagId: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'feed' | 'medical' | 'equipment' | 'bedding';
  quantity: number;
  unit: string;
  minThreshold: number;
  supplier: string;
  lastRestocked: string;
  pricePerUnit: number;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  type: 'livestock' | 'product' | 'inventory';
}

export interface Order {
  id: string;
  buyerName: string;
  buyerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  paymentStatus: 'paid' | 'unpaid' | 'failed';
  paymentMethod: string;
  createdAt: string;
}

export interface TrackingLog {
  id: string;
  livestockId: string;
  livestockName: string;
  action: string;
  notes: string;
  timestamp: string;
  photoUrl?: string;
  scannedBy?: string;
}

export interface FarmProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  stock: number;
  imageUrl: string;
  category: 'dairy' | 'poultry' | 'organic' | 'wool';
}
