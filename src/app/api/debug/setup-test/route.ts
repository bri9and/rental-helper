import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Property from "@/models/Property";
import SupplyRequest from "@/models/SupplyRequest";

// Debug endpoint to set up test data
// For development/testing only

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action;

    await dbConnect();

    if (action === "assign_properties_to_user") {
      const targetUserId = body.targetUserId;
      if (!targetUserId) {
        return NextResponse.json({ error: "targetUserId required" }, { status: 400 });
      }

      // Update all properties to be owned by the specified user
      const result = await Property.updateMany(
        {},
        { $set: { ownerId: targetUserId } }
      );

      // Also update existing supply requests to use this owner
      await SupplyRequest.updateMany(
        {},
        { $set: { ownerId: targetUserId } }
      );

      return NextResponse.json({
        success: true,
        message: `Updated ${result.modifiedCount} properties to be owned by ${targetUserId}`,
        targetUserId
      });
    }

    if (action === "cleanup_test_requests") {
      // Remove test supply requests
      const result = await SupplyRequest.deleteMany({
        $or: [
          { sku: { $regex: /^TEST-/ } },
          { requestedByName: "Test Cleaner" }
        ]
      });

      return NextResponse.json({
        success: true,
        deleted: result.deletedCount
      });
    }

    if (action === "list_owners") {
      const properties = await Property.find().select('name ownerId').lean();
      return NextResponse.json({
        properties: properties.map(p => ({
          name: p.name,
          ownerId: p.ownerId
        }))
      });
    }

    return NextResponse.json({
      error: "Unknown action",
      availableActions: ["assign_properties_to_user", "cleanup_test_requests", "list_owners"]
    }, { status: 400 });
  } catch (error) {
    console.error('[debug/setup-test] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    usage: "POST with action",
    actions: {
      assign_properties_to_user: { action: "assign_properties_to_user", targetUserId: "user_xxx" },
      cleanup_test_requests: { action: "cleanup_test_requests" },
      list_owners: { action: "list_owners" }
    }
  });
}
