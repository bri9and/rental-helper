import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getAuthUserId } from '@/lib/auth';
import WarehouseItem from '@/models/WarehouseItem';
import Property from '@/models/Property';
import SupplyRequest from '@/models/SupplyRequest';
import CleaningReport from '@/models/CleaningReport';

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

export async function POST() {
  try {
    await dbConnect();

    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clear existing data for this user
    await WarehouseItem.deleteMany({ ownerId: userId });
    await Property.deleteMany({ ownerId: userId });
    await SupplyRequest.deleteMany({ ownerId: userId });
    await CleaningReport.deleteMany({ cleanerId: userId });

    // Complete Airbnb/VRBO inventory list organized by category
    // Amazon ASINs are real product identifiers for common rental supplies
    const inventoryItems = [
      // === BATHROOM ESSENTIALS ===
      { ownerId: userId, name: 'Toilet Paper (4-pack)', sku: 'BATH-TP', quantity: 24, parLevel: 50, lowStockThreshold: 15, costPerUnit: 4.99, amazonAsin: 'B0BXMRWW6Z', category: 'bathroom' },
      { ownerId: userId, name: 'Hand Soap (Refill Bottle)', sku: 'BATH-SOAP', quantity: 8, parLevel: 20, lowStockThreshold: 6, costPerUnit: 3.49, amazonAsin: 'B00JE5CBAK', category: 'bathroom' },
      { ownerId: userId, name: 'Shampoo (Travel Size)', sku: 'BATH-SHAMP', quantity: 45, parLevel: 60, lowStockThreshold: 20, costPerUnit: 1.99, amazonAsin: 'B0D3MBKKQ1', category: 'bathroom' },
      { ownerId: userId, name: 'Conditioner (Travel Size)', sku: 'BATH-COND', quantity: 40, parLevel: 60, lowStockThreshold: 20, costPerUnit: 1.99, amazonAsin: 'B0D3MBKKQ1', category: 'bathroom' },
      { ownerId: userId, name: 'Body Wash (Travel Size)', sku: 'BATH-WASH', quantity: 35, parLevel: 60, lowStockThreshold: 20, costPerUnit: 2.49, amazonAsin: 'B07GLXVV3Z', category: 'bathroom' },
      { ownerId: userId, name: 'Bath Towels (White)', sku: 'BATH-TOWEL', quantity: 18, parLevel: 36, lowStockThreshold: 12, costPerUnit: 12.99, amazonAsin: 'B071NJFLMS', category: 'bathroom' },
      { ownerId: userId, name: 'Hand Towels (White)', sku: 'BATH-HTOWEL', quantity: 24, parLevel: 48, lowStockThreshold: 16, costPerUnit: 6.99, amazonAsin: 'B07D46ZWMR', category: 'bathroom' },
      { ownerId: userId, name: 'Washcloths (White)', sku: 'BATH-WCLOTH', quantity: 30, parLevel: 60, lowStockThreshold: 20, costPerUnit: 2.99, amazonAsin: 'B07D46ZWMR', category: 'bathroom' },
      { ownerId: userId, name: 'Bath Mat', sku: 'BATH-MAT', quantity: 8, parLevel: 15, lowStockThreshold: 5, costPerUnit: 14.99, amazonAsin: 'B07V7J1BH1', category: 'bathroom' },
      { ownerId: userId, name: 'Toilet Bowl Cleaner', sku: 'BATH-TBCLEAN', quantity: 6, parLevel: 12, lowStockThreshold: 4, costPerUnit: 3.99, amazonAsin: 'B00BLZIQ5S', category: 'bathroom' },
      { ownerId: userId, name: 'Toilet Brush', sku: 'BATH-BRUSH', quantity: 5, parLevel: 10, lowStockThreshold: 3, costPerUnit: 8.99, amazonAsin: 'B00004OCJQ', category: 'bathroom' },
      { ownerId: userId, name: 'Plunger', sku: 'BATH-PLUNGE', quantity: 5, parLevel: 8, lowStockThreshold: 2, costPerUnit: 12.99, amazonAsin: 'B0948GZRLK', category: 'bathroom' },
      { ownerId: userId, name: 'Tissues (Box)', sku: 'BATH-TISSUE', quantity: 20, parLevel: 40, lowStockThreshold: 12, costPerUnit: 2.49, amazonAsin: 'B088CZLZ7H', category: 'bathroom' },
      { ownerId: userId, name: 'Hair Dryer', sku: 'BATH-DRYER', quantity: 3, parLevel: 6, lowStockThreshold: 2, costPerUnit: 24.99, amazonAsin: 'B07QK9C2NM', category: 'bathroom' },

      // === BEDROOM ESSENTIALS ===
      { ownerId: userId, name: 'Bed Sheets Queen (White)', sku: 'BED-SHEET-Q', quantity: 12, parLevel: 24, lowStockThreshold: 8, costPerUnit: 34.99, amazonAsin: 'B00NLLSZVY', category: 'bedroom' },
      { ownerId: userId, name: 'Bed Sheets King (White)', sku: 'BED-SHEET-K', quantity: 8, parLevel: 16, lowStockThreshold: 5, costPerUnit: 39.99, amazonAsin: 'B00NLLSZWE', category: 'bedroom' },
      { ownerId: userId, name: 'Pillowcases (2-pack)', sku: 'BED-PILLOW', quantity: 20, parLevel: 40, lowStockThreshold: 12, costPerUnit: 12.99, amazonAsin: 'B00HYM14AC', category: 'bedroom' },
      { ownerId: userId, name: 'Duvet Cover Queen', sku: 'BED-DUVET-Q', quantity: 6, parLevel: 12, lowStockThreshold: 4, costPerUnit: 49.99, amazonAsin: 'B07Y81W6RM', category: 'bedroom' },
      { ownerId: userId, name: 'Mattress Protector Queen', sku: 'BED-PROT-Q', quantity: 4, parLevel: 8, lowStockThreshold: 2, costPerUnit: 29.99, amazonAsin: 'B003PWNA3G', category: 'bedroom' },
      { ownerId: userId, name: 'Extra Blanket', sku: 'BED-BLANKET', quantity: 8, parLevel: 15, lowStockThreshold: 5, costPerUnit: 24.99, amazonAsin: 'B08PSSW4X9', category: 'bedroom' },
      { ownerId: userId, name: 'Pillow (Standard)', sku: 'BED-PILLSTD', quantity: 10, parLevel: 20, lowStockThreshold: 6, costPerUnit: 14.99, amazonAsin: 'B00EINBSJ2', category: 'bedroom' },

      // === KITCHEN ESSENTIALS ===
      { ownerId: userId, name: 'Dish Soap', sku: 'KIT-DISH', quantity: 6, parLevel: 15, lowStockThreshold: 5, costPerUnit: 2.99, amazonAsin: 'B00EPNP69C', category: 'kitchen' },
      { ownerId: userId, name: 'Dishwasher Pods', sku: 'KIT-PODS', quantity: 3, parLevel: 10, lowStockThreshold: 3, costPerUnit: 12.99, amazonAsin: 'B00HV9CE08', category: 'kitchen' },
      { ownerId: userId, name: 'Sponges (3-pack)', sku: 'KIT-SPONGE', quantity: 8, parLevel: 20, lowStockThreshold: 6, costPerUnit: 2.49, amazonAsin: 'B0016HH5FW', category: 'kitchen' },
      { ownerId: userId, name: 'Paper Towels (2-pack)', sku: 'KIT-PTOWEL', quantity: 15, parLevel: 30, lowStockThreshold: 10, costPerUnit: 5.99, amazonAsin: 'B07FNSZ7M6', category: 'kitchen' },
      { ownerId: userId, name: 'Trash Bags (Kitchen)', sku: 'KIT-TRASH', quantity: 4, parLevel: 12, lowStockThreshold: 4, costPerUnit: 8.99, amazonAsin: 'B00BQYLS5O', category: 'kitchen' },
      { ownerId: userId, name: 'Aluminum Foil', sku: 'KIT-FOIL', quantity: 6, parLevel: 12, lowStockThreshold: 4, costPerUnit: 4.99, amazonAsin: 'B01BQKVSGS', category: 'kitchen' },
      { ownerId: userId, name: 'Plastic Wrap', sku: 'KIT-WRAP', quantity: 5, parLevel: 10, lowStockThreshold: 3, costPerUnit: 3.99, amazonAsin: 'B07X88JLN8', category: 'kitchen' },
      { ownerId: userId, name: 'Ziploc Bags (Gallon)', sku: 'KIT-ZIPLOC', quantity: 4, parLevel: 10, lowStockThreshold: 3, costPerUnit: 4.99, amazonAsin: 'B00CQAKHIY', category: 'kitchen' },
      { ownerId: userId, name: 'Coffee Pods (K-Cup 24pk)', sku: 'KIT-COFFEE', quantity: 8, parLevel: 20, lowStockThreshold: 6, costPerUnit: 14.99, amazonAsin: 'B0773WVMWK', category: 'kitchen' },
      { ownerId: userId, name: 'Coffee Filters', sku: 'KIT-FILTER', quantity: 5, parLevel: 10, lowStockThreshold: 3, costPerUnit: 3.99, amazonAsin: 'B00006IF7V', category: 'kitchen' },
      { ownerId: userId, name: 'Sugar Packets', sku: 'KIT-SUGAR', quantity: 10, parLevel: 20, lowStockThreshold: 6, costPerUnit: 2.99, amazonAsin: 'B01JLSQSDY', category: 'kitchen' },
      { ownerId: userId, name: 'Creamer Packets', sku: 'KIT-CREAM', quantity: 8, parLevel: 16, lowStockThreshold: 5, costPerUnit: 3.99, amazonAsin: 'B00GCGCRUU', category: 'kitchen' },
      { ownerId: userId, name: 'Tea Bags (Variety)', sku: 'KIT-TEA', quantity: 6, parLevel: 12, lowStockThreshold: 4, costPerUnit: 5.99, amazonAsin: 'B01LBKWDJ2', category: 'kitchen' },
      { ownerId: userId, name: 'Salt & Pepper Set', sku: 'KIT-SPSET', quantity: 4, parLevel: 8, lowStockThreshold: 2, costPerUnit: 4.99, amazonAsin: 'B07Z4NT65P', category: 'kitchen' },
      { ownerId: userId, name: 'Cooking Oil', sku: 'KIT-OIL', quantity: 4, parLevel: 8, lowStockThreshold: 2, costPerUnit: 6.99, amazonAsin: 'B0017TIQ8A', category: 'kitchen' },
      { ownerId: userId, name: 'Kitchen Towels (2-pack)', sku: 'KIT-TOWEL', quantity: 10, parLevel: 20, lowStockThreshold: 6, costPerUnit: 8.99, amazonAsin: 'B01BCISGXI', category: 'kitchen' },

      // === CLEANING SUPPLIES ===
      { ownerId: userId, name: 'All-Purpose Cleaner', sku: 'CLN-ALLPURP', quantity: 8, parLevel: 20, lowStockThreshold: 6, costPerUnit: 4.49, amazonAsin: 'B00I5ATQQU', category: 'cleaning' },
      { ownerId: userId, name: 'Glass Cleaner', sku: 'CLN-GLASS', quantity: 6, parLevel: 15, lowStockThreshold: 5, costPerUnit: 3.99, amazonAsin: 'B0011DH0FM', category: 'cleaning' },
      { ownerId: userId, name: 'Disinfecting Wipes', sku: 'CLN-WIPES', quantity: 12, parLevel: 24, lowStockThreshold: 8, costPerUnit: 4.99, amazonAsin: 'B07NRCPT2T', category: 'cleaning' },
      { ownerId: userId, name: 'Floor Cleaner', sku: 'CLN-FLOOR', quantity: 4, parLevel: 10, lowStockThreshold: 3, costPerUnit: 5.99, amazonAsin: 'B00DVHHQA4', category: 'cleaning' },
      { ownerId: userId, name: 'Laundry Detergent Pods', sku: 'CLN-LAUNDRY', quantity: 6, parLevel: 15, lowStockThreshold: 5, costPerUnit: 11.99, amazonAsin: 'B078LQJZNS', category: 'cleaning' },
      { ownerId: userId, name: 'Dryer Sheets', sku: 'CLN-DRYER', quantity: 5, parLevel: 12, lowStockThreshold: 4, costPerUnit: 5.99, amazonAsin: 'B004M9XYW6', category: 'cleaning' },
      { ownerId: userId, name: 'Stain Remover', sku: 'CLN-STAIN', quantity: 4, parLevel: 8, lowStockThreshold: 2, costPerUnit: 6.99, amazonAsin: 'B0017JAZTM', category: 'cleaning' },
      { ownerId: userId, name: 'Air Freshener Spray', sku: 'CLN-FRESH', quantity: 10, parLevel: 24, lowStockThreshold: 8, costPerUnit: 4.99, amazonAsin: 'B08BWCMTLQ', category: 'cleaning' },
      { ownerId: userId, name: 'Trash Bags (Small)', sku: 'CLN-TRASHSM', quantity: 6, parLevel: 15, lowStockThreshold: 5, costPerUnit: 5.99, amazonAsin: 'B00BQYLS5O', category: 'cleaning' },
      { ownerId: userId, name: 'Broom & Dustpan Set', sku: 'CLN-BROOM', quantity: 3, parLevel: 6, lowStockThreshold: 2, costPerUnit: 19.99, amazonAsin: 'B01M0F1ASA', category: 'cleaning' },
      { ownerId: userId, name: 'Mop & Bucket', sku: 'CLN-MOP', quantity: 3, parLevel: 6, lowStockThreshold: 2, costPerUnit: 24.99, amazonAsin: 'B01AZ5KQHC', category: 'cleaning' },
      { ownerId: userId, name: 'Vacuum Bags', sku: 'CLN-VACBAG', quantity: 4, parLevel: 10, lowStockThreshold: 3, costPerUnit: 12.99, amazonAsin: 'B00KZU04W0', category: 'cleaning' },

      // === GUEST AMENITIES ===
      { ownerId: userId, name: 'Welcome Snack Basket', sku: 'AMEN-SNACK', quantity: 10, parLevel: 20, lowStockThreshold: 6, costPerUnit: 8.99, amazonAsin: 'B07VX1XSGK', category: 'amenities' },
      { ownerId: userId, name: 'Bottled Water (24-pack)', sku: 'AMEN-WATER', quantity: 5, parLevel: 12, lowStockThreshold: 4, costPerUnit: 4.99, amazonAsin: 'B0CQ1VYJN1', category: 'amenities' },
      { ownerId: userId, name: 'Local Guide/Info Packet', sku: 'AMEN-GUIDE', quantity: 15, parLevel: 30, lowStockThreshold: 10, costPerUnit: 1.99, category: 'amenities' },
      { ownerId: userId, name: 'Earplugs (Pairs)', sku: 'AMEN-EAR', quantity: 20, parLevel: 50, lowStockThreshold: 15, costPerUnit: 0.99, amazonAsin: 'B077Z7PGHR', category: 'amenities' },
      { ownerId: userId, name: 'Phone Charger (Universal)', sku: 'AMEN-CHARGE', quantity: 4, parLevel: 8, lowStockThreshold: 2, costPerUnit: 9.99, amazonAsin: 'B0D1SC5DYP', category: 'amenities' },
      { ownerId: userId, name: 'Umbrella', sku: 'AMEN-UMBR', quantity: 5, parLevel: 10, lowStockThreshold: 3, costPerUnit: 12.99, amazonAsin: 'B01GXXVVW2', category: 'amenities' },
      { ownerId: userId, name: 'First Aid Kit', sku: 'AMEN-FIRST', quantity: 5, parLevel: 8, lowStockThreshold: 2, costPerUnit: 15.99, amazonAsin: 'B00HYGXZLM', category: 'amenities' },
      { ownerId: userId, name: 'Sewing Kit', sku: 'AMEN-SEW', quantity: 5, parLevel: 10, lowStockThreshold: 3, costPerUnit: 3.99, amazonAsin: 'B07VZ49FM1', category: 'amenities' },

      // === OUTDOOR/SEASONAL ===
      { ownerId: userId, name: 'Sunscreen', sku: 'OUT-SUN', quantity: 4, parLevel: 10, lowStockThreshold: 3, costPerUnit: 8.99, amazonAsin: 'B004CDH7OC', category: 'outdoor' },
      { ownerId: userId, name: 'Bug Spray', sku: 'OUT-BUG', quantity: 4, parLevel: 10, lowStockThreshold: 3, costPerUnit: 6.99, amazonAsin: 'B000LEVQ7K', category: 'outdoor' },
      { ownerId: userId, name: 'Beach Towels', sku: 'OUT-BTOWEL', quantity: 8, parLevel: 16, lowStockThreshold: 5, costPerUnit: 14.99, amazonAsin: 'B09TT2LBF8', category: 'outdoor' },
      { ownerId: userId, name: 'Pool Floats', sku: 'OUT-FLOAT', quantity: 4, parLevel: 8, lowStockThreshold: 2, costPerUnit: 12.99, amazonAsin: 'B08JH8XBGS', category: 'outdoor' },
      { ownerId: userId, name: 'Firewood Bundle', sku: 'OUT-WOOD', quantity: 6, parLevel: 15, lowStockThreshold: 5, costPerUnit: 7.99, amazonAsin: 'B08JH9PKGP', category: 'outdoor' },
      { ownerId: userId, name: 'Lighter/Matches', sku: 'OUT-FIRE', quantity: 8, parLevel: 15, lowStockThreshold: 5, costPerUnit: 2.99, amazonAsin: 'B000V2FDUU', category: 'outdoor' },
      { ownerId: userId, name: 'Grill Propane Tank', sku: 'OUT-PROPANE', quantity: 2, parLevel: 5, lowStockThreshold: 2, costPerUnit: 19.99, amazonAsin: 'B00TXOHXHE', category: 'outdoor' },

      // === SAFETY & MAINTENANCE ===
      { ownerId: userId, name: 'Batteries AA (8-pack)', sku: 'SAFE-BATAA', quantity: 6, parLevel: 12, lowStockThreshold: 4, costPerUnit: 7.99, amazonAsin: 'B00MNV8E0C', category: 'safety' },
      { ownerId: userId, name: 'Batteries AAA (8-pack)', sku: 'SAFE-BATAAA', quantity: 6, parLevel: 12, lowStockThreshold: 4, costPerUnit: 7.99, amazonAsin: 'B00MNV8EMS', category: 'safety' },
      { ownerId: userId, name: 'Light Bulbs (LED 4-pack)', sku: 'SAFE-BULB', quantity: 4, parLevel: 10, lowStockThreshold: 3, costPerUnit: 9.99, amazonAsin: 'B08G4KXNX1', category: 'safety' },
      { ownerId: userId, name: 'Smoke Detector Battery', sku: 'SAFE-SMOKE', quantity: 6, parLevel: 12, lowStockThreshold: 4, costPerUnit: 4.99, amazonAsin: 'B00JHKSL2O', category: 'safety' },
      { ownerId: userId, name: 'Fire Extinguisher', sku: 'SAFE-EXTING', quantity: 3, parLevel: 6, lowStockThreshold: 2, costPerUnit: 29.99, amazonAsin: 'B00002ND64', category: 'safety' },
      { ownerId: userId, name: 'Flashlight', sku: 'SAFE-FLASH', quantity: 5, parLevel: 10, lowStockThreshold: 3, costPerUnit: 9.99, amazonAsin: 'B00GN0LXUO', category: 'safety' },
      { ownerId: userId, name: 'Extension Cord', sku: 'SAFE-EXT', quantity: 4, parLevel: 8, lowStockThreshold: 2, costPerUnit: 12.99, amazonAsin: 'B00005113P', category: 'safety' },
      { ownerId: userId, name: 'Door Lock Batteries', sku: 'SAFE-LOCK', quantity: 8, parLevel: 15, lowStockThreshold: 5, costPerUnit: 6.99, amazonAsin: 'B00MNV8EMS', category: 'safety' },
    ];

    // Add burn rate history to some items
    const itemsWithHistory = inventoryItems.map(item => {
      if (['BATH-TP', 'BATH-SOAP', 'KIT-COFFEE', 'CLN-FRESH', 'KIT-TRASH'].includes(item.sku)) {
        return {
          ...item,
          burnRateHistory: [
            { date: daysAgo(7), amountUsed: Math.floor(Math.random() * 8) + 4 },
            { date: daysAgo(14), amountUsed: Math.floor(Math.random() * 8) + 4 },
            { date: daysAgo(21), amountUsed: Math.floor(Math.random() * 8) + 4 },
          ],
        };
      }
      return { ...item, burnRateHistory: [] };
    });

    const createdItems = await WarehouseItem.insertMany(itemsWithHistory);

    // Create properties with relevant inventory settings
    const properties = [
      {
        ownerId: userId,
        name: 'Oceanview Beach House',
        address: '123 Coastal Drive, Malibu, CA',
        inventorySettings: [
          { itemSku: 'BATH-TP', parLevel: 4 },
          { itemSku: 'BATH-TOWEL', parLevel: 6 },
          { itemSku: 'KIT-COFFEE', parLevel: 2 },
          { itemSku: 'OUT-BTOWEL', parLevel: 4 },
        ],
      },
      {
        ownerId: userId,
        name: 'Downtown Loft',
        address: '456 Main Street, Austin, TX',
        inventorySettings: [
          { itemSku: 'BATH-TP', parLevel: 2 },
          { itemSku: 'KIT-COFFEE', parLevel: 1 },
          { itemSku: 'CLN-ALLPURP', parLevel: 1 },
        ],
      },
      {
        ownerId: userId,
        name: 'Mountain Retreat Cabin',
        address: '789 Pine Ridge Road, Aspen, CO',
        inventorySettings: [
          { itemSku: 'BATH-TP', parLevel: 6 },
          { itemSku: 'OUT-WOOD', parLevel: 3 },
          { itemSku: 'BED-BLANKET', parLevel: 2 },
          { itemSku: 'KIT-COFFEE', parLevel: 2 },
        ],
      },
      {
        ownerId: userId,
        name: 'Lakeside Villa',
        address: '567 Lakeshore Drive, Lake Tahoe, CA',
        inventorySettings: [
          { itemSku: 'BATH-TP', parLevel: 8 },
          { itemSku: 'BATH-TOWEL', parLevel: 8 },
          { itemSku: 'OUT-FLOAT', parLevel: 2 },
          { itemSku: 'KIT-COFFEE', parLevel: 3 },
        ],
      },
      {
        ownerId: userId,
        name: 'Urban Studio',
        address: '321 5th Avenue, New York, NY',
        inventorySettings: [
          { itemSku: 'BATH-TP', parLevel: 2 },
          { itemSku: 'CLN-FRESH', parLevel: 2 },
        ],
      },
    ];

    const createdProperties = await Property.insertMany(properties);

    // Create supply requests
    const supplyRequests = [
      {
        ownerId: userId,
        propertyId: createdProperties[0]._id,
        propertyName: 'Oceanview Beach House',
        sku: 'KIT-TRASH',
        itemName: 'Trash Bags (Kitchen)',
        requestedBy: userId,
        requestedByName: 'Maria Garcia',
        currentCount: 0,
        status: 'pending',
        createdAt: daysAgo(1),
      },
      {
        ownerId: userId,
        propertyId: createdProperties[0]._id,
        propertyName: 'Oceanview Beach House',
        sku: 'BATH-SOAP',
        itemName: 'Hand Soap (Refill Bottle)',
        requestedBy: userId,
        requestedByName: 'Maria Garcia',
        currentCount: 1,
        status: 'pending',
        createdAt: daysAgo(1),
      },
      {
        ownerId: userId,
        propertyId: createdProperties[2]._id,
        propertyName: 'Mountain Retreat Cabin',
        sku: 'OUT-WOOD',
        itemName: 'Firewood Bundle',
        requestedBy: userId,
        requestedByName: 'James Wilson',
        currentCount: 0,
        status: 'pending',
        createdAt: daysAgo(2),
      },
      {
        ownerId: userId,
        propertyId: createdProperties[3]._id,
        propertyName: 'Lakeside Villa',
        sku: 'BATH-TOWEL',
        itemName: 'Bath Towels (White)',
        requestedBy: userId,
        requestedByName: 'Sarah Johnson',
        currentCount: 1,
        status: 'pending',
        createdAt: daysAgo(0),
      },
      {
        ownerId: userId,
        propertyId: createdProperties[1]._id,
        propertyName: 'Downtown Loft',
        sku: 'KIT-COFFEE',
        itemName: 'Coffee Pods (K-Cup 24pk)',
        requestedBy: userId,
        requestedByName: 'Mike Chen',
        currentCount: 0,
        status: 'ordered',
        orderQuantity: 3,
        orderedAt: daysAgo(1),
        createdAt: daysAgo(3),
      },
      {
        ownerId: userId,
        propertyId: createdProperties[4]._id,
        propertyName: 'Urban Studio',
        sku: 'BATH-TP',
        itemName: 'Toilet Paper (4-pack)',
        requestedBy: userId,
        requestedByName: 'Lisa Park',
        currentCount: 0,
        status: 'ordered',
        orderQuantity: 6,
        orderedAt: daysAgo(2),
        createdAt: daysAgo(4),
      },
    ];

    await SupplyRequest.insertMany(supplyRequests);

    // Create cleaning reports
    const cleaningReports = [
      {
        propertyId: createdProperties[0]._id,
        cleanerId: userId,
        date: daysAgo(1),
        items: [
          { sku: 'BATH-TP', observedCount: 2, restockedAmount: 2 },
          { sku: 'BATH-SOAP', observedCount: 1, restockedAmount: 2 },
          { sku: 'BATH-TOWEL', observedCount: 4, restockedAmount: 2 },
        ],
        notes: 'Property was in good condition. Restocked toiletries.',
      },
      {
        propertyId: createdProperties[1]._id,
        cleanerId: userId,
        date: daysAgo(2),
        items: [
          { sku: 'BATH-TP', observedCount: 1, restockedAmount: 1 },
          { sku: 'KIT-COFFEE', observedCount: 0, restockedAmount: 1 },
        ],
        notes: 'Guest left early. Minimal cleaning needed.',
      },
      {
        propertyId: createdProperties[2]._id,
        cleanerId: userId,
        date: daysAgo(3),
        items: [
          { sku: 'BATH-TP', observedCount: 3, restockedAmount: 3 },
          { sku: 'OUT-WOOD', observedCount: 0, restockedAmount: 3 },
          { sku: 'CLN-FRESH', observedCount: 1, restockedAmount: 2 },
        ],
        notes: 'Deep cleaned. Fireplace used heavily - need more firewood.',
      },
    ];

    await CleaningReport.insertMany(cleaningReports);

    const lowStockItems = itemsWithHistory.filter(i => i.quantity <= i.lowStockThreshold);

    return NextResponse.json({
      success: true,
      message: 'Demo data seeded successfully!',
      stats: {
        inventoryItems: createdItems.length,
        properties: createdProperties.length,
        supplyRequests: supplyRequests.length,
        cleaningReports: cleaningReports.length,
        lowStockItems: lowStockItems.length,
        categories: ['bathroom', 'bedroom', 'kitchen', 'cleaning', 'amenities', 'outdoor', 'safety'],
      }
    });

  } catch (error) {
    console.error('Seed demo error:', error);
    return NextResponse.json({ error: 'Failed to seed demo data' }, { status: 500 });
  }
}
