'use server';

import { clerkClient } from '@clerk/nextjs/server';
import { getAuthUserId, isDevMode } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db';
import Property from '@/models/Property';
import WarehouseItem from '@/models/WarehouseItem';
import CleaningReport, { IReportItem } from '@/models/CleaningReport';
import SupplyRequest from '@/models/SupplyRequest';
import { sendRestockAlert, sendShortageAlert, LowStockItem } from '@/lib/email';

export type ReportItemInput = {
  sku: string;
  observedCount: number;
};

export type SupplyRequestInput = {
  sku: string;
  name: string;
  currentCount: number;
};

export type SubmitReportInput = {
  propertyId: string;
  propertyName?: string;
  items: ReportItemInput[];
  notes?: string;
  supplyRequests?: SupplyRequestInput[];
};

export type RestockResult = {
  sku: string;
  itemName: string;
  observedCount: number;
  parLevel: number;
  needed: number;
  restocked: number;
  shortage: boolean;
  newWarehouseQuantity: number;
  lowStockAlert: boolean;
};

export type SubmitReportResult = {
  success: boolean;
  error?: string;
  reportId?: string;
  results?: RestockResult[];
  hasShortages?: boolean;
  hasLowStockAlerts?: boolean;
  supplyRequestsCreated?: number;
};

/**
 * The Inventory Cascade Algorithm
 *
 * When a cleaner submits a report:
 * 1. Calculate Deficit: For each item, Needed = Property.Par - Observed
 * 2. Warehouse Query: Check WarehouseItem for available stock
 * 3. Branching Logic:
 *    - If Warehouse has Stock: Deduct Needed from WarehouseItem. Log as "Restocked"
 *    - If Warehouse is Empty: Flag item as "CRITICAL SHORTAGE". Do not deduct.
 * 4. Threshold Check: After deduction, if quantity <= lowStockThreshold, flag for alert
 */
export async function submitReport(input: SubmitReportInput): Promise<SubmitReportResult> {
  try {
    await dbConnect();

    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get property with inventory settings
    const property = await Property.findOne({
      _id: input.propertyId,
      ownerId: userId,
    });

    if (!property) {
      return { success: false, error: 'Property not found' };
    }

    const results: RestockResult[] = [];
    const reportItems: IReportItem[] = [];
    let hasShortages = false;
    let hasLowStockAlerts = false;

    // Process each item reported
    for (const reportedItem of input.items) {
      // Find the property's par level for this item
      const propertySetting = property.inventorySettings.find(
        (s: { itemSku: string }) => s.itemSku === reportedItem.sku
      );

      if (!propertySetting) {
        continue; // Skip items not configured for this property
      }

      const propertyPar = propertySetting.parLevel;
      const observed = reportedItem.observedCount;
      const needed = Math.max(0, propertyPar - observed);

      // Get the warehouse item
      const warehouseItem = await WarehouseItem.findOne({
        ownerId: userId,
        sku: reportedItem.sku,
      });

      if (!warehouseItem) {
        continue; // Skip if item doesn't exist in warehouse
      }

      let restocked = 0;
      let shortage = false;
      let lowStockAlert = false;

      if (needed > 0) {
        if (warehouseItem.quantity >= needed) {
          // Warehouse has enough stock - deduct the full amount
          restocked = needed;
          warehouseItem.quantity -= needed;
        } else if (warehouseItem.quantity > 0) {
          // Partial stock available - deduct what we have
          restocked = warehouseItem.quantity;
          warehouseItem.quantity = 0;
          shortage = true;
          hasShortages = true;
        } else {
          // No stock available
          shortage = true;
          hasShortages = true;
        }

        // Record burn rate for AI analysis
        warehouseItem.burnRateHistory.push({
          date: new Date(),
          amountUsed: restocked,
        });

        // Keep only last 90 days of history
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        warehouseItem.burnRateHistory = warehouseItem.burnRateHistory.filter(
          (entry: { date: Date }) => entry.date >= ninetyDaysAgo
        );

        await warehouseItem.save();

        // Check if we need to send a low stock alert (50% rule)
        if (warehouseItem.quantity <= warehouseItem.lowStockThreshold) {
          lowStockAlert = true;
          hasLowStockAlerts = true;
        }
      }

      results.push({
        sku: reportedItem.sku,
        itemName: warehouseItem.name,
        observedCount: observed,
        parLevel: propertyPar,
        needed,
        restocked,
        shortage,
        newWarehouseQuantity: warehouseItem.quantity,
        lowStockAlert,
      });

      reportItems.push({
        sku: reportedItem.sku,
        observedCount: observed,
        restockedAmount: restocked,
      });
    }

    // Create the cleaning report record
    const report = await CleaningReport.create({
      propertyId: input.propertyId,
      cleanerId: userId,
      date: new Date(),
      items: reportItems,
      notes: input.notes,
    });

    // Create supply requests if any were flagged
    let supplyRequestsCreated = 0;
    if (input.supplyRequests && input.supplyRequests.length > 0) {
      // Get cleaner name from Clerk (optional, for display purposes)
      let cleanerName: string | undefined;
      try {
        if (!isDevMode()) {
          const client = await clerkClient();
          const user = await client.users.getUser(userId);
          cleanerName = user.firstName
            ? `${user.firstName} ${user.lastName || ''}`.trim()
            : user.emailAddresses[0]?.emailAddress;
        }
      } catch {
        // Ignore errors getting user name
      }

      for (const request of input.supplyRequests) {
        // Check if there's already a pending request for this item at this property
        const existingRequest = await SupplyRequest.findOne({
          propertyId: input.propertyId,
          sku: request.sku,
          status: 'pending',
        });

        if (!existingRequest) {
          await SupplyRequest.create({
            ownerId: userId,
            propertyId: input.propertyId,
            propertyName: input.propertyName || property.name,
            sku: request.sku,
            itemName: request.name,
            requestedBy: userId,
            requestedByName: cleanerName,
            currentCount: request.currentCount,
            status: 'pending',
          });
          supplyRequestsCreated++;
        }
      }
    }

    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/inventory');
    revalidatePath('/admin/supply-requests');
    revalidatePath('/staff');

    // Send email alerts (non-blocking)
    sendEmailAlerts({
      userId,
      propertyName: property.name,
      results,
      hasLowStockAlerts,
      hasShortages,
    }).catch((err) => {
      console.error('[Email] Failed to send alerts:', err);
    });

    return {
      success: true,
      reportId: report._id.toString(),
      results,
      hasShortages,
      hasLowStockAlerts,
      supplyRequestsCreated,
    };
  } catch (error) {
    console.error('Error submitting report:', error);
    return { success: false, error: 'Failed to submit report' };
  }
}

/**
 * Helper function to send email alerts after report submission
 */
async function sendEmailAlerts(params: {
  userId: string;
  propertyName: string;
  results: RestockResult[];
  hasLowStockAlerts: boolean;
  hasShortages: boolean;
}) {
  const { userId, propertyName, results, hasLowStockAlerts, hasShortages } = params;

  // Skip email alerts in dev mode
  if (isDevMode()) {
    console.log('[Email] Skipping alerts in dev mode');
    return;
  }

  // Get user's email from Clerk
  let userEmail: string | undefined;
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    userEmail = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId
    )?.emailAddress;
  } catch (err) {
    console.error('[Email] Failed to get user email:', err);
    return;
  }

  if (!userEmail) {
    console.log('[Email] No email address found for user');
    return;
  }

  // Send low stock alert if any items are below threshold
  if (hasLowStockAlerts) {
    const lowStockItems: LowStockItem[] = results
      .filter((r) => r.lowStockAlert)
      .map((r) => ({
        name: r.itemName,
        sku: r.sku,
        currentQuantity: r.newWarehouseQuantity,
        lowStockThreshold: 0, // We don't have this in results, will need to fetch
        parLevel: r.parLevel,
      }));

    // Fetch actual thresholds
    await dbConnect();
    const skus = lowStockItems.map((i) => i.sku);
    const items = await WarehouseItem.find({ sku: { $in: skus } }).lean();

    for (const lowStockItem of lowStockItems) {
      const dbItem = items.find((i: { sku: string }) => i.sku === lowStockItem.sku);
      if (dbItem) {
        lowStockItem.lowStockThreshold = (dbItem as { lowStockThreshold: number }).lowStockThreshold;
      }
    }

    await sendRestockAlert({
      toEmail: userEmail,
      propertyName,
      items: lowStockItems,
    });
  }

  // Send shortage alert if any items couldn't be fully restocked
  if (hasShortages) {
    const shortageItems = results
      .filter((r) => r.shortage)
      .map((r) => ({
        name: r.itemName,
        sku: r.sku,
        needed: r.needed,
        available: r.restocked,
      }));

    await sendShortageAlert({
      toEmail: userEmail,
      propertyName,
      shortageItems,
    });
  }
}

/**
 * Get report data for a property (items to check with current counts)
 */
export async function getPropertyReportData(propertyId: string) {
  await dbConnect();

  const userId = await getAuthUserId();
  if (!userId) {
    return null;
  }

  const property = await Property.findOne({
    _id: propertyId,
    ownerId: userId,
  }).lean();

  if (!property) {
    return null;
  }

  // Get warehouse items for this property's inventory settings
  const skus = property.inventorySettings.map((s: { itemSku: string }) => s.itemSku);
  const warehouseItems = await WarehouseItem.find({
    ownerId: userId,
    sku: { $in: skus },
  }).lean();

  // Build the checklist
  const checklist = property.inventorySettings.map((setting: { itemSku: string; parLevel: number }) => {
    const item = warehouseItems.find((w: { sku: string }) => w.sku === setting.itemSku);
    return {
      sku: setting.itemSku,
      name: item?.name ?? setting.itemSku,
      parLevel: setting.parLevel,
      warehouseQuantity: item?.quantity ?? 0,
    };
  });

  return {
    property: JSON.parse(JSON.stringify(property)),
    checklist,
  };
}
