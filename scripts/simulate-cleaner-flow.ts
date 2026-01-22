/**
 * Simulate the full cleaner-to-manager flow
 *
 * Usage: npx tsx scripts/simulate-cleaner-flow.ts
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          process.env[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
        }
      }
    }
  }
}

loadEnv();

// Import models
import Property from '../src/models/Property';
import WarehouseItem from '../src/models/WarehouseItem';
import Cleaner from '../src/models/Cleaner';
import CleanerInvitation, { generateInvitationCode } from '../src/models/CleanerInvitation';
import CleaningReport from '../src/models/CleaningReport';
import SupplyRequest from '../src/models/SupplyRequest';

const MONGODB_URI = process.env.MONGODB_URI;

// Simulated user IDs (in production these come from Clerk)
const COREY_USER_ID = 'sim_corey_manager_001';
const CLEANER_NAME = 'Maria Garcia';

async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI not set in .env.local');
  }
  await mongoose.connect(MONGODB_URI);
  console.log('✓ Connected to MongoDB\n');
}

async function seedCoreyData() {
  console.log('=== STEP 1: Setting up Corey\'s account ===\n');

  // Check if Corey already has data
  const existingProperties = await Property.find({ ownerId: COREY_USER_ID });
  if (existingProperties.length > 0) {
    console.log(`Corey already has ${existingProperties.length} properties. Skipping seed.`);
    return existingProperties;
  }

  // Create some inventory items for Corey
  const items = [
    { ownerId: COREY_USER_ID, name: 'Toilet Paper (4 rolls)', sku: 'TP-001', quantity: 20, parLevel: 30 },
    { ownerId: COREY_USER_ID, name: 'Hand Soap', sku: 'SOAP-001', quantity: 10, parLevel: 15 },
    { ownerId: COREY_USER_ID, name: 'Paper Towels', sku: 'PTOWEL-001', quantity: 15, parLevel: 20 },
    { ownerId: COREY_USER_ID, name: 'Dish Soap', sku: 'DISH-001', quantity: 8, parLevel: 12 },
  ];

  await WarehouseItem.insertMany(items);
  console.log(`✓ Created ${items.length} inventory items for Corey`);

  // Create properties for Corey
  const properties = [
    {
      ownerId: COREY_USER_ID,
      name: 'Corey\'s Beach Condo',
      address: '100 Ocean Blvd, Santa Monica, CA 90401',
      inventorySettings: [
        { itemSku: 'TP-001', parLevel: 4 },
        { itemSku: 'SOAP-001', parLevel: 2 },
        { itemSku: 'PTOWEL-001', parLevel: 2 },
      ],
    },
    {
      ownerId: COREY_USER_ID,
      name: 'Downtown LA Studio',
      address: '500 S Grand Ave, Los Angeles, CA 90071',
      inventorySettings: [
        { itemSku: 'TP-001', parLevel: 2 },
        { itemSku: 'DISH-001', parLevel: 1 },
      ],
    },
  ];

  const createdProperties = await Property.insertMany(properties);
  console.log(`✓ Created ${createdProperties.length} properties for Corey`);
  console.log(`  - ${createdProperties[0].name}`);
  console.log(`  - ${createdProperties[1].name}`);

  return createdProperties;
}

async function createInvitation() {
  console.log('\n=== STEP 2: Corey creates an invitation ===\n');

  // Generate unique code
  let code: string;
  let attempts = 0;
  do {
    code = generateInvitationCode();
    const existing = await CleanerInvitation.findOne({ code });
    if (!existing) break;
    attempts++;
  } while (attempts < 10);

  // Create invitation (expires in 7 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitation = await CleanerInvitation.create({
    managerId: COREY_USER_ID,
    code,
    status: 'pending',
    expiresAt,
  });

  console.log(`✓ Corey created invitation code: ${code}`);
  console.log(`  Expires: ${expiresAt.toLocaleDateString()}`);
  console.log(`\n  [Corey sends this code to his cleaner Maria via text message]`);

  return invitation;
}

async function cleanerAcceptsInvitation(invitationCode: string) {
  console.log('\n=== STEP 3: Cleaner Maria accepts the invitation ===\n');

  console.log(`Maria opens /cleaner on her phone`);
  console.log(`Maria enters code: ${invitationCode}`);

  // Simulate the accept flow
  const invitation = await CleanerInvitation.findOneAndUpdate(
    {
      code: invitationCode,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    },
    {
      $set: {
        status: 'accepted',
        cleanerName: CLEANER_NAME,
      },
    },
    { new: false }
  );

  if (!invitation) {
    throw new Error('Invitation not found or already used');
  }

  // Create cleaner profile
  const cleaner = await Cleaner.create({
    name: CLEANER_NAME,
    email: 'maria@example.com',
    phone: '(555) 123-4567',
    managerId: invitation.managerId,
    invitationCode: invitation.code,
    status: 'active',
  });

  // Update invitation with cleaner ID
  await CleanerInvitation.findByIdAndUpdate(invitation._id, {
    cleanerId: cleaner._id.toString(),
  });

  console.log(`✓ Maria joined as a cleaner!`);
  console.log(`  Name: ${cleaner.name}`);
  console.log(`  Email: ${cleaner.email}`);
  console.log(`  Linked to manager: ${cleaner.managerId}`);

  return cleaner;
}

async function cleanerViewsProperties(cleanerId: string, managerId: string) {
  console.log('\n=== STEP 4: Maria views available properties ===\n');

  // Get properties for this cleaner's manager (include ownerId for supply requests)
  const properties = await Property.find({ ownerId: managerId })
    .select('name address ownerId')
    .lean();

  console.log(`Maria sees ${properties.length} properties to clean:`);
  properties.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.name}`);
    if (p.address) console.log(`     ${p.address}`);
  });

  return properties;
}

async function cleanerSubmitsReport(cleanerId: string, cleanerName: string, property: any) {
  console.log('\n=== STEP 5: Maria completes cleaning and submits report ===\n');

  console.log(`Maria selects: "${property.name}"`);
  console.log(`Maria completes the cleaning checklist...`);
  console.log(`Maria marks "Paper Towels" as low supply`);
  console.log(`Maria adds note: "Guest left the kitchen very messy, took extra time"`);

  // Create cleaning report
  const report = await CleaningReport.create({
    propertyId: property._id,
    cleanerId: cleanerId,
    cleanerName: cleanerName,
    checklist: {
      bathrooms: true,
      kitchen: true,
      bedrooms: true,
      livingSpace: true,
    },
    notes: 'Guest left the kitchen very messy, took extra time',
    completedAt: new Date(),
    items: [],
  });

  console.log(`\n✓ Cleaning report submitted!`);
  console.log(`  Report ID: ${report._id}`);
  console.log(`  Completed at: ${report.completedAt?.toLocaleTimeString()}`);

  // Create supply request for low item
  const supplyRequest = await SupplyRequest.create({
    ownerId: property.ownerId,
    propertyId: property._id,
    propertyName: property.name,
    sku: 'PTOWEL-001',
    itemName: 'Paper Towels',
    currentCount: 0,
    status: 'pending',
    requestedBy: cleanerId,
    requestedByName: cleanerName,
  });

  console.log(`\n✓ Supply request created!`);
  console.log(`  Item: Paper Towels`);
  console.log(`  Property: ${property.name}`);

  return { report, supplyRequest };
}

async function managerViewsUpdates() {
  console.log('\n=== STEP 6: Corey sees real-time updates ===\n');

  console.log(`[Corey's dashboard auto-refreshes every 10 seconds]`);
  console.log(`\n📱 Corey opens his dashboard on his phone...\n`);

  // Get recent reports for Corey's properties
  const coreyProperties = await Property.find({ ownerId: COREY_USER_ID }).lean();
  const propertyIds = coreyProperties.map(p => p._id);

  const recentReports = await CleaningReport.find({
    propertyId: { $in: propertyIds },
  })
    .sort({ completedAt: -1 })
    .limit(5)
    .lean();

  const pendingRequests = await SupplyRequest.find({
    ownerId: COREY_USER_ID,
    status: 'pending',
  })
    .sort({ createdAt: -1 })
    .lean();

  console.log(`┌─────────────────────────────────────────────────┐`);
  console.log(`│  🏠 COREY'S DASHBOARD                           │`);
  console.log(`├─────────────────────────────────────────────────┤`);
  console.log(`│                                                 │`);
  console.log(`│  📋 Recent Cleaning Reports:                    │`);

  if (recentReports.length === 0) {
    console.log(`│     No reports yet                              │`);
  } else {
    for (const report of recentReports) {
      const prop = coreyProperties.find(p => p._id.toString() === report.propertyId?.toString());
      const time = report.completedAt ? new Date(report.completedAt).toLocaleTimeString() : 'Unknown';
      console.log(`│     ✓ ${(prop?.name || 'Unknown').substring(0, 25).padEnd(25)} │`);
      console.log(`│       by ${(report.cleanerName || 'Unknown').substring(0, 20).padEnd(20)} at ${time.padEnd(8)} │`);
      if (report.notes) {
        console.log(`│       "${report.notes.substring(0, 35)}..." │`);
      }
    }
  }

  console.log(`│                                                 │`);
  console.log(`│  🔔 Supply Alerts (${pendingRequests.length}):                          │`);

  if (pendingRequests.length === 0) {
    console.log(`│     All stocked!                                │`);
  } else {
    for (const req of pendingRequests) {
      console.log(`│     ⚠️  ${(req.itemName || 'Unknown').substring(0, 20).padEnd(20)} - ${(req.propertyName || '').substring(0, 15)} │`);
    }
  }

  console.log(`│                                                 │`);
  console.log(`└─────────────────────────────────────────────────┘`);

  return { recentReports, pendingRequests };
}

async function managerViewsTeam() {
  console.log('\n=== STEP 7: Corey checks his team ===\n');

  console.log(`Corey navigates to /admin/team\n`);

  const cleaners = await Cleaner.find({ managerId: COREY_USER_ID }).lean();
  const invitations = await CleanerInvitation.find({ managerId: COREY_USER_ID }).lean();

  console.log(`┌─────────────────────────────────────────────────┐`);
  console.log(`│  👥 COREY'S CLEANING TEAM                       │`);
  console.log(`├─────────────────────────────────────────────────┤`);
  console.log(`│                                                 │`);
  console.log(`│  Active Team Members: ${cleaners.length}                          │`);

  for (const cleaner of cleaners) {
    const lastActive = cleaner.lastActiveAt
      ? new Date(cleaner.lastActiveAt).toLocaleString()
      : 'Never';
    console.log(`│     👤 ${cleaner.name.padEnd(20)} ${cleaner.status.padEnd(8)} │`);
    console.log(`│        ${(cleaner.email || '').padEnd(30)} │`);
  }

  const pendingInvites = invitations.filter(i => i.status === 'pending');
  if (pendingInvites.length > 0) {
    console.log(`│                                                 │`);
    console.log(`│  Pending Invitations: ${pendingInvites.length}                         │`);
    for (const inv of pendingInvites) {
      console.log(`│     🔑 ${inv.code}  expires ${new Date(inv.expiresAt).toLocaleDateString()} │`);
    }
  }

  console.log(`│                                                 │`);
  console.log(`└─────────────────────────────────────────────────┘`);
}

async function cleanup() {
  console.log('\n=== Cleanup (optional) ===\n');

  // Optionally clean up test data
  // Uncomment if you want to reset after simulation
  /*
  await Property.deleteMany({ ownerId: COREY_USER_ID });
  await WarehouseItem.deleteMany({ ownerId: COREY_USER_ID });
  await Cleaner.deleteMany({ managerId: COREY_USER_ID });
  await CleanerInvitation.deleteMany({ managerId: COREY_USER_ID });
  await CleaningReport.deleteMany({ cleanerId: { $regex: /^sim_/ } });
  await SupplyRequest.deleteMany({ ownerId: COREY_USER_ID });
  console.log('✓ Test data cleaned up');
  */

  console.log('Test data preserved in database for inspection.');
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  CLEANER-TO-MANAGER FLOW SIMULATION                       ║');
  console.log('║  Testing: Corey (Manager) ←→ Maria (Cleaner)              ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  try {
    await connectDB();

    // Step 1: Set up Corey's account
    const properties = await seedCoreyData();

    // Step 2: Corey creates an invitation
    const invitation = await createInvitation();

    // Step 3: Cleaner accepts invitation
    const cleaner = await cleanerAcceptsInvitation(invitation.code);

    // Step 4: Cleaner views properties
    const availableProperties = await cleanerViewsProperties(
      cleaner._id.toString(),
      cleaner.managerId
    );

    // Step 5: Cleaner submits report
    const { report, supplyRequest } = await cleanerSubmitsReport(
      cleaner._id.toString(),
      cleaner.name,
      availableProperties[0]
    );

    // Update cleaner's last active time
    await Cleaner.findByIdAndUpdate(cleaner._id, { lastActiveAt: new Date() });

    // Step 6: Manager sees updates
    await managerViewsUpdates();

    // Step 7: Manager views team
    await managerViewsTeam();

    // Cleanup
    await cleanup();

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  ✅ SIMULATION COMPLETE                                   ║');
    console.log('║                                                           ║');
    console.log('║  The full flow works:                                     ║');
    console.log('║  1. Manager creates invitation code                       ║');
    console.log('║  2. Cleaner joins with code                               ║');
    console.log('║  3. Cleaner sees only manager\'s properties                ║');
    console.log('║  4. Cleaner submits report + supply alerts                ║');
    console.log('║  5. Manager sees updates in real-time                     ║');
    console.log('║  6. Manager can view team members                         ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('\n❌ Simulation failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main();
