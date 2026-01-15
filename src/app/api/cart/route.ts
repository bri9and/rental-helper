import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { CartOrder } from "@/models/CartOrder";
import { getAuthUserId } from "@/lib/auth";

// GET - Fetch user's order history
export async function GET() {
  try {
    await dbConnect();

    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await CartOrder.find({ userId })
      .sort({ submittedAt: -1 })
      .limit(50)
      .lean();

    const formattedOrders = orders.map((order) => ({
      id: order._id.toString(),
      items: order.items,
      totalAmount: order.totalAmount,
      amazonCartUrl: order.amazonCartUrl,
      submittedAt: order.submittedAt,
    }));

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error("[API] Get cart history failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch order history" },
      { status: 500 }
    );
  }
}

// POST - Save a new cart order
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items, totalAmount, amazonCartUrl } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart items are required" },
        { status: 400 }
      );
    }

    if (typeof totalAmount !== "number" || totalAmount <= 0) {
      return NextResponse.json(
        { error: "Valid total amount is required" },
        { status: 400 }
      );
    }

    if (!amazonCartUrl || typeof amazonCartUrl !== "string") {
      return NextResponse.json(
        { error: "Amazon cart URL is required" },
        { status: 400 }
      );
    }

    const order = await CartOrder.create({
      userId,
      items,
      totalAmount,
      amazonCartUrl,
      submittedAt: new Date(),
    });

    return NextResponse.json({
      order: {
        id: order._id.toString(),
        items: order.items,
        totalAmount: order.totalAmount,
        amazonCartUrl: order.amazonCartUrl,
        submittedAt: order.submittedAt,
      },
    });
  } catch (error) {
    console.error("[API] Save cart order failed:", error);
    return NextResponse.json(
      { error: "Failed to save order" },
      { status: 500 }
    );
  }
}
