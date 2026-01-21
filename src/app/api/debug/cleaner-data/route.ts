import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SupplyRequest from "@/models/SupplyRequest";
import CleaningReport from "@/models/CleaningReport";
import Property from "@/models/Property";

// Debug endpoint to check cleaner submissions
// This helps verify the cleaner->admin data flow

export async function GET(request: Request) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const cleanerName = url.searchParams.get('cleaner');
    const propertyName = url.searchParams.get('property');

    // Get recent supply requests
    const supplyQuery: Record<string, unknown> = {};
    if (cleanerName) supplyQuery.requestedByName = { $regex: cleanerName, $options: 'i' };
    if (propertyName) supplyQuery.propertyName = { $regex: propertyName, $options: 'i' };

    const recentSupplyRequests = await SupplyRequest.find(supplyQuery)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Get recent cleaning reports
    const reportQuery: Record<string, unknown> = {};
    if (cleanerName) reportQuery.cleanerName = { $regex: cleanerName, $options: 'i' };

    const recentReports = await CleaningReport.find(reportQuery)
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get properties with owner info
    const properties = await Property.find()
      .select('name address ownerId')
      .lean();

    return NextResponse.json({
      supplyRequests: recentSupplyRequests.map(r => ({
        id: r._id.toString(),
        itemName: r.itemName,
        propertyName: r.propertyName,
        requestedByName: r.requestedByName,
        status: r.status,
        ownerId: r.ownerId,
        createdAt: r.createdAt
      })),
      cleaningReports: recentReports.map(r => ({
        id: r._id.toString(),
        propertyId: r.propertyId?.toString(),
        cleanerName: r.cleanerName,
        checklist: r.checklist,
        notes: r.notes,
        createdAt: r.createdAt
      })),
      properties: properties.map(p => ({
        id: p._id.toString(),
        name: p.name,
        address: p.address,
        ownerId: p.ownerId
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[debug/cleaner-data] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
