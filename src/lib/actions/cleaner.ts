'use server';

import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import CleaningReport, { ICleaningChecklist } from "@/models/CleaningReport";
import type { IMaintenanceIssue } from "@/lib/maintenance-categories";
import SupplyRequest from "@/models/SupplyRequest";
import Property from "@/models/Property";
import Cleaner from "@/models/Cleaner";

interface SubmitCleaningReportInput {
  propertyId: string;
  cleanerId: string;
  checklist: ICleaningChecklist;
  lowSupplies: { sku: string; name: string }[];
  maintenanceIssues?: IMaintenanceIssue[];
  notes?: string;
}

export async function submitCleaningReport(input: SubmitCleaningReportInput) {
  await dbConnect();

  try {
    // Validate IDs format
    if (!Types.ObjectId.isValid(input.propertyId) || !Types.ObjectId.isValid(input.cleanerId)) {
      return { success: false, error: 'Invalid property or cleaner ID' };
    }

    // Server-side validation: Fetch and verify cleaner exists and is active
    const cleaner = await Cleaner.findById(input.cleanerId).lean();
    if (!cleaner || cleaner.status !== 'active') {
      return { success: false, error: 'Invalid or inactive cleaner account' };
    }

    // Server-side validation: Fetch and verify property exists
    const property = await Property.findById(input.propertyId).lean();
    if (!property) {
      return { success: false, error: 'Property not found' };
    }

    // Critical security check: Verify cleaner belongs to property's manager
    if (cleaner.managerId !== property.ownerId) {
      return { success: false, error: 'You are not authorized to submit reports for this property' };
    }

    // Create the cleaning report with server-verified data
    const report = await CleaningReport.create({
      propertyId: input.propertyId,
      cleanerId: cleaner._id.toString(),
      cleanerName: cleaner.name,
      checklist: input.checklist,
      maintenanceIssues: input.maintenanceIssues || [],
      notes: input.notes,
      completedAt: new Date(),
      items: [], // No inventory counts in simplified cleaner form
    });

    // Create supply requests for low items
    if (input.lowSupplies.length > 0) {
      const supplyRequests = input.lowSupplies.map(supply => ({
        ownerId: property.ownerId,
        propertyId: property._id.toString(),
        propertyName: property.name,
        sku: supply.sku,
        itemName: supply.name,
        currentCount: 0, // Unknown count from simplified form
        status: 'pending',
        requestedBy: cleaner._id.toString(),
        requestedByName: cleaner.name,
      }));

      await SupplyRequest.insertMany(supplyRequests);
    }

    // Update cleaner's last active time
    await Cleaner.findByIdAndUpdate(input.cleanerId, { lastActiveAt: new Date() });

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
