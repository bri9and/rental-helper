import mongoose from 'mongoose';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Use MONGODB_URI env var if set, otherwise load from .env.local
if (!process.env.MONGODB_URI) {
  const envPath = resolve(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && !key.startsWith('#')) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    });
  }
}

const DEV_USER_ID = 'dev_user_123';

// Define schemas inline to avoid import issues
const WarehouseItemSchema = new mongoose.Schema({
  ownerId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true, default: 0 },
  parLevel: { type: Number, required: true, default: 10 },
  lowStockThreshold: { type: Number, required: true, default: 5 },
  costPerUnit: { type: Number },
  burnRateHistory: [{
    date: { type: Date, default: Date.now },
    amountUsed: { type: Number, required: true },
  }],
}, { timestamps: true });

const PropertySchema = new mongoose.Schema({
  ownerId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  address: { type: String },
  inventorySettings: [{
    itemSku: { type: String, required: true },
    parLevel: { type: Number, required: true },
  }],
}, { timestamps: true });

const WarehouseItem = mongoose.models.WarehouseItem || mongoose.model('WarehouseItem', WarehouseItemSchema);
const Property = mongoose.models.Property || mongoose.model('Property', PropertySchema);

const inventoryItems = [
  {
    ownerId: DEV_USER_ID,
    name: 'Toilet Paper (4-pack)',
    sku: 'TP-001',
    quantity: 48,
    parLevel: 50,
    lowStockThreshold: 20,
    costPerUnit: 4.99,
    burnRateHistory: [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), amountUsed: 8 },
      { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), amountUsed: 6 },
      { date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), amountUsed: 10 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Hand Soap (Refill)',
    sku: 'SOAP-001',
    quantity: 24,
    parLevel: 30,
    lowStockThreshold: 10,
    costPerUnit: 3.49,
    burnRateHistory: [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), amountUsed: 4 },
      { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), amountUsed: 5 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Shampoo (Travel Size)',
    sku: 'SHAMP-001',
    quantity: 60,
    parLevel: 50,
    lowStockThreshold: 15,
    costPerUnit: 1.99,
    burnRateHistory: [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), amountUsed: 12 },
      { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), amountUsed: 10 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Conditioner (Travel Size)',
    sku: 'COND-001',
    quantity: 55,
    parLevel: 50,
    lowStockThreshold: 15,
    costPerUnit: 1.99,
    burnRateHistory: [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), amountUsed: 10 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Bath Towels (White)',
    sku: 'TOWEL-001',
    quantity: 18,
    parLevel: 24,
    lowStockThreshold: 8,
    costPerUnit: 12.99,
    burnRateHistory: [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), amountUsed: 2 },
      { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), amountUsed: 3 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Hand Towels (White)',
    sku: 'HTOWEL-001',
    quantity: 30,
    parLevel: 36,
    lowStockThreshold: 12,
    costPerUnit: 6.99,
    burnRateHistory: [],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Dish Soap',
    sku: 'DISH-001',
    quantity: 8,
    parLevel: 15,
    lowStockThreshold: 5,
    costPerUnit: 2.99,
    burnRateHistory: [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), amountUsed: 3 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Sponges (3-pack)',
    sku: 'SPONGE-001',
    quantity: 4,
    parLevel: 10,
    lowStockThreshold: 4,
    costPerUnit: 2.49,
    burnRateHistory: [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), amountUsed: 2 },
      { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), amountUsed: 3 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Trash Bags (Kitchen)',
    sku: 'TRASH-001',
    quantity: 3,
    parLevel: 12,
    lowStockThreshold: 4,
    costPerUnit: 8.99,
    burnRateHistory: [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), amountUsed: 4 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Paper Towels (2-pack)',
    sku: 'PTOWEL-001',
    quantity: 16,
    parLevel: 20,
    lowStockThreshold: 8,
    costPerUnit: 5.99,
    burnRateHistory: [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), amountUsed: 6 },
      { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), amountUsed: 4 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Coffee Pods (K-Cup)',
    sku: 'COFFEE-001',
    quantity: 72,
    parLevel: 100,
    lowStockThreshold: 30,
    costPerUnit: 0.45,
    burnRateHistory: [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), amountUsed: 24 },
      { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), amountUsed: 18 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Laundry Detergent Pods',
    sku: 'LAUNDRY-001',
    quantity: 25,
    parLevel: 40,
    lowStockThreshold: 15,
    costPerUnit: 0.35,
    burnRateHistory: [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), amountUsed: 8 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Body Lotion (Travel Size)',
    sku: 'LOTION-001',
    quantity: 45,
    parLevel: 50,
    lowStockThreshold: 15,
    costPerUnit: 2.29,
    burnRateHistory: [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), amountUsed: 8 },
      { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), amountUsed: 6 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'All-Purpose Cleaner',
    sku: 'CLEAN-001',
    quantity: 12,
    parLevel: 20,
    lowStockThreshold: 6,
    costPerUnit: 4.49,
    burnRateHistory: [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), amountUsed: 3 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Glass Cleaner',
    sku: 'GLASS-001',
    quantity: 8,
    parLevel: 15,
    lowStockThreshold: 5,
    costPerUnit: 3.99,
    burnRateHistory: [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), amountUsed: 2 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Bed Sheets (Queen)',
    sku: 'SHEET-Q01',
    quantity: 14,
    parLevel: 20,
    lowStockThreshold: 6,
    costPerUnit: 34.99,
    burnRateHistory: [
      { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), amountUsed: 2 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Bed Sheets (King)',
    sku: 'SHEET-K01',
    quantity: 10,
    parLevel: 16,
    lowStockThreshold: 4,
    costPerUnit: 39.99,
    burnRateHistory: [
      { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), amountUsed: 1 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Pillowcases (2-pack)',
    sku: 'PILLOW-001',
    quantity: 22,
    parLevel: 30,
    lowStockThreshold: 10,
    costPerUnit: 12.99,
    burnRateHistory: [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), amountUsed: 4 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Toilet Bowl Cleaner',
    sku: 'TCLEAN-001',
    quantity: 6,
    parLevel: 12,
    lowStockThreshold: 4,
    costPerUnit: 3.49,
    burnRateHistory: [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), amountUsed: 2 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Air Freshener Spray',
    sku: 'FRESH-001',
    quantity: 18,
    parLevel: 24,
    lowStockThreshold: 8,
    costPerUnit: 4.99,
    burnRateHistory: [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), amountUsed: 5 },
      { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), amountUsed: 4 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Dishwasher Pods',
    sku: 'DWASH-001',
    quantity: 40,
    parLevel: 60,
    lowStockThreshold: 20,
    costPerUnit: 0.28,
    burnRateHistory: [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), amountUsed: 14 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Duvet Cover (Queen)',
    sku: 'DUVET-Q01',
    quantity: 8,
    parLevel: 12,
    lowStockThreshold: 4,
    costPerUnit: 49.99,
    burnRateHistory: [],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Bath Mat',
    sku: 'BMAT-001',
    quantity: 12,
    parLevel: 16,
    lowStockThreshold: 5,
    costPerUnit: 14.99,
    burnRateHistory: [
      { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), amountUsed: 2 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Welcome Snack Basket',
    sku: 'SNACK-001',
    quantity: 15,
    parLevel: 25,
    lowStockThreshold: 8,
    costPerUnit: 18.99,
    burnRateHistory: [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), amountUsed: 6 },
      { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), amountUsed: 5 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Wine (Welcome Bottle)',
    sku: 'WINE-001',
    quantity: 20,
    parLevel: 30,
    lowStockThreshold: 10,
    costPerUnit: 12.99,
    burnRateHistory: [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), amountUsed: 4 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Mop Pads (Reusable)',
    sku: 'MOP-001',
    quantity: 10,
    parLevel: 15,
    lowStockThreshold: 5,
    costPerUnit: 8.99,
    burnRateHistory: [
      { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), amountUsed: 3 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Vacuum Bags',
    sku: 'VAC-001',
    quantity: 6,
    parLevel: 12,
    lowStockThreshold: 4,
    costPerUnit: 5.99,
    burnRateHistory: [],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Light Bulbs (LED)',
    sku: 'BULB-001',
    quantity: 16,
    parLevel: 24,
    lowStockThreshold: 8,
    costPerUnit: 3.99,
    burnRateHistory: [
      { date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), amountUsed: 2 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Batteries (AA 4-pack)',
    sku: 'BATT-AA',
    quantity: 12,
    parLevel: 20,
    lowStockThreshold: 6,
    costPerUnit: 4.49,
    burnRateHistory: [],
  },
];

const properties = [
  {
    ownerId: DEV_USER_ID,
    name: 'Oceanview Beach House',
    address: '123 Coastal Drive, Malibu, CA 90265',
    inventorySettings: [
      { itemSku: 'TP-001', parLevel: 4 },
      { itemSku: 'SOAP-001', parLevel: 3 },
      { itemSku: 'SHAMP-001', parLevel: 4 },
      { itemSku: 'COND-001', parLevel: 4 },
      { itemSku: 'TOWEL-001', parLevel: 6 },
      { itemSku: 'HTOWEL-001', parLevel: 4 },
      { itemSku: 'DISH-001', parLevel: 1 },
      { itemSku: 'SPONGE-001', parLevel: 1 },
      { itemSku: 'TRASH-001', parLevel: 2 },
      { itemSku: 'PTOWEL-001', parLevel: 2 },
      { itemSku: 'COFFEE-001', parLevel: 12 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Downtown Loft',
    address: '456 Main Street, Unit 8B, Austin, TX 78701',
    inventorySettings: [
      { itemSku: 'TP-001', parLevel: 2 },
      { itemSku: 'SOAP-001', parLevel: 2 },
      { itemSku: 'SHAMP-001', parLevel: 2 },
      { itemSku: 'COND-001', parLevel: 2 },
      { itemSku: 'TOWEL-001', parLevel: 4 },
      { itemSku: 'HTOWEL-001', parLevel: 2 },
      { itemSku: 'DISH-001', parLevel: 1 },
      { itemSku: 'TRASH-001', parLevel: 1 },
      { itemSku: 'PTOWEL-001', parLevel: 1 },
      { itemSku: 'COFFEE-001', parLevel: 8 },
      { itemSku: 'LAUNDRY-001', parLevel: 4 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Mountain Retreat Cabin',
    address: '789 Pine Ridge Road, Aspen, CO 81611',
    inventorySettings: [
      { itemSku: 'TP-001', parLevel: 6 },
      { itemSku: 'SOAP-001', parLevel: 4 },
      { itemSku: 'SHAMP-001', parLevel: 6 },
      { itemSku: 'COND-001', parLevel: 6 },
      { itemSku: 'TOWEL-001', parLevel: 8 },
      { itemSku: 'HTOWEL-001', parLevel: 6 },
      { itemSku: 'DISH-001', parLevel: 2 },
      { itemSku: 'SPONGE-001', parLevel: 2 },
      { itemSku: 'TRASH-001', parLevel: 3 },
      { itemSku: 'PTOWEL-001', parLevel: 3 },
      { itemSku: 'COFFEE-001', parLevel: 20 },
      { itemSku: 'LAUNDRY-001', parLevel: 6 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Urban Studio',
    address: '321 5th Avenue, Apt 12A, New York, NY 10001',
    inventorySettings: [
      { itemSku: 'TP-001', parLevel: 2 },
      { itemSku: 'SOAP-001', parLevel: 1 },
      { itemSku: 'SHAMP-001', parLevel: 2 },
      { itemSku: 'COND-001', parLevel: 2 },
      { itemSku: 'TOWEL-001', parLevel: 2 },
      { itemSku: 'HTOWEL-001', parLevel: 2 },
      { itemSku: 'TRASH-001', parLevel: 1 },
      { itemSku: 'COFFEE-001', parLevel: 6 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Lakeside Villa',
    address: '567 Lakeshore Drive, Lake Tahoe, CA 96150',
    inventorySettings: [
      { itemSku: 'TP-001', parLevel: 8 },
      { itemSku: 'SOAP-001', parLevel: 6 },
      { itemSku: 'SHAMP-001', parLevel: 8 },
      { itemSku: 'COND-001', parLevel: 8 },
      { itemSku: 'LOTION-001', parLevel: 6 },
      { itemSku: 'TOWEL-001', parLevel: 12 },
      { itemSku: 'HTOWEL-001', parLevel: 8 },
      { itemSku: 'BMAT-001', parLevel: 4 },
      { itemSku: 'SHEET-K01', parLevel: 4 },
      { itemSku: 'PILLOW-001', parLevel: 6 },
      { itemSku: 'DUVET-Q01', parLevel: 2 },
      { itemSku: 'DISH-001', parLevel: 2 },
      { itemSku: 'DWASH-001', parLevel: 10 },
      { itemSku: 'TRASH-001', parLevel: 4 },
      { itemSku: 'COFFEE-001', parLevel: 24 },
      { itemSku: 'WINE-001', parLevel: 2 },
      { itemSku: 'SNACK-001', parLevel: 2 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Desert Oasis Casita',
    address: '234 Cactus Canyon Road, Scottsdale, AZ 85251',
    inventorySettings: [
      { itemSku: 'TP-001', parLevel: 3 },
      { itemSku: 'SOAP-001', parLevel: 2 },
      { itemSku: 'SHAMP-001', parLevel: 3 },
      { itemSku: 'COND-001', parLevel: 3 },
      { itemSku: 'LOTION-001', parLevel: 4 },
      { itemSku: 'TOWEL-001', parLevel: 4 },
      { itemSku: 'HTOWEL-001', parLevel: 3 },
      { itemSku: 'SHEET-Q01', parLevel: 2 },
      { itemSku: 'PILLOW-001', parLevel: 2 },
      { itemSku: 'FRESH-001', parLevel: 2 },
      { itemSku: 'COFFEE-001', parLevel: 10 },
      { itemSku: 'SNACK-001', parLevel: 1 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Historic Brownstone',
    address: '89 Beacon Street, Boston, MA 02108',
    inventorySettings: [
      { itemSku: 'TP-001', parLevel: 4 },
      { itemSku: 'SOAP-001', parLevel: 3 },
      { itemSku: 'SHAMP-001', parLevel: 4 },
      { itemSku: 'COND-001', parLevel: 4 },
      { itemSku: 'TOWEL-001', parLevel: 6 },
      { itemSku: 'HTOWEL-001', parLevel: 4 },
      { itemSku: 'SHEET-Q01', parLevel: 3 },
      { itemSku: 'PILLOW-001', parLevel: 4 },
      { itemSku: 'DISH-001', parLevel: 1 },
      { itemSku: 'SPONGE-001', parLevel: 1 },
      { itemSku: 'TRASH-001', parLevel: 2 },
      { itemSku: 'PTOWEL-001', parLevel: 2 },
      { itemSku: 'COFFEE-001', parLevel: 12 },
      { itemSku: 'LAUNDRY-001', parLevel: 4 },
      { itemSku: 'CLEAN-001', parLevel: 1 },
      { itemSku: 'GLASS-001', parLevel: 1 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Tropical Bungalow',
    address: '42 Palm Beach Road, Key West, FL 33040',
    inventorySettings: [
      { itemSku: 'TP-001', parLevel: 3 },
      { itemSku: 'SOAP-001', parLevel: 2 },
      { itemSku: 'SHAMP-001', parLevel: 4 },
      { itemSku: 'COND-001', parLevel: 4 },
      { itemSku: 'LOTION-001', parLevel: 4 },
      { itemSku: 'TOWEL-001', parLevel: 6 },
      { itemSku: 'HTOWEL-001', parLevel: 3 },
      { itemSku: 'BMAT-001', parLevel: 2 },
      { itemSku: 'SHEET-Q01', parLevel: 2 },
      { itemSku: 'FRESH-001', parLevel: 2 },
      { itemSku: 'COFFEE-001', parLevel: 8 },
      { itemSku: 'WINE-001', parLevel: 1 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Vineyard Cottage',
    address: '1200 Wine Country Lane, Napa, CA 94558',
    inventorySettings: [
      { itemSku: 'TP-001', parLevel: 4 },
      { itemSku: 'SOAP-001', parLevel: 3 },
      { itemSku: 'SHAMP-001', parLevel: 4 },
      { itemSku: 'COND-001', parLevel: 4 },
      { itemSku: 'LOTION-001', parLevel: 3 },
      { itemSku: 'TOWEL-001', parLevel: 6 },
      { itemSku: 'HTOWEL-001', parLevel: 4 },
      { itemSku: 'SHEET-K01', parLevel: 2 },
      { itemSku: 'PILLOW-001', parLevel: 3 },
      { itemSku: 'DUVET-Q01', parLevel: 1 },
      { itemSku: 'DISH-001', parLevel: 1 },
      { itemSku: 'DWASH-001', parLevel: 8 },
      { itemSku: 'COFFEE-001', parLevel: 12 },
      { itemSku: 'WINE-001', parLevel: 3 },
      { itemSku: 'SNACK-001', parLevel: 2 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Ski Chalet',
    address: '777 Powder Mountain Road, Park City, UT 84060',
    inventorySettings: [
      { itemSku: 'TP-001', parLevel: 6 },
      { itemSku: 'SOAP-001', parLevel: 4 },
      { itemSku: 'SHAMP-001', parLevel: 6 },
      { itemSku: 'COND-001', parLevel: 6 },
      { itemSku: 'LOTION-001', parLevel: 5 },
      { itemSku: 'TOWEL-001', parLevel: 10 },
      { itemSku: 'HTOWEL-001', parLevel: 6 },
      { itemSku: 'BMAT-001', parLevel: 3 },
      { itemSku: 'SHEET-Q01', parLevel: 4 },
      { itemSku: 'SHEET-K01', parLevel: 2 },
      { itemSku: 'PILLOW-001', parLevel: 6 },
      { itemSku: 'DISH-001', parLevel: 2 },
      { itemSku: 'SPONGE-001', parLevel: 2 },
      { itemSku: 'DWASH-001', parLevel: 12 },
      { itemSku: 'TRASH-001', parLevel: 3 },
      { itemSku: 'PTOWEL-001', parLevel: 3 },
      { itemSku: 'COFFEE-001', parLevel: 20 },
      { itemSku: 'LAUNDRY-001', parLevel: 8 },
      { itemSku: 'SNACK-001', parLevel: 2 },
    ],
  },
  {
    ownerId: DEV_USER_ID,
    name: 'Midtown Penthouse',
    address: '350 Park Avenue, PH1, New York, NY 10022',
    inventorySettings: [
      { itemSku: 'TP-001', parLevel: 4 },
      { itemSku: 'SOAP-001', parLevel: 3 },
      { itemSku: 'SHAMP-001', parLevel: 4 },
      { itemSku: 'COND-001', parLevel: 4 },
      { itemSku: 'LOTION-001', parLevel: 4 },
      { itemSku: 'TOWEL-001', parLevel: 8 },
      { itemSku: 'HTOWEL-001', parLevel: 4 },
      { itemSku: 'BMAT-001', parLevel: 2 },
      { itemSku: 'SHEET-K01', parLevel: 3 },
      { itemSku: 'PILLOW-001', parLevel: 4 },
      { itemSku: 'DUVET-Q01', parLevel: 2 },
      { itemSku: 'DISH-001', parLevel: 1 },
      { itemSku: 'DWASH-001', parLevel: 10 },
      { itemSku: 'FRESH-001', parLevel: 3 },
      { itemSku: 'COFFEE-001', parLevel: 16 },
      { itemSku: 'WINE-001', parLevel: 2 },
      { itemSku: 'SNACK-001', parLevel: 2 },
      { itemSku: 'CLEAN-001', parLevel: 2 },
      { itemSku: 'GLASS-001', parLevel: 2 },
    ],
  },
];

async function seed() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI not set');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected!\n');

    // Clear existing data for dev user
    console.log('Clearing existing data...');
    await WarehouseItem.deleteMany({ ownerId: DEV_USER_ID });
    await Property.deleteMany({ ownerId: DEV_USER_ID });
    console.log('Cleared!\n');

    // Insert inventory items
    console.log('Seeding inventory items...');
    for (const item of inventoryItems) {
      await WarehouseItem.create(item);
      console.log(`  + ${item.name} (${item.quantity} in stock)`);
    }
    console.log(`\nCreated ${inventoryItems.length} inventory items\n`);

    // Insert properties
    console.log('Seeding properties...');
    for (const property of properties) {
      await Property.create(property);
      console.log(`  + ${property.name} (${property.inventorySettings.length} items)`);
    }
    console.log(`\nCreated ${properties.length} properties\n`);

    console.log('Seed completed successfully!');
    console.log('\nSummary:');
    console.log(`  - ${inventoryItems.length} warehouse items`);
    console.log(`  - ${properties.length} properties`);
    console.log(`  - Low stock items: Sponges (4), Trash Bags (3), Toilet Bowl Cleaner (6), Vacuum Bags (6)`);

  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
