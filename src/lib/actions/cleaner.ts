'use server';

import dbConnect from "@/lib/db";
import CleaningReport, { ICleaningChecklist } from "@/models/CleaningReport";
import SupplyRequest from "@/models/SupplyRequest";
import Property from "@/models/Property";

interface SubmitCleaningReportInput {
  propertyId: string;
  propertyName: string;
  ownerId: string;
  cleanerName: string;
  checklist: ICleaningChecklist;
  lowSupplies: { sku: string; name: string }[];
  notes?: string;
}

export async function submitCleaningReport(input: SubmitCleaningReportInput) {
  await dbConnect();

  try {
    // Create the cleaning report
    const report = await CleaningReport.create({
      propertyId: input.propertyId,
      cleanerId: 'cleaner', // Anonymous cleaner ID
      cleanerName: input.cleanerName,
      checklist: input.checklist,
      notes: input.notes,
      completedAt: new Date(),
      items: [], // No inventory counts in simplified cleaner form
    });

    // Create supply requests for low items
    if (input.lowSupplies.length > 0) {
      const supplyRequests = input.lowSupplies.map(supply => ({
        ownerId: input.ownerId,
        propertyId: input.propertyId,
        propertyName: input.propertyName,
        sku: supply.sku,
        itemName: supply.name,
        currentCount: 0, // Unknown count from simplified form
        status: 'pending',
        requestedBy: 'cleaner',
        requestedByName: input.cleanerName,
      }));

      await SupplyRequest.insertMany(supplyRequests);
    }

    return { success: true, reportId: report._id.toString() };
  } catch (error) {
    console.error('[submitCleaningReport] Error:', error);
    return { success: false, error: 'Failed to submit cleaning report' };
  }
}

export async function getCleanerProperties(_accessCode?: string) {
  await dbConnect();

  // For now, return all properties
  // In production, filter by access code or cleaner assignment
  const properties = await Property.find()
    .select("name address")
    .sort({ name: 1 })
    .lean();

  return JSON.parse(JSON.stringify(properties));
}
