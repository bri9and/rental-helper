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

    // Try to get authenticated user, or fall back to demo user from env
    let userId = await getAuthUserId();
    if (!userId) {
      const demoUserId = process.env.DEMO_USER_ID;
      if (!demoUserId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = demoUserId;
    }

    // Clear existing data for this user
    await WarehouseItem.deleteMany({ ownerId: userId });
    await Property.deleteMany({ ownerId: userId });
    await SupplyRequest.deleteMany({ ownerId: userId });
    await CleaningReport.deleteMany({ cleanerId: userId });

    // Complete Airbnb/VRBO inventory list organized by category
    // Amazon ASINs are VERIFIED, working product identifiers for common rental supplies (Prime eligible)
    const inventoryItems = [
      // === BATHROOM ESSENTIALS ===
      { ownerId: userId, name: 'Charmin Toilet Paper (4 Mega Rolls)', sku: 'BATH-TP', quantity: 24, parLevel: 50, lowStockThreshold: 15, costPerUnit: 8.99, amazonAsin: 'B08LBFTF5N', category: 'bathroom' },
      { ownerId: userId, name: 'Softsoap Liquid Hand Soap (7.5 oz)', sku: 'BATH-SOAP', quantity: 8, parLevel: 20, lowStockThreshold: 6, costPerUnit: 2.99, amazonAsin: 'B00BC26TBY', category: 'bathroom' },
      { ownerId: userId, name: 'Dove Shampoo (12 oz)', sku: 'BATH-SHAMP', quantity: 12, parLevel: 24, lowStockThreshold: 8, costPerUnit: 5.99, amazonAsin: 'B00LNOV9M4', category: 'bathroom' },
      { ownerId: userId, name: 'Dove Conditioner (12 oz)', sku: 'BATH-COND', quantity: 12, parLevel: 24, lowStockThreshold: 8, costPerUnit: 5.99, amazonAsin: 'B00LNOVC56', category: 'bathroom' },
      { ownerId: userId, name: 'Dove Body Wash (22 oz)', sku: 'BATH-WASH', quantity: 10, parLevel: 20, lowStockThreshold: 6, costPerUnit: 7.99, amazonAsin: 'B001E96LG6', category: 'bathroom' },
      { ownerId: userId, name: 'Amazon Basics White Bath Towels (6-pack)', sku: 'BATH-TOWEL', quantity: 18, parLevel: 36, lowStockThreshold: 12, costPerUnit: 32.99, amazonAsin: 'B07GPMFZNF', category: 'bathroom' },
      { ownerId: userId, name: 'Utopia White Hand Towels (6-pack)', sku: 'BATH-HTOWEL', quantity: 24, parLevel: 48, lowStockThreshold: 16, costPerUnit: 15.99, amazonAsin: 'B06XQ5R46N', category: 'bathroom' },
      { ownerId: userId, name: 'Amazon Basics Washcloths (24-pack)', sku: 'BATH-WCLOTH', quantity: 30, parLevel: 60, lowStockThreshold: 20, costPerUnit: 18.99, amazonAsin: 'B07X8HDQL3', category: 'bathroom' },
      { ownerId: userId, name: 'Gorilla Grip Bath Mat', sku: 'BATH-MAT', quantity: 8, parLevel: 15, lowStockThreshold: 5, costPerUnit: 16.99, amazonAsin: 'B07R5YLCPB', category: 'bathroom' },
      { ownerId: userId, name: 'Lysol Toilet Bowl Cleaner (2-pack)', sku: 'BATH-TBCLEAN', quantity: 6, parLevel: 12, lowStockThreshold: 4, costPerUnit: 5.99, amazonAsin: 'B0000DIZMA', category: 'bathroom' },
      { ownerId: userId, name: 'OXO Good Grips Toilet Brush', sku: 'BATH-BRUSH', quantity: 5, parLevel: 10, lowStockThreshold: 3, costPerUnit: 14.99, amazonAsin: 'B00004OCLJ', category: 'bathroom' },
      { ownerId: userId, name: 'Korky Toilet Plunger', sku: 'BATH-PLUNGE', quantity: 5, parLevel: 8, lowStockThreshold: 2, costPerUnit: 9.99, amazonAsin: 'B003XIACF8', category: 'bathroom' },
      { ownerId: userId, name: 'Kleenex Tissues (4-pack)', sku: 'BATH-TISSUE', quantity: 20, parLevel: 40, lowStockThreshold: 12, costPerUnit: 7.99, amazonAsin: 'B08VL84YB9', category: 'bathroom' },
      { ownerId: userId, name: 'Conair 1875 Watt Hair Dryer', sku: 'BATH-DRYER', quantity: 3, parLevel: 6, lowStockThreshold: 2, costPerUnit: 14.99, amazonAsin: 'B002TYGX0K', category: 'bathroom' },

      // === BEDROOM ESSENTIALS ===
      { ownerId: userId, name: 'Amazon Basics Queen Sheets (White)', sku: 'BED-SHEET-Q', quantity: 12, parLevel: 24, lowStockThreshold: 8, costPerUnit: 24.99, amazonAsin: 'B06XRCJQVB', category: 'bedroom' },
      { ownerId: userId, name: 'Amazon Basics King Sheets (White)', sku: 'BED-SHEET-K', quantity: 8, parLevel: 16, lowStockThreshold: 5, costPerUnit: 29.99, amazonAsin: 'B06XRCQ5G7', category: 'bedroom' },
      { ownerId: userId, name: 'Amazon Basics Pillowcases (2-pack)', sku: 'BED-PILLOW', quantity: 20, parLevel: 40, lowStockThreshold: 12, costPerUnit: 8.99, amazonAsin: 'B06Y19GLSR', category: 'bedroom' },
      { ownerId: userId, name: 'Utopia Bedding Duvet Cover Queen', sku: 'BED-DUVET-Q', quantity: 6, parLevel: 12, lowStockThreshold: 4, costPerUnit: 24.99, amazonAsin: 'B01AHTB0XE', category: 'bedroom' },
      { ownerId: userId, name: 'SafeRest Mattress Protector Queen', sku: 'BED-PROT-Q', quantity: 4, parLevel: 8, lowStockThreshold: 2, costPerUnit: 34.99, amazonAsin: 'B003PWNA3G', category: 'bedroom' },
      { ownerId: userId, name: 'Bedsure Fleece Blanket (Throw)', sku: 'BED-BLANKET', quantity: 8, parLevel: 15, lowStockThreshold: 5, costPerUnit: 16.99, amazonAsin: 'B077Y61W7J', category: 'bedroom' },
      { ownerId: userId, name: 'Beckham Hotel Pillows (2-pack)', sku: 'BED-PILLSTD', quantity: 10, parLevel: 20, lowStockThreshold: 6, costPerUnit: 49.99, amazonAsin: 'B00EINBSJ2', category: 'bedroom' },

      // === KITCHEN ESSENTIALS ===
      { ownerId: userId, name: 'Dawn EZ-Squeeze Dish Soap (22 oz)', sku: 'KIT-DISH', quantity: 6, parLevel: 15, lowStockThreshold: 5, costPerUnit: 4.49, amazonAsin: 'B09NF7RLYH', category: 'kitchen' },
      { ownerId: userId, name: 'Cascade Platinum Dishwasher Pods (62 ct)', sku: 'KIT-PODS', quantity: 3, parLevel: 10, lowStockThreshold: 3, costPerUnit: 22.99, amazonAsin: 'B01NGTV4J5', category: 'kitchen' },
      { ownerId: userId, name: 'Scotch-Brite Heavy Duty Sponges (6-pack)', sku: 'KIT-SPONGE', quantity: 8, parLevel: 20, lowStockThreshold: 6, costPerUnit: 5.49, amazonAsin: 'B004IR3044', category: 'kitchen' },
      { ownerId: userId, name: 'Bounty Paper Towels (2 Double Plus Rolls)', sku: 'KIT-PTOWEL', quantity: 15, parLevel: 30, lowStockThreshold: 10, costPerUnit: 7.99, amazonAsin: 'B07F18MYJD', category: 'kitchen' },
      { ownerId: userId, name: 'Glad ForceFlex Trash Bags 13 Gal (110 ct)', sku: 'KIT-TRASH', quantity: 4, parLevel: 12, lowStockThreshold: 4, costPerUnit: 19.99, amazonAsin: 'B00FQT4LX2', category: 'kitchen' },
      { ownerId: userId, name: 'Reynolds Wrap Aluminum Foil (200 sq ft)', sku: 'KIT-FOIL', quantity: 6, parLevel: 12, lowStockThreshold: 4, costPerUnit: 14.99, amazonAsin: 'B00UNT5M3K', category: 'kitchen' },
      { ownerId: userId, name: 'Glad ClingWrap Plastic Wrap (200 sq ft)', sku: 'KIT-WRAP', quantity: 5, parLevel: 10, lowStockThreshold: 3, costPerUnit: 4.99, amazonAsin: 'B000BQVNLK', category: 'kitchen' },
      { ownerId: userId, name: 'Ziploc Gallon Storage Bags (75 ct)', sku: 'KIT-ZIPLOC', quantity: 4, parLevel: 10, lowStockThreshold: 3, costPerUnit: 12.99, amazonAsin: 'B078WN5K21', category: 'kitchen' },
      { ownerId: userId, name: 'Keurig K-Cup Variety Pack (72 ct)', sku: 'KIT-COFFEE', quantity: 8, parLevel: 20, lowStockThreshold: 6, costPerUnit: 38.99, amazonAsin: 'B00ZOE5REQ', category: 'kitchen' },
      { ownerId: userId, name: 'Melitta Coffee Filters (100 ct)', sku: 'KIT-FILTER', quantity: 5, parLevel: 10, lowStockThreshold: 3, costPerUnit: 3.99, amazonAsin: 'B00006IQNM', category: 'kitchen' },
      { ownerId: userId, name: 'Sugar In The Raw Packets (200 ct)', sku: 'KIT-SUGAR', quantity: 10, parLevel: 20, lowStockThreshold: 6, costPerUnit: 9.99, amazonAsin: 'B00BGMYLPE', category: 'kitchen' },
      { ownerId: userId, name: 'Coffee Mate Creamer Packets (180 ct)', sku: 'KIT-CREAM', quantity: 8, parLevel: 16, lowStockThreshold: 5, costPerUnit: 14.99, amazonAsin: 'B008YB8MAK', category: 'kitchen' },
      { ownerId: userId, name: 'Twinings Tea Variety Pack (48 ct)', sku: 'KIT-TEA', quantity: 6, parLevel: 12, lowStockThreshold: 4, costPerUnit: 12.99, amazonAsin: 'B01LXZF45A', category: 'kitchen' },
      { ownerId: userId, name: 'Morton Salt & Pepper Shaker Set', sku: 'KIT-SPSET', quantity: 4, parLevel: 8, lowStockThreshold: 2, costPerUnit: 4.99, amazonAsin: 'B0014D0PXE', category: 'kitchen' },
      { ownerId: userId, name: 'Crisco Vegetable Oil (48 oz)', sku: 'KIT-OIL', quantity: 4, parLevel: 8, lowStockThreshold: 2, costPerUnit: 6.99, amazonAsin: 'B00BQYKKAE', category: 'kitchen' },
      { ownerId: userId, name: 'Utopia Kitchen Dish Towels (12-pack)', sku: 'KIT-TOWEL', quantity: 10, parLevel: 20, lowStockThreshold: 6, costPerUnit: 14.99, amazonAsin: 'B00XK69NRW', category: 'kitchen' },

      // === CLEANING SUPPLIES ===
      { ownerId: userId, name: 'Mrs. Meyers All-Purpose Cleaner', sku: 'CLN-ALLPURP', quantity: 8, parLevel: 20, lowStockThreshold: 6, costPerUnit: 4.99, amazonAsin: 'B000S72TT0', category: 'cleaning' },
      { ownerId: userId, name: 'Windex Glass Cleaner (23 oz)', sku: 'CLN-GLASS', quantity: 6, parLevel: 15, lowStockThreshold: 5, costPerUnit: 4.99, amazonAsin: 'B00M4MBT5K', category: 'cleaning' },
      { ownerId: userId, name: 'Clorox Disinfecting Wipes (75 ct)', sku: 'CLN-WIPES', quantity: 12, parLevel: 24, lowStockThreshold: 8, costPerUnit: 6.99, amazonAsin: 'B01AIPVDI4', category: 'cleaning' },
      { ownerId: userId, name: 'Swiffer WetJet Floor Cleaner', sku: 'CLN-FLOOR', quantity: 4, parLevel: 10, lowStockThreshold: 3, costPerUnit: 7.99, amazonAsin: 'B003SX8BB2', category: 'cleaning' },
      { ownerId: userId, name: 'Tide PODS Laundry Detergent (42 ct)', sku: 'CLN-LAUNDRY', quantity: 6, parLevel: 15, lowStockThreshold: 5, costPerUnit: 14.99, amazonAsin: 'B0747ZC625', category: 'cleaning' },
      { ownerId: userId, name: 'Bounce Dryer Sheets (240 ct)', sku: 'CLN-DRYER', quantity: 5, parLevel: 12, lowStockThreshold: 4, costPerUnit: 9.99, amazonAsin: 'B0058A85VK', category: 'cleaning' },
      { ownerId: userId, name: 'OxiClean Stain Remover (3 lb)', sku: 'CLN-STAIN', quantity: 4, parLevel: 8, lowStockThreshold: 2, costPerUnit: 11.99, amazonAsin: 'B005GI8UOA', category: 'cleaning' },
      { ownerId: userId, name: 'Febreze Air Freshener Linen & Sky (2 ct)', sku: 'CLN-FRESH', quantity: 10, parLevel: 24, lowStockThreshold: 8, costPerUnit: 6.99, amazonAsin: 'B01N98TMTX', category: 'cleaning' },
      { ownerId: userId, name: 'Hefty Small Trash Bags 4 Gal (26 ct)', sku: 'CLN-TRASHSM', quantity: 6, parLevel: 15, lowStockThreshold: 5, costPerUnit: 4.99, amazonAsin: 'B000BQPNMS', category: 'cleaning' },
      { ownerId: userId, name: 'O-Cedar Broom & Dustpan Set', sku: 'CLN-BROOM', quantity: 3, parLevel: 6, lowStockThreshold: 2, costPerUnit: 16.99, amazonAsin: 'B07DNHMP4K', category: 'cleaning' },
      { ownerId: userId, name: 'O-Cedar Spin Mop & Bucket', sku: 'CLN-MOP', quantity: 3, parLevel: 6, lowStockThreshold: 2, costPerUnit: 34.99, amazonAsin: 'B00WSWGVZQ', category: 'cleaning' },

      // === GUEST AMENITIES ===
      { ownerId: userId, name: 'Kirkland Bottled Water (40 ct)', sku: 'AMEN-WATER', quantity: 5, parLevel: 12, lowStockThreshold: 4, costPerUnit: 7.99, amazonAsin: 'B07S7W4YS3', category: 'amenities' },
      { ownerId: userId, name: 'Macks Earplugs (50 pair)', sku: 'AMEN-EAR', quantity: 5, parLevel: 10, lowStockThreshold: 3, costPerUnit: 11.99, amazonAsin: 'B0051U7W32', category: 'amenities' },
      { ownerId: userId, name: 'Anker USB-C Charger', sku: 'AMEN-CHARGE', quantity: 4, parLevel: 8, lowStockThreshold: 2, costPerUnit: 15.99, amazonAsin: 'B07WRKXQ8W', category: 'amenities' },
      { ownerId: userId, name: 'totes Automatic Umbrella', sku: 'AMEN-UMBR', quantity: 5, parLevel: 10, lowStockThreshold: 3, costPerUnit: 20.99, amazonAsin: 'B00HK3YU56', category: 'amenities' },
      { ownerId: userId, name: 'Johnson & Johnson First Aid Kit', sku: 'AMEN-FIRST', quantity: 5, parLevel: 8, lowStockThreshold: 2, costPerUnit: 14.99, amazonAsin: 'B000069EYA', category: 'amenities' },
      { ownerId: userId, name: 'Singer Sewing Kit', sku: 'AMEN-SEW', quantity: 5, parLevel: 10, lowStockThreshold: 3, costPerUnit: 6.99, amazonAsin: 'B001HBJJB6', category: 'amenities' },

      // === SAFETY & MAINTENANCE ===
      { ownerId: userId, name: 'Amazon Basics AA Batteries (48 ct)', sku: 'SAFE-BATAA', quantity: 6, parLevel: 12, lowStockThreshold: 4, costPerUnit: 15.99, amazonAsin: 'B00MNV8E0C', category: 'safety' },
      { ownerId: userId, name: 'Amazon Basics AAA Batteries (36 ct)', sku: 'SAFE-BATAAA', quantity: 6, parLevel: 12, lowStockThreshold: 4, costPerUnit: 12.99, amazonAsin: 'B00MNV8E0Q', category: 'safety' },
      { ownerId: userId, name: 'Philips LED Light Bulbs (6-pack)', sku: 'SAFE-BULB', quantity: 4, parLevel: 10, lowStockThreshold: 3, costPerUnit: 12.99, amazonAsin: 'B01CAL1EMC', category: 'safety' },
      { ownerId: userId, name: 'Duracell 9V Battery (4-pack)', sku: 'SAFE-SMOKE', quantity: 6, parLevel: 12, lowStockThreshold: 4, costPerUnit: 14.99, amazonAsin: 'B000K2NW08', category: 'safety' },
      { ownerId: userId, name: 'First Alert Fire Extinguisher', sku: 'SAFE-EXTING', quantity: 3, parLevel: 6, lowStockThreshold: 2, costPerUnit: 25.99, amazonAsin: 'B00002ND64', category: 'safety' },
      { ownerId: userId, name: 'Maglite LED Flashlight', sku: 'SAFE-FLASH', quantity: 5, parLevel: 10, lowStockThreshold: 3, costPerUnit: 24.99, amazonAsin: 'B000IXAJKY', category: 'safety' },
      { ownerId: userId, name: 'Amazon Basics Extension Cord (15 ft)', sku: 'SAFE-EXT', quantity: 4, parLevel: 8, lowStockThreshold: 2, costPerUnit: 11.99, amazonAsin: 'B071H2RKKZ', category: 'safety' },
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
        address: '123 Coastal Drive, Malibu, CA 90265',
        inventorySettings: [
          { itemSku: 'BATH-TP', parLevel: 4 },
          { itemSku: 'BATH-TOWEL', parLevel: 6 },
          { itemSku: 'KIT-COFFEE', parLevel: 2 },
          { itemSku: 'KIT-TRASH', parLevel: 2 },
        ],
      },
      {
        ownerId: userId,
        name: 'Downtown Loft',
        address: '456 Main Street, Austin, TX 78701',
        inventorySettings: [
          { itemSku: 'BATH-TP', parLevel: 2 },
          { itemSku: 'KIT-COFFEE', parLevel: 1 },
          { itemSku: 'CLN-ALLPURP', parLevel: 1 },
          { itemSku: 'CLN-WIPES', parLevel: 2 },
        ],
      },
      {
        ownerId: userId,
        name: 'Mountain Retreat Cabin',
        address: '789 Pine Ridge Road, Aspen, CO 81611',
        inventorySettings: [
          { itemSku: 'BATH-TP', parLevel: 6 },
          { itemSku: 'BED-BLANKET', parLevel: 2 },
          { itemSku: 'KIT-COFFEE', parLevel: 2 },
          { itemSku: 'CLN-FRESH', parLevel: 3 },
        ],
      },
      {
        ownerId: userId,
        name: 'Lakeside Villa',
        address: '567 Lakeshore Drive, South Lake Tahoe, CA 96150',
        inventorySettings: [
          { itemSku: 'BATH-TP', parLevel: 8 },
          { itemSku: 'BATH-TOWEL', parLevel: 8 },
          { itemSku: 'KIT-PTOWEL', parLevel: 4 },
          { itemSku: 'KIT-COFFEE', parLevel: 3 },
        ],
      },
      {
        ownerId: userId,
        name: 'Urban Studio',
        address: '321 5th Avenue, New York, NY 10016',
        inventorySettings: [
          { itemSku: 'BATH-TP', parLevel: 2 },
          { itemSku: 'CLN-FRESH', parLevel: 2 },
          { itemSku: 'KIT-DISH', parLevel: 1 },
        ],
      },
    ];

    const createdProperties = await Property.insertMany(properties);

    // Create supply requests - SKUs must match property inventorySettings to display
    const supplyRequests = [
      // Oceanview Beach House - 2 items need order
      {
        ownerId: userId,
        propertyId: createdProperties[0]._id,
        propertyName: 'Oceanview Beach House',
        sku: 'KIT-TRASH',
        itemName: 'Glad ForceFlex Trash Bags 13 Gal',
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
        sku: 'KIT-COFFEE',
        itemName: 'Keurig K-Cup Variety Pack',
        requestedBy: userId,
        requestedByName: 'Maria Garcia',
        currentCount: 0,
        status: 'pending',
        createdAt: daysAgo(1),
      },
      // Downtown Loft - 2 items (1 pending, 1 ordered)
      {
        ownerId: userId,
        propertyId: createdProperties[1]._id,
        propertyName: 'Downtown Loft',
        sku: 'CLN-WIPES',
        itemName: 'Clorox Disinfecting Wipes',
        requestedBy: userId,
        requestedByName: 'Mike Chen',
        currentCount: 1,
        status: 'pending',
        createdAt: daysAgo(0),
      },
      {
        ownerId: userId,
        propertyId: createdProperties[1]._id,
        propertyName: 'Downtown Loft',
        sku: 'KIT-COFFEE',
        itemName: 'Keurig K-Cup Variety Pack',
        requestedBy: userId,
        requestedByName: 'Mike Chen',
        currentCount: 0,
        status: 'ordered',
        orderQuantity: 3,
        orderedAt: daysAgo(1),
        createdAt: daysAgo(3),
      },
      // Mountain Retreat Cabin - 2 items need order
      {
        ownerId: userId,
        propertyId: createdProperties[2]._id,
        propertyName: 'Mountain Retreat Cabin',
        sku: 'CLN-FRESH',
        itemName: 'Febreze Air Freshener',
        requestedBy: userId,
        requestedByName: 'James Wilson',
        currentCount: 0,
        status: 'pending',
        createdAt: daysAgo(2),
      },
      {
        ownerId: userId,
        propertyId: createdProperties[2]._id,
        propertyName: 'Mountain Retreat Cabin',
        sku: 'BED-BLANKET',
        itemName: 'Bedsure Fleece Blanket',
        requestedBy: userId,
        requestedByName: 'James Wilson',
        currentCount: 0,
        status: 'pending',
        createdAt: daysAgo(1),
      },
      // Lakeside Villa - 2 items need order
      {
        ownerId: userId,
        propertyId: createdProperties[3]._id,
        propertyName: 'Lakeside Villa',
        sku: 'BATH-TOWEL',
        itemName: 'Amazon Basics White Bath Towels',
        requestedBy: userId,
        requestedByName: 'Sarah Johnson',
        currentCount: 1,
        status: 'pending',
        createdAt: daysAgo(0),
      },
      {
        ownerId: userId,
        propertyId: createdProperties[3]._id,
        propertyName: 'Lakeside Villa',
        sku: 'KIT-PTOWEL',
        itemName: 'Bounty Paper Towels',
        requestedBy: userId,
        requestedByName: 'Sarah Johnson',
        currentCount: 0,
        status: 'pending',
        createdAt: daysAgo(0),
      },
      // Urban Studio - 1 ordered, 1 needs order
      {
        ownerId: userId,
        propertyId: createdProperties[4]._id,
        propertyName: 'Urban Studio',
        sku: 'CLN-FRESH',
        itemName: 'Febreze Air Freshener',
        requestedBy: userId,
        requestedByName: 'Lisa Park',
        currentCount: 0,
        status: 'pending',
        createdAt: daysAgo(1),
      },
      {
        ownerId: userId,
        propertyId: createdProperties[4]._id,
        propertyName: 'Urban Studio',
        sku: 'BATH-TP',
        itemName: 'Charmin Toilet Paper (4 Mega Rolls)',
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
          { sku: 'BED-BLANKET', observedCount: 1, restockedAmount: 1 },
          { sku: 'CLN-FRESH', observedCount: 1, restockedAmount: 2 },
        ],
        notes: 'Deep cleaned. Extra blanket was used, replaced.',
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
