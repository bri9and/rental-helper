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
    name: 'Dildo',
    sku: 'DILDO-001',
    quantity: 10,
    parLevel: 8,
    lowStockThreshold: 4,
    costPerUnit: 24.99,
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
      { itemSku: 'DILDO-001', parLevel: 1 },
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
      { itemSku: 'DILDO-001', parLevel: 1 },
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
      { itemSku: 'DILDO-001', parLevel: 1 },
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
      { itemSku: 'DILDO-001', parLevel: 1 },
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
    console.log(`  - Low stock items: Sponges (4), Trash Bags (3)`);

  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
